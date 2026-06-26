import { createClient } from "@supabase/supabase-js";
import {
  defaultCommunicationCategories,
  SAFETY_DISCLAIMER,
} from "@family-support/core";
import {
  createLocalChildProfile,
  createLocalCommunicationCard,
  createLocalExercise,
  createLocalCheckIn,
  createLocalRoutine,
  createLocalGoal,
  createLocalAiSuggestion,
  createLocalCareTeamMember,
  createLocalReport,
  completeLocalTask,
  updateLocalGoalProgress,
  getLocalCareTeam,
  getLocalReports,
  getLocalSocialStories,
  useCommunicationCard,
  getLocalAdminStats,
  getLocalAiSuggestions,
  getLocalCheckIns,
  getLocalChildProfiles,
  getLocalCommunicationCards,
  getLocalDashboard,
  getEmptyDashboard,
  getLocalExercises,
  getLocalGoals,
  getLocalLibrary,
  getLocalLibraryCategory,
  getLocalRewards,
  getLocalRoutines,
  getLocalSubscriptions,
  getLocalSupportTickets,
  getLocalTasks,
  getLocalUsers,
  updateLocalAiSuggestion,
} from "./local-store";

import {
  getDashboardSnapshotForProfile,
} from "./supabase-auth";
import { DEMO_PROFILE_IDS } from "./demo-accounts";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);
export const isDemoMode = !hasSupabaseConfig;

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

export type DashboardSnapshot = ReturnType<typeof getLocalDashboard>;

export async function getDashboardSnapshot(
  childProfileId: string,
  options?: { childName?: string; allowEmpty?: boolean; authUserId?: string }
): Promise<DashboardSnapshot> {
  const childName = options?.childName ?? "Child";
  const isDemoProfile = DEMO_PROFILE_IDS.has(childProfileId);

  if (!isDemoProfile) {
    return getDashboardSnapshotForProfile(childProfileId, childName);
  }

  const local = getLocalDashboard(childProfileId);
  const hasActivity =
    local.tasksCompletedPct > 0 ||
    local.routinesCompletedPct > 0 ||
    local.checkInsCount > 0 ||
    local.newSkillsCount > 0 ||
    local.weekChart.some((d) => d.tasks > 0 || d.routines > 0 || d.checkIns > 0) ||
    local.emotionBreakdown.length > 0;

  if (options?.allowEmpty && !hasActivity) {
    return getEmptyDashboard(childProfileId, childName);
  }

  return local;
}

export async function getParentLibrary() {
  if (!supabase) return getLocalLibrary();

  const { data, error } = await supabase
    .from("parent_library_categories")
    .select("slug,title,description,parent_library_articles(title,body_markdown)")
    .order("title", { ascending: true });

  if (error || !data) return getLocalLibrary();

  return data.map((entry) => ({
    slug: entry.slug,
    title: entry.title,
    description: entry.description ?? "",
    articles: (entry.parent_library_articles ?? []).map((article: { title: string; body_markdown: string }) => ({
      slug: article.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      title: article.title,
      body: article.body_markdown,
    })),
  }));
}

export async function getParentLibraryCategory(slug: string) {
  if (!supabase) return getLocalLibraryCategory(slug);
  const library = await getParentLibrary();
  return library.find((c) => c.slug === slug) ?? null;
}

export async function getCommunicationCategories() {
  if (!supabase) return [...defaultCommunicationCategories];
  const { data } = await supabase.from("communication_categories").select("name").order("name");
  const rows = (data ?? []).map((row) => row.name);
  return rows.length > 0 ? rows : [...defaultCommunicationCategories];
}

export async function getChildProfiles() {
  return [];
}

export async function getRoutines(childProfileId?: string) {
  if (!supabase) return getLocalRoutines(childProfileId);
  let query = supabase.from("routines").select("*, routine_steps(*)");
  if (childProfileId) query = query.eq("child_profile_id", childProfileId);
  const { data } = await query;
  return data ?? [];
}

export async function getTasks(childProfileId?: string) {
  if (!supabase) return getLocalTasks(childProfileId);
  let query = supabase.from("tasks").select("*");
  if (childProfileId) query = query.eq("child_profile_id", childProfileId);
  const { data } = await query;
  return data ?? [];
}

export async function getCommunicationCards(childProfileId?: string) {
  if (!supabase) return getLocalCommunicationCards(childProfileId);
  let query = supabase.from("communication_cards").select("*");
  if (childProfileId) query = query.eq("child_profile_id", childProfileId);
  const { data } = await query;
  const rows = data ?? [];
  if (rows.length > 0) return rows;
  return getLocalCommunicationCards(childProfileId);
}

export async function getGoals() {
  if (!supabase) return getLocalGoals();
  const { data } = await supabase.from("goals").select("*");
  return data ?? [];
}

export async function getRewards() {
  if (!supabase) return getLocalRewards();
  const { data } = await supabase.from("rewards").select("*");
  return data ?? [];
}

export async function getAiSuggestions() {
  if (!supabase) return getLocalAiSuggestions();
  const { data } = await supabase.from("ai_suggestions").select("*").eq("status", "pending_review");
  return data ?? [];
}

export async function reviewAiSuggestion(id: string, status: "approved" | "rejected") {
  if (!supabase) return updateLocalAiSuggestion(id, status);
  const { data, error } = await supabase
    .from("ai_suggestions")
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getExercises() {
  if (!supabase) return getLocalExercises();
  const { data } = await supabase.from("exercises").select("*");
  return data ?? [];
}

export async function getCheckIns() {
  if (!supabase) return getLocalCheckIns();
  const { data } = await supabase.from("check_ins").select("*");
  return data ?? [];
}

export async function getAdminStats() {
  if (!supabase) return getLocalAdminStats();
  return getLocalAdminStats();
}

export async function getUsers() {
  if (!supabase) return getLocalUsers();
  const { data } = await supabase.from("users").select("*");
  return data ?? [];
}

export async function getSupportTickets() {
  if (!supabase) return getLocalSupportTickets();
  const { data } = await supabase.from("support_tickets").select("*");
  return data ?? [];
}

export async function getSubscriptions() {
  if (!supabase) return getLocalSubscriptions();
  const { data } = await supabase.from("subscriptions").select("*");
  return data ?? [];
}

export type { LibraryArticle, LibraryCategory } from "./local-store";
export type { LibraryCourse, LibraryFilter, LibraryLesson } from "./library";
export {
  getLibraryCourse,
  getLibraryCourses,
  getLibraryCoursesFiltered,
  getLibraryLesson,
} from "./library";
export type { PointEvent, ProfileGameSettings, Redemption, GameCompleteResult } from "./rewards";
export {
  approveRedemption,
  awardParentPoints,
  completeGameSession,
  createLocalReward,
  fetchAllProfilesRewards,
  fetchRewardsHub,
  getPointsBalance,
  getPointEvents,
  getRedemptions,
  getRewardsForProfile,
  getRewardsHub,
  requestRedemption,
  updateLocalGameSettings,
} from "./rewards";
export async function getCareTeam() {
  if (!supabase) return getLocalCareTeam();
  return getLocalCareTeam();
}

export async function getReports(childProfileId?: string) {
  if (!supabase) return getLocalReports(childProfileId);
  return getLocalReports(childProfileId);
}

export async function getSocialStories(childProfileId?: string) {
  if (!supabase) return getLocalSocialStories(childProfileId);
  return getLocalSocialStories(childProfileId);
}

export { createLocalChildProfile, createLocalCommunicationCard, createLocalExercise, createLocalCheckIn, createLocalRoutine, createLocalGoal, createLocalAiSuggestion, createLocalCareTeamMember, createLocalReport, completeLocalTask, updateLocalGoalProgress, useCommunicationCard };

export * from "./tess-store";

export {
  adminResetUserPassword,
  adminSetUserPassword,
  authenticateDemoUser,
  changeDemoUserPassword,
  createChildLoginAccount,
  getDemoAuthUserByEmail,
  getDemoAuthUserById,
  listDemoAuthUsers,
  registerDemoUser,
  type PublicAuthUser,
} from "./auth-store";

export {
  createUserSetup,
  filterProfileIdsForUser,
  generateAccessCode,
  getAccessCodeForProfile,
  getCareTeamUserIdsForProfile,
  getLinkedProfileIds,
  getProfileIdForAccessCode,
  getSelfProfileIdsForUser,
  getUserSetup,
  homePathForAuthUser,
  linkUserToProfile,
  markSetupComplete,
  needsAccountSetup,
  redeemAccessCode,
  setupPathForRole,
  type ProfileRelationship,
} from "./access-code-store";

export {
  getTherapistDashboard,
  getTherapistClient,
  generateTherapistDocument,
  updateTherapistDocument,
  getTherapistDocuments,
  markTherapistMessageRead,
  replyToTherapistMessage,
  logTherapistBehaviorEvent,
  type TherapistDashboardSnapshot,
  type AutismPassport,
  type DocumentType,
  type GeneratedDocument,
} from "./therapist-store";

export { DEMO_ACCOUNT_IDS, DEMO_PROFILE_IDS } from "./demo-accounts";

export {
  resolveProfilesForSessionUser,
  userCanAccessProfile,
  type SessionProfileUser,
} from "./session-profiles";

export {
  bridgeUserFromSupabaseUser,
  createPersistedAccessCode,
  createPersistedChildProfile,
  demoLogin,
  demoSessionUser,
  DEMO_AUTH_EMAILS,
  fetchPersistedChildProfiles,
  getPersistedAccessCodeForProfile,
  isDemoAuthEmail,
  isDemoAuthUserId,
  markPersistedSetupComplete,
  redeemPersistedAccessCode,
  resolveSupabaseSession,
  supabaseSignIn,
  supabaseSignOut,
  supabaseSignUp,
  type BridgeAuthUser,
} from "./supabase-auth";

export { hasSupabaseAuth } from "./supabase-server";

export {
  filterProfilesForAuthUser,
  getLinkedProfileIdForAuthUser,
  resolveChildProfilesForSession,
} from "./user-profiles";

export {
  adminAddLibraryCredits,
  adminGrantCourseAccess,
  adminRevokeCourseAccess,
  adminSetAccessPlan,
  consumeLibraryCredit,
  getAdminAnalytics,
  getAdminDiagnostics,
  getCourseAccessForUser,
  getLibraryAccessForUser,
  getRecentUserActivity,
  getSiteIssues,
  getUserAccount,
  getUserAccountByEmail,
  isAccessPlanActive,
  logSiteIssue,
  logUserActivity,
  resolveSiteIssue,
  userHasCourseAccess,
  type AccessPlan,
  type AdminUserDiagnostics,
  type CourseAccessGrant,
  type CourseAccessTier,
  type SiteDiagnosticIssue,
  type SiteIssueSeverity,
  type UserAccountRecord,
  type UserActivityEvent,
} from "./admin-diagnostics-store";

export {
  createCareNotification,
  getNotificationsForUser,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
  notifySpectrumAuthEvent,
  type CareNotification,
  type CareNotificationType,
} from "./notification-store";

export {
  completeVideoView,
  getVideoActivity,
  getVideoActivityForProfiles,
  getVideoCatalog,
  getVideoRewardStatus,
  logVideoSearch,
  searchVideos,
  startVideoPlay,
  type VideoActivity,
  type VideoActivityType,
  type VideoCompleteResult,
} from "./video-store";

export async function requestMagicLink(email: string) {
  if (!supabase) {
    if (!email.includes("@")) throw new Error("Enter a valid email.");
    return { demo: true, email };
  }
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: process.env.NEXT_PUBLIC_SITE_URL },
  });
  if (error) throw error;
}

export async function getCurrentSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}
