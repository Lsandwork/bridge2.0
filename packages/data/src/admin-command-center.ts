import type { SafetyAlert, UserActivityEvent } from "@family-support/core";
import { DEMO_ACCOUNT_EMAILS } from "./demo-accounts";
import { listDemoAuthUsers } from "./auth-store";
import { getUserSetup } from "./access-code-store";
import { getAdminBridgeOverview } from "./bridge-store";
import { getErrorCountsBySeverity, listErrorLogs } from "./error-log-store";
import { getPaymentProcessorStatuses, getPlatformDiagnostics } from "./platform-diagnostics";
import { getPlatformActivity, listSafetyAlertsForUser } from "./safety-alert-store";
import { listHealthReports } from "./health-report-store";
import { listSupportRequests } from "./support-request-store";

export type AdminEnvironment = "production" | "staging" | "preview" | "development" | "local";

export type AdminOverviewKpis = {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  activeUsersToday: number;
  activeUsersThisWeek: number;
  newProfilesCreated: number;
  pendingApprovals: number;
  quickSetupIncomplete: number;
  paymentsToday: number;
  paymentsThisMonth: number;
  failedPayments: number;
  openSupportRequests: number;
  urgentSafetyAlerts: number;
  possibleEmergencies: number;
  platformHealthScore: number;
};

function resolveEnvironment(): AdminEnvironment {
  const vercel = process.env.VERCEL_ENV;
  if (vercel === "production") return "production";
  if (vercel === "preview") return "preview";
  if (vercel === "development") return "staging";
  if (process.env.NODE_ENV === "production") return "production";
  return "local";
}

function isDemoEmail(email: string): boolean {
  return DEMO_ACCOUNT_EMAILS.has(email.toLowerCase()) || email.toLowerCase().endsWith("@demo.com");
}

function isRealUser(email: string, userId: string): boolean {
  if (isDemoEmail(email)) return false;
  if (email.includes("@test.com")) return false;
  if (userId === "u-admin") return false;
  return true;
}

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function countActivitySince(events: UserActivityEvent[], since: Date, type?: string) {
  return events.filter((e) => {
    if (new Date(e.createdAt) < since) return false;
    if (type && e.eventType !== type) return false;
    return true;
  }).length;
}

function uniqueActiveUsers(events: UserActivityEvent[], since: Date) {
  const ids = new Set<string>();
  for (const e of events) {
    if (new Date(e.createdAt) < since) continue;
    if (e.eventType === "login" && e.userId) ids.add(e.userId);
  }
  return ids.size;
}

export function getAdminCommandOverview(options?: { includeDemo?: boolean }) {
  const includeDemo = options?.includeDemo ?? false;
  const users = listDemoAuthUsers().filter((u) => includeDemo || isRealUser(u.email, u.id));
  const activity = getPlatformActivity({ limit: 5000 });
  const filteredActivity = includeDemo
    ? activity
    : activity.filter((e) => !e.email || isRealUser(e.email, e.userId ?? ""));

  const today = startOfDay();
  const weekAgo = daysAgo(7);

  const signups = filteredActivity.filter((e) => e.eventType === "signup");
  const newUsersToday = signups.filter((e) => new Date(e.createdAt) >= today).length;
  const newUsersThisWeek = signups.filter((e) => new Date(e.createdAt) >= weekAgo).length;

  const newProfilesCreated = filteredActivity.filter(
    (e) => e.eventType === "profile_created" && new Date(e.createdAt) >= weekAgo
  ).length;

  const quickSetupIncomplete = users.filter((u) => {
    if (u.role === "admin" || u.role === "super_admin" || u.role === "child_user") return false;
    const setup = getUserSetup(u.id);
    return setup ? !setup.setupComplete : u.role === "parent_guardian" || u.role === "caregiver_therapist_teacher";
  }).length;

  const alerts = listSafetyAlertsForUser("u-admin", { includeDemo }).filter(
    (a) => includeDemo || !a.isDemo
  );
  const openAlerts = alerts.filter((a) => a.status !== "resolved");
  const urgentSafetyAlerts = openAlerts.filter((a) => a.severity === "high" || a.severity === "critical").length;
  const possibleEmergencies = openAlerts.filter((a) => a.emergencyRecommended).length;

  const supportRequests = listSupportRequests({ includeDemo }).filter((r) => includeDemo || !r.isDemo);
  const openSupportRequests = supportRequests.filter((r) => r.status === "open" || r.status === "in_review").length;

  const paymentsToday = countActivitySince(filteredActivity, today, "payment_status_changed");
  const paymentsMonth = countActivitySince(filteredActivity, daysAgo(30), "payment_status_changed");

  const diagnostics = getPlatformDiagnostics();
  const errorCounts = getErrorCountsBySeverity();
  const openErrors = (errorCounts.critical ?? 0) + (errorCounts.high ?? 0) + (errorCounts.medium ?? 0);

  let healthScore = 100;
  if (!diagnostics.supabase.auth || diagnostics.supabase.auth === "missing") healthScore -= 25;
  if (openErrors > 0) healthScore -= Math.min(30, openErrors * 5);
  if (urgentSafetyAlerts > 0) healthScore -= Math.min(25, urgentSafetyAlerts * 8);
  if (possibleEmergencies > 0) healthScore -= 15;
  healthScore = Math.max(0, healthScore);

  const systemStatus: "healthy" | "warning" | "critical" =
    possibleEmergencies > 0 || (errorCounts.critical ?? 0) > 0
      ? "critical"
      : urgentSafetyAlerts > 0 || openErrors > 0
        ? "warning"
        : "healthy";

  const kpis: AdminOverviewKpis = {
    totalUsers: users.length,
    newUsersToday,
    newUsersThisWeek,
    activeUsersToday: uniqueActiveUsers(filteredActivity, today),
    activeUsersThisWeek: uniqueActiveUsers(filteredActivity, weekAgo),
    newProfilesCreated,
    pendingApprovals: 0,
    quickSetupIncomplete,
    paymentsToday,
    paymentsThisMonth: paymentsMonth,
    failedPayments: 0,
    openSupportRequests,
    urgentSafetyAlerts,
    possibleEmergencies,
    platformHealthScore: healthScore,
  };

  const criticalAlerts = openAlerts
    .filter((a) => a.severity === "critical" || a.emergencyRecommended)
    .slice(0, 5);

  return {
    environment: resolveEnvironment(),
    generatedAt: new Date().toISOString(),
    systemStatus,
    kpis,
    bridge: getAdminBridgeOverview(),
    diagnostics: {
      supabase: diagnostics.supabase,
      ai: diagnostics.ai,
      email: diagnostics.email,
    },
    recentActivity: filteredActivity.slice(0, 20),
    criticalAlerts,
    setupIncompleteCount: quickSetupIncomplete,
    includeDemo,
  };
}

export function getAdminNewSignups(options?: { includeDemo?: boolean }) {
  const includeDemo = options?.includeDemo ?? false;
  const activity = getPlatformActivity({ limit: 5000 }).filter((e) => e.eventType === "signup");
  const users = listDemoAuthUsers();

  return activity
    .filter((e) => includeDemo || (e.email && isRealUser(e.email, e.userId ?? "")))
    .map((e) => {
      const user = users.find((u) => u.id === e.userId || u.email === e.email);
      const setup = user ? getUserSetup(user.id) : null;
      return {
        userId: e.userId,
        email: e.email,
        name: user?.name ?? "Unknown",
        role: user?.role ?? "unknown",
        signedUpAt: e.createdAt,
        onboardingComplete: user?.onboardingComplete ?? false,
        setupComplete: setup?.setupComplete ?? false,
        isDemo: user ? isDemoEmail(user.email) : false,
        hasGoals: getPlatformActivity({ userId: e.userId ?? undefined, eventType: "profile_created" }).length > 0,
      };
    })
    .sort((a, b) => b.signedUpAt.localeCompare(a.signedUpAt));
}

export function getAdminAiBrief() {
  const overview = getAdminCommandOverview();
  const lines: string[] = [];

  lines.push(
    `Platform brief for ${overview.environment} — ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}.`
  );
  lines.push(`System status: ${overview.systemStatus}. Health score: ${overview.kpis.platformHealthScore}/100.`);

  if (overview.kpis.possibleEmergencies > 0) {
    lines.push(
      `URGENT: ${overview.kpis.possibleEmergencies} possible emergency situation(s) require immediate human review.`
    );
  }
  if (overview.kpis.urgentSafetyAlerts > 0) {
    lines.push(`${overview.kpis.urgentSafetyAlerts} high/critical safety alert(s) are open.`);
  }
  if (overview.kpis.newUsersToday > 0) {
    lines.push(`${overview.kpis.newUsersToday} new user(s) signed up today.`);
  } else {
    lines.push("No new signups today yet.");
  }
  if (overview.kpis.quickSetupIncomplete > 0) {
    lines.push(`${overview.kpis.quickSetupIncomplete} user(s) have incomplete Quick Setup.`);
  }
  if (overview.kpis.openSupportRequests > 0) {
    lines.push(`${overview.kpis.openSupportRequests} open support request(s) need review.`);
  }

  lines.push(
    "AI-assisted summary only — all safety, health, and access decisions require human admin review."
  );

  return {
    generatedAt: new Date().toISOString(),
    brief: lines.join(" "),
    bullets: lines,
    disclaimer:
      "This summary is AI-assisted triage based on real platform records. It does not replace clinical, legal, or emergency judgment.",
  };
}

export function getAdminSafetyCenter(options?: { includeDemo?: boolean }) {
  const alerts = listSafetyAlertsForUser("u-admin", { includeDemo: options?.includeDemo ?? false });
  return alerts.sort((a, b) => {
    const severityRank = { critical: 0, high: 1, moderate: 2, low: 3 };
    const statusRank = { new: 0, escalated: 1, in_progress: 2, acknowledged: 3, resolved: 4 };
    const s = severityRank[a.severity] - severityRank[b.severity];
    if (s !== 0) return s;
    return statusRank[a.status] - statusRank[b.status];
  });
}

export { isDemoEmail, isRealUser };
