import type { AppRole } from "@family-support/core";
import type { SessionProfileUser } from "./session-profiles";
import { resolveChildProfilesForSession } from "./session-profiles";

export function getLinkedProfileIdForAuthUser(_authUserId: string): string | null {
  return null;
}

export async function filterProfilesForAuthUser(
  profiles: { id: string }[],
  authUserId: string,
  role: AppRole
): Promise<{ id: string }[]> {
  const session: SessionProfileUser = { id: authUserId, role };
  const allowed = await resolveChildProfilesForSession(session);
  const allowedIds = new Set(allowed.map((p) => p.id));
  return profiles.filter((p) => allowedIds.has(p.id));
}

export { resolveChildProfilesForSession } from "./session-profiles";

export async function filterProfilesByUserAccess<T extends { id: string }>(
  profiles: T[],
  userId: string,
  role: AppRole
): Promise<T[]> {
  const filtered = await filterProfilesForAuthUser(profiles, userId, role);
  const ids = new Set(filtered.map((p) => p.id));
  return profiles.filter((p) => ids.has(p.id));
}
