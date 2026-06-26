import type { AppRole } from "@family-support/core";
import { createSupabaseAdminClient } from "./supabase-server";

export type QuickSetupStatus = "not_started" | "in_progress" | "skipped" | "completed";

export type QuickSetupEventType =
  | "quick_setup_incomplete"
  | "quick_setup_skipped"
  | "quick_setup_remind_later"
  | "quick_setup_started"
  | "quick_setup_completed";

export type QuickSetupRecord = {
  userId: string;
  childProfileId: string | null;
  status: QuickSetupStatus;
  checklist: Record<string, boolean>;
  skippedAt: string | null;
  remindedAt: string | null;
  completedAt: string | null;
};

export type NotificationPreferences = {
  setupReminders: boolean;
  careTeamActivity: boolean;
  weeklySummary: boolean;
  goalRoutineReminders: boolean;
  safetyAlerts: boolean;
};

const defaultPreferences: NotificationPreferences = {
  setupReminders: true,
  careTeamActivity: true,
  weeklySummary: true,
  goalRoutineReminders: true,
  safetyAlerts: true,
};

export async function getQuickSetupStatus(userId: string, childProfileId?: string | null): Promise<QuickSetupRecord | null> {
  const admin = createSupabaseAdminClient();
  if (!admin) return null;

  let query = admin.from("quick_setup_status").select("*").eq("user_id", userId);
  if (childProfileId) query = query.eq("child_profile_id", childProfileId);
  const { data } = await query.maybeSingle();
  if (!data) return null;

  return {
    userId: data.user_id,
    childProfileId: data.child_profile_id,
    status: data.status as QuickSetupStatus,
    checklist: (data.checklist as Record<string, boolean>) ?? {},
    skippedAt: data.skipped_at,
    remindedAt: data.reminded_at,
    completedAt: data.completed_at,
  };
}

export async function upsertQuickSetupStatus(input: {
  userId: string;
  childProfileId?: string | null;
  status: QuickSetupStatus;
  checklist?: Record<string, boolean>;
  skippedAt?: string | null;
  remindedAt?: string | null;
  completedAt?: string | null;
}) {
  const admin = createSupabaseAdminClient();
  if (!admin) return null;

  const row = {
    user_id: input.userId,
    child_profile_id: input.childProfileId ?? null,
    status: input.status,
    checklist: input.checklist ?? {},
    skipped_at: input.skippedAt ?? null,
    reminded_at: input.remindedAt ?? null,
    completed_at: input.completedAt ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await admin
    .from("quick_setup_status")
    .upsert(row, { onConflict: "user_id,child_profile_id" })
    .select("*")
    .maybeSingle();
  if (error) {
    console.warn("Quick setup status was not saved:", error.message);
    return null;
  }
  return data;
}

export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
  const admin = createSupabaseAdminClient();
  if (!admin) return defaultPreferences;

  const { data } = await admin
    .from("user_notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) return defaultPreferences;
  return {
    setupReminders: Boolean(data.setup_reminders),
    careTeamActivity: Boolean(data.care_team_activity),
    weeklySummary: Boolean(data.weekly_summary),
    goalRoutineReminders: Boolean(data.goal_routine_reminders),
    safetyAlerts: Boolean(data.safety_alerts),
  };
}

export async function saveNotificationPreferences(userId: string, prefs: NotificationPreferences) {
  const admin = createSupabaseAdminClient();
  if (!admin) return false;

  const { error } = await admin.from("user_notification_preferences").upsert({
    user_id: userId,
    setup_reminders: prefs.setupReminders,
    care_team_activity: prefs.careTeamActivity,
    weekly_summary: prefs.weeklySummary,
    goal_routine_reminders: prefs.goalRoutineReminders,
    safety_alerts: prefs.safetyAlerts,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    console.warn("Notification preferences were not saved:", error.message);
    return false;
  }
  return true;
}

async function shouldEmitAdminEvent(dedupeKey: string): Promise<boolean> {
  const admin = createSupabaseAdminClient();
  if (!admin) return true;

  const { data } = await admin
    .from("quick_setup_admin_events")
    .select("id")
    .eq("dedupe_key", dedupeKey)
    .maybeSingle();
  return !data;
}

async function markAdminEventEmitted(input: {
  userId: string;
  childProfileId?: string | null;
  eventType: QuickSetupEventType;
  dedupeKey: string;
}) {
  const admin = createSupabaseAdminClient();
  if (!admin) return;
  await admin.from("quick_setup_admin_events").insert({
    user_id: input.userId,
    child_profile_id: input.childProfileId ?? null,
    event_type: input.eventType,
    dedupe_key: input.dedupeKey,
  });
}

export async function recordQuickSetupEvent(input: {
  userId: string;
  email: string;
  role: AppRole;
  eventType: QuickSetupEventType;
  detail: string;
  profileId?: string | null;
  childName?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const admin = createSupabaseAdminClient();
  if (!admin) return;

  const metadata = {
    role: input.role,
    profileId: input.profileId ?? null,
    childName: input.childName ?? null,
    ...(input.metadata ?? {}),
  };

  const now = new Date().toISOString();
  if (input.eventType === "quick_setup_skipped") {
    await upsertQuickSetupStatus({
      userId: input.userId,
      childProfileId: input.profileId,
      status: "skipped",
      skippedAt: now,
      checklist: (input.metadata?.checklist as Record<string, boolean>) ?? {},
    });
  } else if (input.eventType === "quick_setup_remind_later") {
    await upsertQuickSetupStatus({
      userId: input.userId,
      childProfileId: input.profileId,
      status: "in_progress",
      remindedAt: now,
      checklist: (input.metadata?.checklist as Record<string, boolean>) ?? {},
    });
  } else if (input.eventType === "quick_setup_started") {
    await upsertQuickSetupStatus({
      userId: input.userId,
      childProfileId: input.profileId,
      status: "in_progress",
      checklist: (input.metadata?.checklist as Record<string, boolean>) ?? {},
    });
  } else if (input.eventType === "quick_setup_completed") {
    await upsertQuickSetupStatus({
      userId: input.userId,
      childProfileId: input.profileId,
      status: "completed",
      completedAt: now,
      checklist: (input.metadata?.checklist as Record<string, boolean>) ?? {},
    });
  }

  const { error: activityError } = await admin.from("user_activity_events").insert({
    user_id: input.userId,
    email: input.email,
    event_type: input.eventType,
    detail: input.detail,
    metadata,
  });
  if (activityError) {
    console.warn("Quick setup activity was not recorded:", activityError.message);
  }

  if (input.eventType !== "quick_setup_incomplete" && input.eventType !== "quick_setup_skipped") {
    return;
  }

  const dedupeKey = `${input.eventType}:${input.userId}:${input.profileId ?? "none"}`;
  if (!(await shouldEmitAdminEvent(dedupeKey))) return;

  const { data: admins, error: adminsError } = await admin
    .from("users")
    .select("id")
    .in("role", ["admin", "super_admin"]);
  if (adminsError) {
    console.warn("Quick setup admin lookup failed:", adminsError.message);
    return;
  }

  const rows = (admins ?? []).map((row) => ({
    user_id: row.id,
    type: input.eventType,
    title: input.eventType === "quick_setup_skipped" ? "Quick Setup skipped" : "Quick Setup incomplete",
    body: `${input.email} ${input.eventType === "quick_setup_skipped" ? "skipped" : "has not completed"} setup${input.childName ? ` for ${input.childName}` : ""}.`,
    severity: input.eventType === "quick_setup_skipped" ? "warning" : "info",
    metadata,
  }));

  if (rows.length === 0) return;
  const { error: notifyError } = await admin.from("platform_notifications").insert(rows);
  if (notifyError) {
    console.warn("Quick setup admin notification was not recorded:", notifyError.message);
    return;
  }

  await markAdminEventEmitted({
    userId: input.userId,
    childProfileId: input.profileId,
    eventType: input.eventType,
    dedupeKey,
  });
}
