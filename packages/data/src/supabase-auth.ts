import type { AppRole } from "@family-support/core";
import type { User } from "@supabase/supabase-js";
import {
  authenticateDemoUser,
  getDemoAuthUserById,
  type PublicAuthUser,
} from "./auth-store";
import type { ChildProfile } from "./local-store";
import {
  createSupabaseAdminClient,
  createSupabaseAnonClient,
  createSupabaseUserClient,
  hasSupabaseAuth,
} from "./supabase-server";
import {
  DEMO_ACCOUNT_EMAILS,
  DEMO_PROFILE_IDS,
  isDemoAccountEmail,
  isDemoAccountId,
} from "./demo-accounts";

/** @deprecated Use isDemoAccountEmail — only @demo.com accounts are demo. */
export const DEMO_AUTH_EMAILS = new Set<string>();

export type AuthSessionTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export type BridgeAuthUser = {
  id: string;
  email: string;
  name: string;
  role: AppRole;
  mustChangePassword: boolean;
  isDemo: boolean;
  onboardingComplete?: boolean;
};

export type OnboardingIntakeInput = {
  pathwayId: string;
  setupRole: string;
  safetyAcceptedAt: string;
  termsAcceptedAt?: string;
};

export type CreateChildProfileInput = {
  profileName: string;
  ageGroup: "child" | "teen" | "adult";
  supportNotes?: string;
  setupRole: "self" | "family" | "professional";
};

export function isDemoAuthEmail(email: string): boolean {
  return isDemoAccountEmail(email);
}

export function isDemoAuthUserId(userId: string): boolean {
  return isDemoAccountId(userId);
}

export function toBridgeAuthUser(user: PublicAuthUser): BridgeAuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
    isDemo: isDemoAuthUserId(user.id) || isDemoAuthEmail(user.email),
    onboardingComplete: user.onboardingComplete,
  };
}

export function demoLogin(email: string, password: string): BridgeAuthUser | null {
  const user = authenticateDemoUser(email, password);
  return user ? toBridgeAuthUser(user) : null;
}

export function demoSessionUser(userId: string): BridgeAuthUser | null {
  const user = getDemoAuthUserById(userId);
  return user ? toBridgeAuthUser(user) : null;
}

function mapDbRole(role: string | null | undefined): AppRole {
  const allowed: AppRole[] = [
    "child_user",
    "parent_guardian",
    "caregiver_therapist_teacher",
    "admin",
    "super_admin",
  ];
  return allowed.includes(role as AppRole) ? (role as AppRole) : "parent_guardian";
}

async function fetchBridgeUserRow(authUserId: string) {
  const admin = createSupabaseAdminClient();
  if (!admin) return null;
  const { data, error } = await admin
    .from("users")
    .select("id,email,full_name,role,onboarding_complete")
    .eq("id", authUserId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function bridgeUserFromSupabaseUser(
  authUser: User,
  accessToken?: string
): Promise<BridgeAuthUser> {
  let row = await fetchBridgeUserRow(authUser.id);

  if (!row) {
    const admin = createSupabaseAdminClient();
    if (!admin) throw new Error("Supabase admin client is not configured.");
    const meta = authUser.user_metadata ?? {};
    const role = mapDbRole(typeof meta.role === "string" ? meta.role : "parent_guardian");
    const { error } = await admin.from("users").insert({
      id: authUser.id,
      email: authUser.email ?? "",
      full_name: typeof meta.full_name === "string" ? meta.full_name : authUser.email ?? "Bridge user",
      role,
      onboarding_complete: false,
    });
    if (error) throw new Error(error.message);
    row = await fetchBridgeUserRow(authUser.id);
  }

  if (!row) throw new Error("Could not load user profile.");

  const meta = authUser.user_metadata ?? {};
  const mustChangePassword =
    meta.must_change_password === true ||
    (typeof row === "object" &&
      row !== null &&
      "must_change_password" in row &&
      Boolean((row as { must_change_password?: boolean }).must_change_password));

  return {
    id: row.id,
    email: row.email,
    name: row.full_name,
    role: mapDbRole(row.role),
    mustChangePassword,
    isDemo: isDemoAccountEmail(row.email) || isDemoAuthUserId(row.id),
    onboardingComplete: Boolean(row.onboarding_complete),
  };
}

export async function supabaseSignIn(
  email: string,
  password: string
): Promise<{ user: BridgeAuthUser; tokens: AuthSessionTokens }> {
  const normalized = email.trim().toLowerCase();

  if (isDemoAccountEmail(normalized)) {
    const demo = demoLogin(normalized, password);
    if (!demo) throw new Error("Invalid email or password.");
    return {
      user: demo,
      tokens: { accessToken: "", refreshToken: "", expiresIn: 0 },
    };
  }

  if (!hasSupabaseAuth) {
    throw new Error("Invalid email or password.");
  }

  const anon = createSupabaseAnonClient();
  if (!anon) throw new Error("Supabase client is not configured.");

  const { data, error } = await anon.auth.signInWithPassword({ email: normalized, password });
  if (error || !data.session || !data.user) {
    throw new Error(error?.message ?? "Invalid email or password.");
  }

  const user = await bridgeUserFromSupabaseUser(data.user, data.session.access_token);
  return {
    user,
    tokens: {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresIn: data.session.expires_in ?? 3600,
    },
  };
}

export async function supabaseSignUp(input: {
  email: string;
  password: string;
  name: string;
  role: AppRole;
  intake?: OnboardingIntakeInput;
  childProfile?: CreateChildProfileInput;
}): Promise<{ user: BridgeAuthUser; tokens: AuthSessionTokens }> {
  const email = input.email.trim().toLowerCase();
  if (isDemoAccountEmail(email)) {
    throw new Error("Demo accounts use the investor demo sign-in. Real sign-up requires a non-@demo.com email.");
  }
  if (!hasSupabaseAuth) {
    throw new Error("Supabase authentication is not configured for production sign-up.");
  }

  const admin = createSupabaseAdminClient();
  const anon = createSupabaseAnonClient();
  if (!admin || !anon) throw new Error("Supabase client is not configured.");

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      full_name: input.name,
      role: input.role,
    },
  });
  if (createError || !created.user) {
    throw new Error(createError?.message ?? "Could not create account.");
  }

  const authUserId = created.user.id;

  const { error: userRowError } = await admin.from("users").insert({
    id: authUserId,
    email,
    full_name: input.name,
    role: input.role,
    onboarding_complete: Boolean(input.childProfile),
  });
  if (userRowError) throw new Error(userRowError.message);

  if (input.intake) {
    const { error: intakeError } = await admin.from("onboarding_intake").insert({
      user_id: authUserId,
      pathway_id: input.intake.pathwayId,
      setup_role: input.intake.setupRole,
      safety_accepted_at: input.intake.safetyAcceptedAt,
      terms_accepted_at: input.intake.termsAcceptedAt ?? new Date().toISOString(),
    });
    if (intakeError) throw new Error(intakeError.message);
  }

  if (input.childProfile) {
    await createPersistedChildProfile(authUserId, input.role, input.childProfile);
    await admin.from("users").update({ onboarding_complete: true }).eq("id", authUserId);
  }

  const { data: signInData, error: signInError } = await anon.auth.signInWithPassword({
    email,
    password: input.password,
  });
  if (signInError || !signInData.session || !signInData.user) {
    throw new Error(signInError?.message ?? "Account created but sign-in failed.");
  }

  const user = await bridgeUserFromSupabaseUser(signInData.user, signInData.session.access_token);
  return {
    user,
    tokens: {
      accessToken: signInData.session.access_token,
      refreshToken: signInData.session.refresh_token,
      expiresIn: signInData.session.expires_in ?? 3600,
    },
  };
}

export async function createPersistedChildProfile(
  authUserId: string,
  role: AppRole,
  input: CreateChildProfileInput
): Promise<ChildProfile> {
  const admin = createSupabaseAdminClient();
  if (!admin) throw new Error("Supabase admin client is not configured.");

  const safetyAcceptedAt = new Date().toISOString();
  const { data: profileRow, error: profileError } = await admin
    .from("profiles")
    .insert({
      user_id: authUserId,
      display_name: input.profileName,
      mode: input.ageGroup,
      safety_disclaimer_accepted_at: safetyAcceptedAt,
    })
    .select("id,display_name,mode")
    .single();
  if (profileError || !profileRow) throw new Error(profileError?.message ?? "Could not create profile.");

  const { data: childRow, error: childError } = await admin
    .from("child_profiles")
    .insert({
      profile_id: profileRow.id,
      support_notes: input.supportNotes ?? "",
      communication_style: input.setupRole === "self" ? "self-managed" : "caregiver-supported",
    })
    .select("id,support_notes")
    .single();
  if (childError || !childRow) throw new Error(childError?.message ?? "Could not create child profile.");

  if (role === "parent_guardian") {
    const { error: linkError } = await admin.from("parent_child_links").insert({
      parent_user_id: authUserId,
      child_profile_id: childRow.id,
    });
    if (linkError) throw new Error(linkError.message);
  } else if (role === "caregiver_therapist_teacher") {
    const { error: linkError } = await admin.from("caregiver_links").insert({
      caregiver_user_id: authUserId,
      child_profile_id: childRow.id,
      invited_by_user_id: authUserId,
    });
    if (linkError) throw new Error(linkError.message);
  }

  return {
    id: childRow.id,
    name: profileRow.display_name,
    ageGroup: input.ageGroup,
    mode: profileRow.mode,
    supportNotes: childRow.support_notes ?? "",
  };
}

export async function markPersistedSetupComplete(authUserId: string): Promise<void> {
  const admin = createSupabaseAdminClient();
  if (!admin) throw new Error("Supabase admin client is not configured.");
  const { error } = await admin
    .from("users")
    .update({ onboarding_complete: true, updated_at: new Date().toISOString() })
    .eq("id", authUserId);
  if (error) throw new Error(error.message);
}

const ACCESS_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomAccessCodeBlock(length = 4): string {
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += ACCESS_CODE_CHARS[Math.floor(Math.random() * ACCESS_CODE_CHARS.length)];
  }
  return out;
}

function createCandidateAccessCode(): string {
  return `BR-${randomAccessCodeBlock()}-${randomAccessCodeBlock()}`;
}

export async function createPersistedAccessCode(
  childProfileId: string,
  createdByUserId: string
): Promise<string> {
  const admin = createSupabaseAdminClient();
  if (!admin) throw new Error("Supabase admin client is not configured.");

  const { data: existing, error: existingError } = await admin
    .from("access_codes")
    .select("code")
    .eq("child_profile_id", childProfileId)
    .eq("active", true)
    .maybeSingle();
  if (existingError) throw new Error(existingError.message);
  if (existing?.code) return existing.code;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = createCandidateAccessCode();
    const { error } = await admin.from("access_codes").insert({
      code,
      child_profile_id: childProfileId,
      created_by_user_id: createdByUserId,
      active: true,
    });

    if (!error) return code;
    if (error.code !== "23505") throw new Error(error.message);
  }

  throw new Error("Could not generate a unique access code. Please try again.");
}

export async function getPersistedAccessCodeForProfile(
  childProfileId: string
): Promise<string | null> {
  const admin = createSupabaseAdminClient();
  if (!admin) return null;

  const { data, error } = await admin
    .from("access_codes")
    .select("code")
    .eq("child_profile_id", childProfileId)
    .eq("active", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data?.code ?? null;
}

export async function redeemPersistedAccessCode(
  code: string,
  userId: string,
  relationship: "parent" | "therapist" | "self"
): Promise<string> {
  const admin = createSupabaseAdminClient();
  if (!admin) throw new Error("Supabase admin client is not configured.");

  const normalized = code.trim().toUpperCase();
  const { data: record, error: recordError } = await admin
    .from("access_codes")
    .select("child_profile_id,created_by_user_id,active")
    .eq("code", normalized)
    .eq("active", true)
    .maybeSingle();
  if (recordError) throw new Error(recordError.message);
  if (!record?.child_profile_id) {
    throw new Error("Invalid access code. Check the code and try again.");
  }

  if (relationship === "parent") {
    const { data: existing, error: existingError } = await admin
      .from("parent_child_links")
      .select("id")
      .eq("parent_user_id", userId)
      .eq("child_profile_id", record.child_profile_id)
      .maybeSingle();
    if (existingError) throw new Error(existingError.message);
    if (!existing) {
      const { error: linkError } = await admin.from("parent_child_links").insert({
        parent_user_id: userId,
        child_profile_id: record.child_profile_id,
      });
      if (linkError) throw new Error(linkError.message);
    }
  } else if (relationship === "therapist") {
    const { data: existing, error: existingError } = await admin
      .from("caregiver_links")
      .select("id")
      .eq("caregiver_user_id", userId)
      .eq("child_profile_id", record.child_profile_id)
      .maybeSingle();
    if (existingError) throw new Error(existingError.message);
    if (!existing) {
      const { error: linkError } = await admin.from("caregiver_links").insert({
        caregiver_user_id: userId,
        child_profile_id: record.child_profile_id,
        invited_by_user_id: record.created_by_user_id,
      });
      if (linkError) throw new Error(linkError.message);
    }
  } else {
    throw new Error("Access codes can only be redeemed by parents and care-team members.");
  }

  return record.child_profile_id;
}

function modeToAgeGroup(mode: string): "child" | "teen" | "adult" {
  if (mode === "teen" || mode === "adult" || mode === "child") return mode;
  return "child";
}

export async function fetchPersistedChildProfiles(
  authUserId: string,
  role: AppRole
): Promise<ChildProfile[]> {
  if (isDemoAuthUserId(authUserId)) {
    const { getDemoChildProfiles } = await import("./local-store");
    return getDemoChildProfiles();
  }

  const admin = createSupabaseAdminClient();
  if (!admin) return [];

  let childIds: string[] = [];

  if (role === "parent_guardian" || role === "admin" || role === "super_admin") {
    const { data, error } = await admin
      .from("parent_child_links")
      .select("child_profile_id")
      .eq("parent_user_id", authUserId);
    if (error) throw new Error(error.message);
    childIds = (data ?? []).map((row) => row.child_profile_id);
  } else if (role === "caregiver_therapist_teacher") {
    const { data, error } = await admin
      .from("caregiver_links")
      .select("child_profile_id")
      .eq("caregiver_user_id", authUserId);
    if (error) throw new Error(error.message);
    childIds = (data ?? []).map((row) => row.child_profile_id);
  } else if (role === "child_user") {
    const { data, error } = await admin
      .from("profiles")
      .select("child_profiles(id)")
      .eq("user_id", authUserId);
    if (error) throw new Error(error.message);
    childIds = (data ?? []).flatMap((row) => {
      const children = row.child_profiles as { id: string }[] | { id: string } | null;
      if (!children) return [];
      return Array.isArray(children) ? children.map((c) => c.id) : [children.id];
    });
  }

  if (!childIds.length) return [];

  const { data: children, error: childError } = await admin
    .from("child_profiles")
    .select("id,support_notes, profiles(display_name,mode)")
    .in("id", childIds);
  if (childError) throw new Error(childError.message);

  return (children ?? [])
    .map((child) => {
      const profile = child.profiles as unknown as { display_name: string; mode: string } | null;
      if (!profile) return null;
      return {
        id: child.id,
        name: profile.display_name,
        ageGroup: modeToAgeGroup(profile.mode),
        mode: profile.mode,
        supportNotes: child.support_notes ?? "",
      } satisfies ChildProfile;
    })
    .filter((p): p is ChildProfile => Boolean(p));
}

export async function userCanAccessPersistedProfile(
  authUserId: string,
  role: AppRole,
  childProfileId: string
): Promise<boolean> {
  if (role === "admin" || role === "super_admin") return true;
  if (isDemoAuthUserId(authUserId)) {
    return DEMO_PROFILE_IDS.has(childProfileId);
  }
  const profiles = await fetchPersistedChildProfiles(authUserId, role);
  return profiles.some((p) => p.id === childProfileId);
}

export async function getDashboardSnapshotForProfile(
  childProfileId: string,
  childName: string
) {
  const { getEmptyDashboard } = await import("./local-store");
  const admin = createSupabaseAdminClient();
  if (!admin) return getEmptyDashboard(childProfileId, childName);

  const [
    routines,
    completions,
    emotions,
    checkIns,
    goals,
    tasks,
  ] = await Promise.all([
    admin
      .from("routines")
      .select("id", { count: "exact", head: true })
      .eq("child_profile_id", childProfileId)
      .eq("active", true),
    admin
      .from("task_completions")
      .select("id", { count: "exact", head: true })
      .eq("child_profile_id", childProfileId),
    admin
      .from("emotions")
      .select("label")
      .eq("child_profile_id", childProfileId),
    admin
      .from("check_ins")
      .select("id", { count: "exact", head: true })
      .eq("child_profile_id", childProfileId),
    admin
      .from("goals")
      .select("current_metric", { count: "exact" })
      .eq("child_profile_id", childProfileId)
      .gte("current_metric", 3),
    admin.from("tasks").select("status").eq("child_profile_id", childProfileId),
  ]);

  const taskRows = tasks.data ?? [];
  const completed = taskRows.filter((t) => t.status === "completed").length;
  const total = taskRows.length;
  const emotionRows = emotions.data ?? [];
  const emotionCounts: Record<string, number> = {};
  for (const row of emotionRows) {
    emotionCounts[row.label] = (emotionCounts[row.label] ?? 0) + 1;
  }

  const hasActivity =
    total > 0 ||
    (completions.count ?? 0) > 0 ||
    (checkIns.count ?? 0) > 0 ||
    (goals.count ?? 0) > 0 ||
    emotionRows.length > 0;

  if (!hasActivity) {
    return getEmptyDashboard(childProfileId, childName);
  }

  const colors: Record<string, string> = {
    Happy: "#6366f1",
    Calm: "#10b981",
    Anxious: "#f59e0b",
    Sad: "#3b82f6",
    Overwhelmed: "#ef4444",
  };

  return {
    ...(await import("./local-store")).getEmptyDashboard(childProfileId, childName),
    tasksCompletedPct: total ? Math.round((completed / total) * 100) : 0,
    routinesCompletedPct: 0,
    checkInsCount: checkIns.count ?? 0,
    newSkillsCount: goals.count ?? 0,
    routinesDue: routines.count ?? 0,
    tasksCompletedToday: completions.count ?? 0,
    tasksSkipped: taskRows.filter((t) => t.status === "skipped").length,
    emotionCheckIns: emotionRows.length,
    completionRate: total ? Math.round((completed / total) * 100) : 0,
    emotionBreakdown: Object.entries(emotionCounts).map(([label, count]) => ({
      label,
      count,
      color: colors[label] ?? "#8b8499",
    })),
  };
}

export async function resolveSupabaseSession(
  accessToken: string,
  refreshToken?: string
): Promise<{ user: BridgeAuthUser; tokens?: AuthSessionTokens } | null> {
  if (!accessToken || !hasSupabaseAuth) return null;

  const userClient = createSupabaseUserClient(accessToken);
  if (!userClient) return null;

  let { data, error } = await userClient.auth.getUser();
  if ((error || !data.user) && refreshToken) {
    const anon = createSupabaseAnonClient();
    if (!anon) return null;
    const refreshed = await anon.auth.refreshSession({ refresh_token: refreshToken });
    if (refreshed.data.session && refreshed.data.user) {
      const user = await bridgeUserFromSupabaseUser(
        refreshed.data.user,
        refreshed.data.session.access_token
      );
      return {
        user,
        tokens: {
          accessToken: refreshed.data.session.access_token,
          refreshToken: refreshed.data.session.refresh_token,
          expiresIn: refreshed.data.session.expires_in ?? 3600,
        },
      };
    }
    return null;
  }

  if (!data?.user) return null;
  const user = await bridgeUserFromSupabaseUser(data.user, accessToken);
  return { user };
}

export async function supabaseSignOut(accessToken?: string): Promise<void> {
  if (!accessToken) return;
  const client = createSupabaseUserClient(accessToken);
  if (!client) return;
  await client.auth.signOut();
}

export async function provisionPlatformAdmin(input: {
  email: string;
  password: string;
  name: string;
  role?: AppRole;
}): Promise<{ userId: string; created: boolean }> {
  const admin = createSupabaseAdminClient();
  if (!admin) throw new Error("Supabase admin client is not configured.");

  const email = input.email.trim().toLowerCase();
  const role = input.role ?? "super_admin";

  const { data: existingRow, error: existingError } = await admin
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existingError) throw new Error(existingError.message);

  let authUserId = existingRow?.id;
  if (!authUserId) {
    let page = 1;
    while (page <= 10) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) throw new Error(error.message);
      const match = data.users.find((user) => user.email?.toLowerCase() === email);
      if (match) {
        authUserId = match.id;
        break;
      }
      if (data.users.length < 200) break;
      page += 1;
    }
  }

  if (authUserId) {
    const { error: authError } = await admin.auth.admin.updateUserById(authUserId, {
      password: input.password,
      email_confirm: true,
      user_metadata: {
        full_name: input.name,
        role,
        must_change_password: true,
      },
    });
    if (authError) throw new Error(authError.message);

    const profilePayload = {
      id: authUserId,
      email,
      full_name: input.name,
      role,
      must_change_password: true,
      onboarding_complete: true,
      updated_at: new Date().toISOString(),
    };

    const { error: userError } = existingRow?.id
      ? await admin.from("users").update(profilePayload).eq("id", authUserId)
      : await admin.from("users").upsert(profilePayload, { onConflict: "id" });
    if (userError) {
      if (!userError.message.includes("must_change_password")) throw new Error(userError.message);
      const { must_change_password: _flag, ...withoutFlag } = profilePayload;
      const retry = existingRow?.id
        ? await admin.from("users").update(withoutFlag).eq("id", authUserId)
        : await admin.from("users").upsert(withoutFlag, { onConflict: "id" });
      if (retry.error) throw new Error(retry.error.message);
    }

    return { userId: authUserId, created: false };
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      full_name: input.name,
      role,
      must_change_password: true,
    },
  });
  if (createError || !created.user) {
    throw new Error(createError?.message ?? "Could not create admin account.");
  }

  const newUserId = created.user.id;
  const { error: userRowError } = await admin.from("users").insert({
    id: newUserId,
    email,
    full_name: input.name,
    role,
    onboarding_complete: true,
    must_change_password: true,
  });
  if (userRowError) {
    if (!userRowError.message.includes("must_change_password")) throw new Error(userRowError.message);
    const { error: fallbackError } = await admin.from("users").insert({
      id: newUserId,
      email,
      full_name: input.name,
      role,
      onboarding_complete: true,
    });
    if (fallbackError) throw new Error(fallbackError.message);
  }

  return { userId: newUserId, created: true };
}

export async function supabaseChangePassword(input: {
  accessToken: string;
  authUserId: string;
  email: string;
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  if (input.newPassword.length < 8) {
    throw new Error("New password must be at least 8 characters.");
  }
  if (input.newPassword === "password123") {
    throw new Error("Choose a password different from the temporary one.");
  }

  const anon = createSupabaseAnonClient();
  const admin = createSupabaseAdminClient();
  if (!anon || !admin) throw new Error("Supabase client is not configured.");

  const { error: verifyError } = await anon.auth.signInWithPassword({
    email: input.email.trim().toLowerCase(),
    password: input.currentPassword,
  });
  if (verifyError) throw new Error("Current password is incorrect.");

  const { data: currentUser, error: currentUserError } = await admin.auth.admin.getUserById(input.authUserId);
  if (currentUserError || !currentUser.user) {
    throw new Error(currentUserError?.message ?? "Could not load account.");
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(input.authUserId, {
    password: input.newPassword,
    user_metadata: {
      ...(currentUser.user.user_metadata ?? {}),
      must_change_password: false,
    },
  });
  if (updateError) throw new Error(updateError.message);

  const { error: flagError } = await admin
    .from("users")
    .update({
      must_change_password: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.authUserId);
  if (flagError && !flagError.message.includes("must_change_password")) {
    throw new Error(flagError.message);
  }
}
