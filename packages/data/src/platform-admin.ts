import type { AppRole } from "@family-support/core";
import {
  adminAddLibraryCredits,
  getUserAccount,
  logUserActivity,
} from "./admin-diagnostics-store";
import { adminResetUserPassword, getDemoAuthUserById, listDemoAuthUsers, type PublicAuthUser } from "./auth-store";
import {
  addBridgeGroupMember,
  createBridgeAccessCode,
  enrichUserWithBridgeInfo,
  getAdminBridgeOverview,
  listAllUsersForAdmin,
  listBridgeAccessCodes,
  listBridgeGroups,
  removeBridgeGroupMember,
  revokeBridgeAccessCode,
} from "./bridge-store";
import { getErrorCountsBySeverity, listErrorLogs, updateErrorLog } from "./error-log-store";
import { getAdminPlatformOverview, getPaymentProcessorStatuses, getPlatformDiagnostics } from "./platform-diagnostics";
import { getAdminPricingState, resetPricingOverrides, updatePayerPlan, updatePricingPlan } from "./pricing-store";
import { getPlatformActivity } from "./safety-alert-store";
import { listSafetyAlertsForUser } from "./safety-alert-store";
import {
  getProductionActivity,
  listProductionAdminUsers,
  listProductionBridgeGroups,
  listProductionErrorLogs,
} from "./production-admin-store";

const userStatus = new Map<string, "active" | "suspended" | "disabled">();

export function isAdminRole(role: AppRole | string): boolean {
  return role === "admin" || role === "super_admin";
}

export async function searchAdminUsers(options?: {
  email?: string;
  name?: string;
  role?: string;
  status?: string;
}) {
  const productionUsers = await listProductionAdminUsers(options);
  if (productionUsers) {
    return productionUsers;
  }

  let users = listAllUsersForAdmin();
  if (options?.email) {
    const q = options.email.toLowerCase();
    users = users.filter((u) => u.email.toLowerCase().includes(q));
  }
  if (options?.name) {
    const q = options.name.toLowerCase();
    users = users.filter((u) => u.name.toLowerCase().includes(q));
  }
  if (options?.role) users = users.filter((u) => u.role === options.role);
  if (options?.status) {
    users = users.filter((u) => (userStatus.get(u.id) ?? "active") === options.status);
  }
  return users.map((u) => ({
    ...u,
    status: userStatus.get(u.id) ?? "active",
    credits: getUserAccount(u.id)?.libraryCredits ?? 0,
  }));
}

export function setUserStatus(userId: string, status: "active" | "suspended" | "disabled", actorEmail: string) {
  const user = getDemoAuthUserById(userId);
  if (!user) throw new Error("User not found.");
  userStatus.set(userId, status);
  logUserActivity(userId, user.email, "admin_action", `Status set to ${status} by ${actorEmail}`);
  logPlatformActivityAdmin(userId, user.email, `status_${status}`, actorEmail);
  return { ...user, status };
}

export function reassignUserRole(userId: string, role: AppRole, actorEmail: string): PublicAuthUser {
  const users = listDemoAuthUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) throw new Error("User not found.");
  (user as { role: AppRole }).role = role;
  logUserActivity(userId, user.email, "admin_action", `Role changed to ${role} by ${actorEmail}`);
  return user;
}

function logPlatformActivityAdmin(userId: string, email: string, detail: string, actor: string) {
  logUserActivity(userId, email, "admin_action", `${detail} (${actor})`);
}

export function adminTriggerPasswordReset(userId: string, actorEmail: string) {
  const result = adminResetUserPassword(userId);
  logUserActivity(userId, result.user.email, "admin_reset_password", `Triggered by ${actorEmail}`);
  return {
    ok: true,
    message: "Password reset initiated. In production this sends a Supabase reset email.",
    tempPassword: result.tempPassword,
    user: result.user,
  };
}

export function adminSetCredits(userId: string, balance: number, actorEmail: string, note?: string) {
  const current = getUserAccount(userId);
  const delta = balance - (current?.libraryCredits ?? 0);
  const account = adminAddLibraryCredits(userId, delta, note ?? `Set to ${balance} by ${actorEmail}`);
  logUserActivity(userId, account.email, "credit_granted", `Balance ${balance} by ${actorEmail}`);
  return account;
}

export { resetPricingOverrides, updatePayerPlan, updatePricingPlan };

export async function getAdminSection(section: string, params: URLSearchParams) {
  switch (section) {
    case "overview":
      return getAdminPlatformOverview();
    case "users":
      return searchAdminUsers({
        email: params.get("email") ?? undefined,
        name: params.get("name") ?? undefined,
        role: params.get("role") ?? undefined,
        status: params.get("status") ?? undefined,
      });
    case "bridge-groups": {
      const productionBridgeGroups = await listProductionBridgeGroups({ includeDemo: params.get("includeDemo") === "true" });
      return productionBridgeGroups ?? {
        groups: listBridgeGroups({ includeDemo: true }),
        overview: getAdminBridgeOverview(),
      };
    }
    case "access-codes": {
      const groupId = params.get("bridgeGroupId");
      return groupId ? listBridgeAccessCodes(groupId) : [];
    }
    case "safety-alerts":
      return listSafetyAlertsForUser("u-admin", { includeDemo: true });
    case "activity":
      return (await getProductionActivity({
        limit: Number(params.get("limit") ?? 100),
        email: params.get("email") ?? undefined,
        eventType: params.get("eventType") ?? undefined,
        bridgeGroupId: params.get("bridgeGroupId") ?? undefined,
        includeDemo: params.get("includeDemo") === "true",
      })) ?? getPlatformActivity({
        limit: Number(params.get("limit") ?? 100),
        email: params.get("email") ?? undefined,
        eventType: params.get("eventType") ?? undefined,
        bridgeGroupId: params.get("bridgeGroupId") ?? undefined,
      });
    case "error-logs":
      return (await listProductionErrorLogs({
        severity: params.get("severity") ?? undefined,
        status: params.get("status") ?? undefined,
        route: params.get("route") ?? undefined,
        query: params.get("q") ?? undefined,
        limit: Number(params.get("limit") ?? 50),
        offset: Number(params.get("offset") ?? 0),
      })) ?? listErrorLogs({
        severity: (params.get("severity") as never) ?? undefined,
        status: (params.get("status") as never) ?? undefined,
        route: params.get("route") ?? undefined,
        query: params.get("q") ?? undefined,
        limit: Number(params.get("limit") ?? 50),
        offset: Number(params.get("offset") ?? 0),
      });
    case "diagnostics":
      return getPlatformDiagnostics();
    case "payments":
      return getPaymentProcessorStatuses();
    case "pricing":
      return getAdminPricingState();
    case "demo-accounts":
      return (await searchAdminUsers()).filter((u) =>
        ["caregiver@demo.com", "casemanager@demo.com", "user@demo.com", "erika@test.com", "nathan@test.com"].includes(
          u.email.toLowerCase()
        )
      );
    default:
      return null;
  }
}
