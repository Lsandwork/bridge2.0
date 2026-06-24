import type { PublicAuthUser } from "./auth-store";
import {
  getCareTeamUserIdsForProfile,
  getSelfProfileIdsForUser,
} from "./access-code-store";
import { getLocalChildProfiles } from "./local-store";

export type CareNotificationType = "spectrum_login" | "spectrum_logout" | "system";

export type CareNotification = {
  id: string;
  recipientUserId: string;
  type: CareNotificationType;
  title: string;
  message: string;
  profileId?: string;
  profileName?: string;
  actorUserId?: string;
  actorName?: string;
  read: boolean;
  at: string;
};

const notifications: CareNotification[] = [];

function nowIso() {
  return new Date().toISOString();
}

export function createCareNotification(input: Omit<CareNotification, "id" | "read" | "at">): CareNotification {
  const note: CareNotification = {
    ...input,
    id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    read: false,
    at: nowIso(),
  };
  notifications.unshift(note);
  if (notifications.length > 300) notifications.length = 300;
  return note;
}

export function getNotificationsForUser(userId: string, limit = 50): CareNotification[] {
  return notifications.filter((n) => n.recipientUserId === userId).slice(0, limit);
}

export function getUnreadNotificationCount(userId: string): number {
  return notifications.filter((n) => n.recipientUserId === userId && !n.read).length;
}

export function markNotificationRead(notificationId: string, userId: string): boolean {
  const note = notifications.find((n) => n.id === notificationId && n.recipientUserId === userId);
  if (!note) return false;
  note.read = true;
  return true;
}

export function markAllNotificationsRead(userId: string): number {
  let count = 0;
  for (const note of notifications) {
    if (note.recipientUserId === userId && !note.read) {
      note.read = true;
      count += 1;
    }
  }
  return count;
}

export function notifySpectrumAuthEvent(user: PublicAuthUser, action: "login" | "logout"): void {
  if (user.role !== "child_user") return;

  const profileIds = getSelfProfileIdsForUser(user.id);
  if (profileIds.length === 0) return;

  const profiles = getLocalChildProfiles();
  const actionLabel = action === "login" ? "signed in" : "signed out";
  const type: CareNotificationType = action === "login" ? "spectrum_login" : "spectrum_logout";

  for (const profileId of profileIds) {
    const profileName = profiles.find((p) => p.id === profileId)?.name ?? user.name;
    const careTeamIds = getCareTeamUserIdsForProfile(profileId);

    for (const recipientUserId of careTeamIds) {
      createCareNotification({
        recipientUserId,
        type,
        title: `${profileName} ${actionLabel}`,
        message: `${profileName} ${actionLabel} to Bridge My Space at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`,
        profileId,
        profileName,
        actorUserId: user.id,
        actorName: user.name,
      });
    }
  }
}
