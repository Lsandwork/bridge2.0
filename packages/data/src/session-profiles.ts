import type { AppRole } from "@family-support/core";
import { DEMO_ACCOUNT_IDS, DEMO_PROFILE_IDS, LEGACY_DEMO_PROFILE_IDS, shouldSeeLegacyDemoData } from "./demo-accounts";
import {
  fetchPersistedChildProfiles,
  isDemoAuthUserId,
  userCanAccessPersistedProfile,
} from "./supabase-auth";
import { getLocalChildProfiles, type ChildProfile } from "./local-store";
import { getLinkedProfileIds } from "./access-code-store";

export type SessionProfileUser = {
  id: string;
  role: AppRole;
  isDemo?: boolean;
};

export { DEMO_ACCOUNT_IDS, DEMO_PROFILE_IDS };

export async function resolveProfilesForSessionUser(
  session: SessionProfileUser
): Promise<ChildProfile[]> {
  if (isDemoAuthUserId(session.id)) {
    const linked = getLinkedProfileIds(session.id);
    const fallbackIds = shouldSeeLegacyDemoData(session.id)
      ? [...LEGACY_DEMO_PROFILE_IDS]
      : [...DEMO_PROFILE_IDS];
    const ids = linked.length > 0 ? linked : fallbackIds;
    return getLocalChildProfiles().filter((p) => ids.includes(p.id));
  }

  return fetchPersistedChildProfiles(session.id, session.role);
}

export async function userCanAccessProfile(
  session: SessionProfileUser,
  profileId: string
): Promise<boolean> {
  if (session.role === "admin" || session.role === "super_admin") return true;
  return userCanAccessPersistedProfile(session.id, session.role, profileId);
}

export async function resolveChildProfilesForSession(
  session: SessionProfileUser | null | undefined
): Promise<ChildProfile[]> {
  if (!session?.id || !session.role) return [];
  return resolveProfilesForSessionUser(session);
}
