import type { AppRole } from "@family-support/core";
import { getLocalChildProfiles, type ChildProfile } from "./local-store";
import { filterProfileIdsForUser, getLinkedProfileIds } from "./access-code-store";

/** Which profile IDs each role may open when no explicit links exist (legacy demo). */
const LEGACY_ROLE_PROFILE_ACCESS: Record<AppRole, "all" | string[]> = {
  parent_guardian: "all",
  admin: "all",
  super_admin: "all",
  caregiver_therapist_teacher: "all",
  child_user: [],
};

export function getLinkedProfileIdForAuthUser(authUserId: string): string | null {
  const links = getLinkedProfileIds(authUserId);
  const self = links[0];
  if (self) return self;
  return null;
}

export function filterProfilesForAuthUser(
  profiles: ChildProfile[],
  authUserId: string,
  role: AppRole
): ChildProfile[] {
  const linkedIds = getLinkedProfileIds(authUserId);
  if (linkedIds.length > 0) {
    return profiles.filter((p) => linkedIds.includes(p.id));
  }

  if (role === "child_user") {
    const own = profiles.find((p) => p.name.toLowerCase() === "nathan");
    return own ? [own] : profiles.slice(0, 1);
  }

  const access = LEGACY_ROLE_PROFILE_ACCESS[role];
  if (access === "all") return profiles;
  return profiles.filter((p) => access.includes(p.id));
}

export async function resolveChildProfilesForSession(
  authUserId: string | undefined,
  role: AppRole | undefined,
  fetchAll: () => Promise<ChildProfile[]>
): Promise<ChildProfile[]> {
  const all = await fetchAll();
  const local = getLocalChildProfiles();
  const profiles = all.length > 0 ? all : local;

  if (!authUserId || !role) return profiles;
  return filterProfilesForAuthUser(profiles, authUserId, role);
}

export function filterProfilesByUserAccess(
  profiles: ChildProfile[],
  userId: string,
  role: AppRole
): ChildProfile[] {
  const ids = filterProfileIdsForUser(
    userId,
    role,
    profiles.map((p) => p.id)
  );
  if (role === "admin" || role === "super_admin") return profiles;
  if (ids.length === 0 && (role === "parent_guardian" || role === "caregiver_therapist_teacher")) {
    return filterProfilesForAuthUser(profiles, userId, role);
  }
  return profiles.filter((p) => ids.includes(p.id));
}
