import type { AppRole, UserActivityEvent } from "@family-support/core";
import type { BridgeGroup, ErrorLogSeverity } from "@family-support/core";
import { DEMO_ACCOUNT_EMAILS } from "./demo-accounts";
import { createSupabaseAdminClient } from "./supabase-server";

export type ProductionAdminUser = {
  id: string;
  email: string;
  name: string;
  role: AppRole;
  mustChangePassword: boolean;
  onboardingComplete: boolean;
  status: "active" | "suspended" | "disabled";
  isDemo: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  lastActivityAt: string | null;
  bridgeGroups: Array<{
    id: string;
    displayName: string;
    isDemo: boolean;
    members: unknown[];
  }>;
  credits: number;
};

export type ProductionBridgeOverview = {
  totalGroups: number;
  activeGroups: number;
  demoGroups: number;
  totalMembers: number;
  activeCodes: number;
};

function isAppRole(role: string | null | undefined): role is AppRole {
  return (
    role === "child_user" ||
    role === "parent_guardian" ||
    role === "caregiver_therapist_teacher" ||
    role === "admin" ||
    role === "super_admin"
  );
}

export function isProductionDemoEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return DEMO_ACCOUNT_EMAILS.has(normalized) || normalized.endsWith("@demo.com") || normalized.endsWith("@test.com");
}

function isUuid(value: string | null | undefined): value is string {
  return Boolean(
    value &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
}

export async function listProductionAdminUsers(options?: {
  includeDemo?: boolean;
  email?: string;
  name?: string;
  role?: string;
  status?: string;
}): Promise<ProductionAdminUser[] | null> {
  const admin = createSupabaseAdminClient();
  if (!admin) return null;

  let query = admin
    .from("users")
    .select(
      "id,email,full_name,role,onboarding_complete,created_at,status,is_demo,last_login_at,last_activity_at,must_change_password"
    )
    .order("created_at", { ascending: false });

  if (options?.email) query = query.ilike("email", `%${options.email}%`);
  if (options?.name) query = query.ilike("full_name", `%${options.name}%`);
  if (options?.role) query = query.eq("role", options.role);
  if (options?.status) query = query.eq("status", options.status);

  const { data, error } = await query;
  if (error || !data) {
    console.warn("Production admin users could not be loaded:", error?.message);
    return null;
  }

  return data
    .filter((row) => options?.includeDemo || (!row.is_demo && !isProductionDemoEmail(row.email)))
    .map((row) => ({
      id: row.id,
      email: row.email,
      name: row.full_name ?? row.email,
      role: isAppRole(row.role) ? row.role : "parent_guardian",
      mustChangePassword: Boolean(row.must_change_password),
      onboardingComplete: Boolean(row.onboarding_complete),
      status: (row.status ?? "active") as "active" | "suspended" | "disabled",
      isDemo: Boolean(row.is_demo) || isProductionDemoEmail(row.email),
      createdAt: row.created_at,
      lastLoginAt: row.last_login_at ?? null,
      lastActivityAt: row.last_activity_at ?? null,
      bridgeGroups: [],
      credits: 0,
    }));
}

export async function getProductionActivity(options?: {
  limit?: number;
  userId?: string;
  email?: string;
  eventType?: string;
  bridgeGroupId?: string;
  includeDemo?: boolean;
}): Promise<UserActivityEvent[] | null> {
  const admin = createSupabaseAdminClient();
  if (!admin) return null;

  let query = admin
    .from("user_activity_events")
    .select("id,user_id,email,bridge_group_id,event_type,detail,created_at")
    .order("created_at", { ascending: false })
    .limit(options?.limit ?? 100);

  if (isUuid(options?.userId)) query = query.eq("user_id", options!.userId);
  if (options?.email) query = query.ilike("email", `%${options.email}%`);
  if (options?.eventType) query = query.eq("event_type", options.eventType);
  if (isUuid(options?.bridgeGroupId)) query = query.eq("bridge_group_id", options!.bridgeGroupId);

  const { data, error } = await query;
  if (error || !data) {
    console.warn("Production activity could not be loaded:", error?.message);
    return null;
  }

  return data
    .filter((row) => options?.includeDemo || !row.email || !isProductionDemoEmail(row.email))
    .map((row) => ({
      id: row.id,
      userId: row.user_id,
      email: row.email,
      bridgeGroupId: row.bridge_group_id,
      eventType: row.event_type,
      detail: row.detail,
      createdAt: row.created_at,
    }));
}

export async function recordProductionActivity(input: {
  userId?: string | null;
  email?: string | null;
  bridgeGroupId?: string | null;
  eventType: string;
  detail?: string | null;
}) {
  const admin = createSupabaseAdminClient();
  if (!admin) return;

  const userId = isUuid(input.userId) ? input.userId : null;
  const now = new Date().toISOString();
  const { error } = await admin.from("user_activity_events").insert({
    user_id: userId,
    email: input.email ?? null,
    bridge_group_id: isUuid(input.bridgeGroupId) ? input.bridgeGroupId : null,
    event_type: input.eventType,
    detail: input.detail ?? null,
    metadata: {},
    created_at: now,
  });
  if (error) {
    console.warn("Production activity was not recorded:", error.message);
    return;
  }

  if (userId) {
    const patch: Record<string, string> = { last_activity_at: now, updated_at: now };
    if (input.eventType === "login") patch.last_login_at = now;
    await admin.from("users").update(patch).eq("id", userId);
  }
}

export async function countProductionProfilesSince(since: Date, includeDemo = false): Promise<number | null> {
  const admin = createSupabaseAdminClient();
  if (!admin) return null;

  const query = admin
    .from("child_profiles")
    .select("id,profiles!inner(user_id,users!inner(email,is_demo))", { count: "exact", head: true })
    .gte("created_at", since.toISOString());

  const { count, error } = await query;
  if (error) {
    console.warn("Production profile count could not be loaded:", error.message);
    return null;
  }
  if (includeDemo) return count ?? 0;
  return count ?? 0;
}

export async function getProductionQuickSetupIncompleteCount(users: ProductionAdminUser[]): Promise<number | null> {
  const admin = createSupabaseAdminClient();
  if (!admin) return null;
  const accountableUsers = users.filter(
    (u) => u.role === "parent_guardian" || u.role === "caregiver_therapist_teacher"
  );
  if (accountableUsers.length === 0) return 0;

  const { data, error } = await admin
    .from("quick_setup_status")
    .select("user_id,status")
    .in(
      "user_id",
      accountableUsers.map((u) => u.id)
    );
  if (error) {
    console.warn("Production quick setup status could not be loaded:", error.message);
    return null;
  }

  const completed = new Set((data ?? []).filter((row) => row.status === "completed").map((row) => row.user_id));
  return accountableUsers.filter((u) => !completed.has(u.id)).length;
}

export async function getProductionErrorCountsBySeverity(): Promise<Record<ErrorLogSeverity, number> | null> {
  const admin = createSupabaseAdminClient();
  if (!admin) return null;
  const { data, error } = await admin
    .from("error_logs")
    .select("severity,status")
    .neq("status", "resolved");
  if (error || !data) {
    console.warn("Production error counts could not be loaded:", error?.message);
    return null;
  }
  const counts: Record<ErrorLogSeverity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  };
  for (const row of data) {
    if (row.severity in counts) counts[row.severity as ErrorLogSeverity]++;
  }
  return counts;
}

export async function listProductionErrorLogs(options?: {
  severity?: string;
  status?: string;
  route?: string;
  query?: string;
  limit?: number;
  offset?: number;
}) {
  const admin = createSupabaseAdminClient();
  if (!admin) return null;
  let query = admin
    .from("error_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(options?.offset ?? 0, (options?.offset ?? 0) + (options?.limit ?? 50) - 1);

  if (options?.severity) query = query.eq("severity", options.severity);
  if (options?.status) query = query.eq("status", options.status);
  if (options?.route) query = query.ilike("route", `%${options.route}%`);
  if (options?.query) query = query.ilike("message", `%${options.query}%`);

  const { data, error, count } = await query;
  if (error || !data) {
    console.warn("Production error logs could not be loaded:", error?.message);
    return null;
  }
  return {
    total: count ?? data.length,
    items: data.map((row) => ({
      id: row.id,
      severity: row.severity,
      status: row.status,
      service: row.service,
      message: row.message,
      stackTrace: row.stack_trace ?? null,
      userId: row.user_id ?? null,
      route: row.route ?? null,
      requestId: row.request_id ?? null,
      environment: row.environment ?? null,
      notes: row.notes ?? null,
      createdAt: row.created_at,
      resolvedAt: row.resolved_at ?? null,
    })),
  };
}

export async function listProductionBridgeGroups(options?: { includeDemo?: boolean }): Promise<{
  groups: BridgeGroup[];
  overview: ProductionBridgeOverview;
} | null> {
  const admin = createSupabaseAdminClient();
  if (!admin) return null;

  const { data: groups, error: groupsError } = await admin
    .from("bridge_groups")
    .select("id,display_name,center_user_id,center_child_profile_id,created_by,status,is_demo,created_at,updated_at")
    .order("created_at", { ascending: false });
  if (groupsError || !groups) {
    console.warn("Production bridge groups could not be loaded:", groupsError?.message);
    return null;
  }

  const visibleGroups = groups.filter((row) => options?.includeDemo || !row.is_demo);
  const { count: memberCount } = await admin
    .from("bridge_group_members")
    .select("id", { count: "exact", head: true })
    .eq("status", "active");
  const { count: codeCount } = await admin
    .from("bridge_access_codes")
    .select("id", { count: "exact", head: true })
    .is("revoked_at", null)
    .is("redeemed_at", null);

  const mappedGroups: BridgeGroup[] = visibleGroups.map((row) => ({
    id: row.id,
    displayName: row.display_name,
    centerUserId: row.center_user_id,
    centerChildProfileId: row.center_child_profile_id,
    createdBy: row.created_by,
    status: row.status,
    isDemo: Boolean(row.is_demo),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  return {
    groups: mappedGroups,
    overview: {
      totalGroups: visibleGroups.length,
      activeGroups: visibleGroups.filter((row) => row.status === "active").length,
      demoGroups: groups.filter((row) => row.is_demo).length,
      totalMembers: memberCount ?? 0,
      activeCodes: codeCount ?? 0,
    },
  };
}
