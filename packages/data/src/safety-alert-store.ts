import type { SafetyAlert, SafetyAlertStatus, UserActivityEvent } from "@family-support/core";
import { checkPlatformSafety } from "@family-support/core";
import {
  DEMO_BRIDGE_GROUP_ID,
  getBridgeGroup,
  getBridgeGroupMembers,
  getBridgeGroupsForUser,
  isDemoUserId,
} from "./bridge-store";
import { getDemoAuthUserById } from "./auth-store";
import { createPlatformNotification } from "./platform-notifications";

const alerts = new Map<string, SafetyAlert>();
const alertEvents: Array<{ alertId: string; eventType: string; note?: string; at: string }> = [];
const activityLog: UserActivityEvent[] = [];

function now() {
  return new Date().toISOString();
}

function id() {
  return `sa-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function logPlatformActivity(input: {
  userId?: string | null;
  email?: string | null;
  bridgeGroupId?: string | null;
  eventType: UserActivityEvent["eventType"];
  detail?: string;
}): UserActivityEvent {
  const event: UserActivityEvent = {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId: input.userId ?? null,
    email: input.email ?? null,
    bridgeGroupId: input.bridgeGroupId ?? null,
    eventType: input.eventType,
    detail: input.detail ?? null,
    createdAt: now(),
  };
  activityLog.unshift(event);
  if (activityLog.length > 5000) activityLog.length = 5000;
  return event;
}

export function getPlatformActivity(options?: {
  limit?: number;
  userId?: string;
  email?: string;
  eventType?: string;
  bridgeGroupId?: string;
}): UserActivityEvent[] {
  let list = [...activityLog];
  if (options?.userId) list = list.filter((e) => e.userId === options.userId);
  if (options?.email) list = list.filter((e) => e.email?.toLowerCase().includes(options.email!.toLowerCase()));
  if (options?.eventType) list = list.filter((e) => e.eventType === options.eventType);
  if (options?.bridgeGroupId) list = list.filter((e) => e.bridgeGroupId === options.bridgeGroupId);
  return list.slice(0, options?.limit ?? 100);
}

const adultRoles = new Set([
  "parent_caregiver",
  "therapist",
  "case_manager",
  "school_iep",
  "admin_observer",
]);

function notifyBridgeAdults(alert: SafetyAlert) {
  if (!alert.bridgeGroupId) return;
  const members = getBridgeGroupMembers(alert.bridgeGroupId).filter(
    (m) => m.status === "active" && m.memberRole !== "center_user"
  );

  for (const member of members) {
    createPlatformNotification({
      userId: member.userId,
      bridgeGroupId: alert.bridgeGroupId,
      type: "safety_alert",
      title: `Safety alert: ${alert.concernCategory.replace(/_/g, " ")}`,
      body: `${alert.userName} may need support. Severity: ${alert.severity}.`,
      severity: alert.severity,
      metadata: { alertId: alert.id },
    });
  }

  for (const admin of ["u-admin"]) {
    createPlatformNotification({
      userId: admin,
      bridgeGroupId: alert.bridgeGroupId,
      type: "safety_alert",
      title: `Admin safety alert: ${alert.userName}`,
      body: alert.aiSummary ?? alert.triggeringExcerpt,
      severity: alert.severity,
      metadata: { alertId: alert.id, admin: true },
    });
  }
}

export function createSafetyAlertFromMessage(input: {
  userId: string;
  message: string;
  bridgeGroupId?: string;
  childProfileId?: string;
  source?: string;
}): SafetyAlert | null {
  const safety = checkPlatformSafety(input.message);
  if (!safety.flagged || !safety.notifyAdults) return null;

  const user = getDemoAuthUserById(input.userId);
  const groups = getBridgeGroupsForUser(input.userId);
  const bridgeGroupId = input.bridgeGroupId ?? groups[0]?.id ?? null;
  const group = bridgeGroupId ? getBridgeGroup(bridgeGroupId) : null;
  const isDemo = isDemoUserId(input.userId) || group?.isDemo === true;

  const alert: SafetyAlert = {
    id: id(),
    bridgeGroupId,
    bridgeGroupName: group?.displayName ?? null,
    userId: input.userId,
    userName: user?.name ?? "User",
    childProfileId: input.childProfileId ?? null,
    concernCategory: safety.concernCategory,
    severity: safety.severity,
    status: "new",
    triggeringExcerpt: input.message.slice(0, 500),
    aiSummary: `${safety.description}. Recommended: stay calm, check immediate safety, contact trusted adults, use emergency services if needed.`,
    recommendedSteps:
      "1. Acknowledge the person's feelings.\n2. Check if they are in immediate danger.\n3. Contact parent/caregiver or on-call support.\n4. Document and follow your organization's safety protocol.",
    assignedResponderId: null,
    emergencyRecommended: safety.emergencyRecommended,
    isDemo,
    source: input.source ?? "nuvio_chat",
    createdAt: now(),
    updatedAt: now(),
  };

  alerts.set(alert.id, alert);
  alertEvents.push({ alertId: alert.id, eventType: "created", at: now() });

  logPlatformActivity({
    userId: input.userId,
    email: user?.email ?? null,
    bridgeGroupId,
    eventType: "safety_alert_created",
    detail: alert.concernCategory,
  });

  if (!isDemo || bridgeGroupId === DEMO_BRIDGE_GROUP_ID) {
    notifyBridgeAdults(alert);
  }

  return alert;
}

export function listSafetyAlertsForUser(userId: string, options?: { includeDemo?: boolean }): SafetyAlert[] {
  const user = getDemoAuthUserById(userId);
  const role = user?.role;
  const isCenterUser = role === "child_user";

  if (isCenterUser) return [];

  const userGroups = new Set(getBridgeGroupsForUser(userId).map((g) => g.id));
  const isAdmin = role === "admin" || role === "super_admin";

  return [...alerts.values()]
    .filter((a) => {
      if (!options?.includeDemo && a.isDemo && !isDemoUserId(userId)) return false;
      if (isAdmin) return true;
      if (a.bridgeGroupId && userGroups.has(a.bridgeGroupId)) {
        const membership = getBridgeGroupMembers(a.bridgeGroupId).find((m) => m.userId === userId);
        return membership && adultRoles.has(membership.memberRole);
      }
      return false;
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function updateSafetyAlertStatus(
  alertId: string,
  status: SafetyAlertStatus,
  actorId: string,
  note?: string
): SafetyAlert | null {
  const alert = alerts.get(alertId);
  if (!alert) return null;
  alert.status = status;
  alert.updatedAt = now();
  if (status === "in_progress" || status === "acknowledged") {
    alert.assignedResponderId = actorId;
  }
  alertEvents.push({ alertId, eventType: `status_${status}`, note, at: now() });
  return alert;
}

export function getSafetyAlertById(id: string): SafetyAlert | null {
  return alerts.get(id) ?? null;
}

export function seedDemoSafetyAlert() {
  if (alerts.size > 0) return;
  createSafetyAlertFromMessage({
    userId: "u-demo-user",
    message: "I feel really overwhelmed and scared at school sometimes.",
    bridgeGroupId: DEMO_BRIDGE_GROUP_ID,
    source: "demo_seed",
  });
}

seedDemoSafetyAlert();
