import type { AppRole } from "@family-support/core";
import { DEMO_PROFILE_IDS, isDemoAccountId } from "./demo-accounts";
import {
  fetchPersistedChildProfiles,
  isDemoAuthUserId,
  userCanAccessPersistedProfile,
} from "./supabase-auth";
import { getDemoChildProfiles, type ChildProfile } from "./local-store";
import { getLinkedProfileIds } from "./access-code-store";

export type SessionProfileUser = {
  id: string;
  role: AppRole;
  isDemo?: boolean;
};

export { DEMO_PROFILE_IDS };

export async function resolveProfilesForSessionUser(
  session: SessionProfileUser
): Promise<ChildProfile[]> {
  if (isDemoAuthUserId(session.id) || isDemoAccountId(session.id)) {
    const linked = getLinkedProfileIds(session.id);
    const ids = linked.length > 0 ? linked : [...DEMO_PROFILE_IDS];
    return getDemoChildProfiles().filter((p) => ids.includes(p.id));
  }

  return fetchPersistedChildProfiles(session.id, session.role);
}

export async function userCanAccessProfile(
  session: SessionProfileUser,
  profileId: string
): Promise<boolean> {
  if (session.role === "admin" || session.role === "super_admin") return true;
  if (isLegacyDemoProfileRequest(session, profileId)) return false;
  return userCanAccessPersistedProfile(session.id, session.role, profileId);
}

function isLegacyDemoProfileRequest(session: SessionProfileUser, profileId: string): boolean {
  if (isDemoAuthUserId(session.id)) return false;
  return profileId === "cp1" || profileId === "cp2";
}

export async function resolveChildProfilesForSession(
  session: SessionProfileUser | null | undefined
): Promise<ChildProfile[]> {
  if (!session?.id || !session.role) return [];
  return resolveProfilesForSessionUser(session);
}
