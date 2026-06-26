import type { AccessTier } from "@family-support/core";
import { listDemoAuthUsers, type PublicAuthUser } from "./auth-store";
import { recordProductionActivity } from "./production-admin-store";

export type AccessPlan = "free" | "monthly" | "annual";

export type CourseAccessTier = AccessTier | "unlocked";

export type CourseAccessGrant = {
  courseSlug: string;
  tier: CourseAccessTier;
  grantedAt: string;
  grantedBy?: string;
  expiresAt: string | null;
};

export type SiteIssueSeverity = "critical" | "warning" | "info";

export type SiteDiagnosticIssue = {
  id: string;
  severity: SiteIssueSeverity;
  category: string;
  message: string;
  source: string;
  status: "open" | "resolved";
  at: string;
  resolvedAt?: string;
};

export type UserAccountRecord = {
  userId: string;
  email: string;
  libraryCredits: number;
  accessPlan: AccessPlan;
  accessExpiresAt: string | null;
  updatedAt: string;
};

export type UserActivityEvent = {
  id: string;
  userId: string;
  email: string;
  action: string;
  detail?: string;
  at: string;
};

export type AdminUserDiagnostics = PublicAuthUser & {
  libraryCredits: number;
  accessPlan: AccessPlan;
  accessExpiresAt: string | null;
  lastActiveAt: string | null;
  accessActive: boolean;
};

const accounts = new Map<string, UserAccountRecord>();
const activityLog: UserActivityEvent[] = [];
const courseAccessByUser = new Map<string, CourseAccessGrant[]>();
const demoSiteIssues: SiteDiagnosticIssue[] = [
  {
    id: "issue-1",
    severity: "warning",
    category: "Auth",
    message: "3 child accounts logged in from new devices in the last 24h",
    source: "session-monitor",
    status: "open",
    at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "issue-2",
    severity: "info",
    category: "Library",
    message: "Insurance packet PDF generation slower than 2s threshold",
    source: "library-service",
    status: "open",
    at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "issue-3",
    severity: "critical",
    category: "API",
    message: "Intermittent 503 on /api/tess/chat during peak hours",
    source: "edge-monitor",
    status: "open",
    at: new Date(Date.now() - 1800000).toISOString(),
  },
];
const siteIssues: SiteDiagnosticIssue[] = process.env.NODE_ENV === "production" ? [] : [...demoSiteIssues];

function nowIso() {
  return new Date().toISOString();
}

function ensureAccount(user: PublicAuthUser): UserAccountRecord {
  const existing = accounts.get(user.id);
  if (existing) return existing;

  const defaults: Record<string, Partial<UserAccountRecord>> = {
    "u-demo-caregiver": { libraryCredits: 2, accessPlan: "monthly", accessExpiresAt: daysFromNow(30) },
    "u-demo-casemanager": { libraryCredits: 5, accessPlan: "annual", accessExpiresAt: daysFromNow(365) },
    "u-demo-user": { libraryCredits: 0, accessPlan: "free", accessExpiresAt: null },
  };

  const seed = defaults[user.id] ?? {};
  const record: UserAccountRecord = {
    userId: user.id,
    email: user.email,
    libraryCredits: seed.libraryCredits ?? 0,
    accessPlan: seed.accessPlan ?? "free",
    accessExpiresAt: seed.accessExpiresAt ?? null,
    updatedAt: nowIso(),
  };
  accounts.set(user.id, record);
  return record;
}

function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function planExpiry(plan: AccessPlan): string | null {
  if (plan === "free") return null;
  if (plan === "monthly") return daysFromNow(30);
  return daysFromNow(365);
}

export function logUserActivity(
  userId: string,
  email: string,
  action: string,
  detail?: string
): UserActivityEvent {
  const event: UserActivityEvent = {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userId,
    email,
    action,
    detail,
    at: nowIso(),
  };
  activityLog.unshift(event);
  if (activityLog.length > 500) activityLog.length = 500;
  void recordProductionActivity({
    userId,
    email,
    eventType: action,
    detail: detail ?? null,
  });
  return event;
}

export function getUserAccount(userId: string): UserAccountRecord | null {
  const user = listDemoAuthUsers().find((u) => u.id === userId);
  if (!user) return null;
  return ensureAccount(user);
}

export function getUserAccountByEmail(email: string): UserAccountRecord | null {
  const user = listDemoAuthUsers().find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) return null;
  return ensureAccount(user);
}

export function isAccessPlanActive(account: UserAccountRecord): boolean {
  if (account.accessPlan === "free") return false;
  if (!account.accessExpiresAt) return true;
  return account.accessExpiresAt >= new Date().toISOString().slice(0, 10);
}

export function getLibraryAccessForUser(userId: string) {
  const account = getUserAccount(userId);
  const courseGrants = getCourseAccessForUser(userId);
  if (!account) {
    return {
      hasFullAccess: false,
      libraryCredits: 0,
      accessPlan: "free" as AccessPlan,
      accessExpiresAt: null as string | null,
      courseGrants,
    };
  }
  return {
    hasFullAccess: isAccessPlanActive(account),
    libraryCredits: account.libraryCredits,
    accessPlan: account.accessPlan,
    accessExpiresAt: account.accessExpiresAt,
    courseGrants,
  };
}

export function getCourseAccessForUser(userId: string): CourseAccessGrant[] {
  return courseAccessByUser.get(userId) ?? [];
}

export function userHasCourseAccess(userId: string, courseSlug: string): CourseAccessGrant | null {
  const grants = getCourseAccessForUser(userId);
  const grant = grants.find((g) => g.courseSlug === courseSlug);
  if (!grant) return null;
  if (grant.expiresAt && grant.expiresAt < new Date().toISOString().slice(0, 10)) return null;
  return grant;
}

export function adminGrantCourseAccess(
  userId: string,
  courseSlug: string,
  tier: CourseAccessTier,
  options?: { grantedBy?: string; expiresAt?: string | null }
) {
  const account = getUserAccount(userId);
  if (!account) throw new Error("User not found.");

  const grants = courseAccessByUser.get(userId) ?? [];
  const existing = grants.findIndex((g) => g.courseSlug === courseSlug);
  const grant: CourseAccessGrant = {
    courseSlug,
    tier,
    grantedAt: nowIso(),
    grantedBy: options?.grantedBy,
    expiresAt: options?.expiresAt ?? null,
  };
  if (existing >= 0) grants[existing] = grant;
  else grants.push(grant);
  courseAccessByUser.set(userId, grants);

  logUserActivity(
    userId,
    account.email,
    "admin_grant_course",
    `${courseSlug} → ${tier}${options?.grantedBy ? ` by ${options.grantedBy}` : ""}`
  );
  return grant;
}

export function adminRevokeCourseAccess(userId: string, courseSlug: string) {
  const account = getUserAccount(userId);
  if (!account) throw new Error("User not found.");
  const grants = (courseAccessByUser.get(userId) ?? []).filter((g) => g.courseSlug !== courseSlug);
  courseAccessByUser.set(userId, grants);
  logUserActivity(userId, account.email, "admin_revoke_course", courseSlug);
  return grants;
}

export function consumeLibraryCredit(userId: string): boolean {
  const account = getUserAccount(userId);
  if (!account || account.libraryCredits <= 0) return false;
  account.libraryCredits -= 1;
  account.updatedAt = nowIso();
  logUserActivity(userId, account.email, "library_credit_used", `Credits remaining: ${account.libraryCredits}`);
  return true;
}

export function getRecentUserActivity(limit = 100, userId?: string): UserActivityEvent[] {
  const list = userId ? activityLog.filter((e) => e.userId === userId) : activityLog;
  return list.slice(0, limit);
}

export function getAdminDiagnostics(): {
  users: AdminUserDiagnostics[];
  activity: UserActivityEvent[];
  siteIssues: SiteDiagnosticIssue[];
  analytics: ReturnType<typeof getAdminAnalytics>;
} {
  const users = listDemoAuthUsers().map((user) => {
    const account = ensureAccount(user);
    const lastEvent = activityLog.find((e) => e.userId === user.id);
    return {
      ...user,
      libraryCredits: account.libraryCredits,
      accessPlan: account.accessPlan,
      accessExpiresAt: account.accessExpiresAt,
      lastActiveAt: lastEvent?.at ?? null,
      accessActive: isAccessPlanActive(account),
    };
  });

  return {
    users,
    activity: getRecentUserActivity(80),
    siteIssues: getSiteIssues(),
    analytics: getAdminAnalytics(),
  };
}

export function getSiteIssues(includeResolved = false): SiteDiagnosticIssue[] {
  const list = includeResolved ? siteIssues : siteIssues.filter((i) => i.status === "open");
  return [...list].sort((a, b) => b.at.localeCompare(a.at));
}

export function logSiteIssue(input: Omit<SiteDiagnosticIssue, "id" | "at" | "status">): SiteDiagnosticIssue {
  const issue: SiteDiagnosticIssue = {
    ...input,
    id: `issue-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    status: "open",
    at: nowIso(),
  };
  siteIssues.unshift(issue);
  if (siteIssues.length > 200) siteIssues.length = 200;
  return issue;
}

export function resolveSiteIssue(issueId: string): SiteDiagnosticIssue | null {
  const issue = siteIssues.find((i) => i.id === issueId);
  if (!issue) return null;
  issue.status = "resolved";
  issue.resolvedAt = nowIso();
  return issue;
}

export function getAdminAnalytics() {
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  const loginsToday = activityLog.filter((e) => e.action === "login" && e.at.startsWith(today)).length;
  const logoutsToday = activityLog.filter((e) => e.action === "logout" && e.at.startsWith(today)).length;
  const spectrumLoginsToday = activityLog.filter(
    (e) => e.action === "login" && e.at.startsWith(today) && listDemoAuthUsers().find((u) => u.id === e.userId)?.role === "child_user"
  ).length;
  const activeUsers7d = new Set(activityLog.filter((e) => e.at >= weekAgo).map((e) => e.userId)).size;
  const adminActionsToday = activityLog.filter(
    (e) => e.action.startsWith("admin_") && e.at.startsWith(today)
  ).length;
  const creditsUsed = activityLog.filter((e) => e.action === "library_credit_used").length;
  const openIssues = siteIssues.filter((i) => i.status === "open").length;
  const criticalIssues = siteIssues.filter((i) => i.status === "open" && i.severity === "critical").length;

  const roleCounts = listDemoAuthUsers().reduce<Record<string, number>>((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1;
    return acc;
  }, {});

  const actionBreakdown = activityLog.slice(0, 200).reduce<Record<string, number>>((acc, e) => {
    acc[e.action] = (acc[e.action] ?? 0) + 1;
    return acc;
  }, {});

  return {
    loginsToday,
    logoutsToday,
    spectrumLoginsToday,
    activeUsers7d,
    adminActionsToday,
    creditsUsed,
    openIssues,
    criticalIssues,
    totalUsers: listDemoAuthUsers().length,
    roleCounts,
    actionBreakdown,
  };
}

export function adminAddLibraryCredits(userId: string, amount: number, note?: string) {
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Credit amount must be a positive number.");
  const account = getUserAccount(userId);
  if (!account) throw new Error("User not found.");
  account.libraryCredits += Math.floor(amount);
  account.updatedAt = nowIso();
  logUserActivity(userId, account.email, "admin_add_credits", note ?? `+${amount} credits (total: ${account.libraryCredits})`);
  return account;
}

export function adminSetAccessPlan(userId: string, plan: AccessPlan) {
  const account = getUserAccount(userId);
  if (!account) throw new Error("User not found.");
  account.accessPlan = plan;
  account.accessExpiresAt = planExpiry(plan);
  account.updatedAt = nowIso();
  logUserActivity(
    userId,
    account.email,
    "admin_set_access",
    plan === "free" ? "Free tier" : `${plan} until ${account.accessExpiresAt}`
  );
  return account;
}
