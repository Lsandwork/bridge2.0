import type { PlatformNotification } from "@family-support/core";

const notifications = new Map<string, PlatformNotification[]>();

function now() {
  return new Date().toISOString();
}

export function createPlatformNotification(input: {
  userId: string;
  bridgeGroupId?: string | null;
  type: string;
  title: string;
  body: string;
  severity?: string;
  metadata?: Record<string, unknown>;
}): PlatformNotification {
  const note: PlatformNotification = {
    id: `ntf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId: input.userId,
    bridgeGroupId: input.bridgeGroupId ?? null,
    type: input.type,
    title: input.title,
    body: input.body,
    severity: input.severity ?? "info",
    readAt: null,
    createdAt: now(),
  };
  const list = notifications.get(input.userId) ?? [];
  list.unshift(note);
  notifications.set(input.userId, list.slice(0, 200));
  return note;
}

export function listNotificationsForUser(userId: string, options?: { unreadOnly?: boolean }) {
  const list = notifications.get(userId) ?? [];
  if (options?.unreadOnly) return list.filter((n) => !n.readAt);
  return list;
}

export function markNotificationRead(userId: string, notificationId: string): boolean {
  const list = notifications.get(userId) ?? [];
  const note = list.find((n) => n.id === notificationId);
  if (!note) return false;
  note.readAt = now();
  return true;
}

export function getUnreadNotificationCount(userId: string): number {
  return listNotificationsForUser(userId, { unreadOnly: true }).length;
}

export function filterNotificationsForRole(userId: string, role: string) {
  const isCenterUser = role === "child_user";
  const list = listNotificationsForUser(userId);
  if (isCenterUser) {
    return list.filter((n) => n.type !== "safety_alert");
  }
  return list;
}
