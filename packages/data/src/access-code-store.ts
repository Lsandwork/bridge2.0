import type { AppRole } from "@family-support/core";
import { getDemoAuthUserById, type PublicAuthUser } from "./auth-store";

export type ProfileRelationship = "parent" | "therapist" | "self";

export type UserProfileLink = {
  userId: string;
  profileId: string;
  relationship: ProfileRelationship;
  linkedAt: string;
};

export type AccessCodeRecord = {
  code: string;
  profileId: string;
  createdByUserId: string;
  createdAt: string;
};

export type UserSetupRecord = {
  userId: string;
  accountType: "parent" | "therapist";
  setupComplete: boolean;
};

const profileLinks: UserProfileLink[] = [
  { userId: "u-demo-caregiver", profileId: "cp-demo-jasper", relationship: "parent", linkedAt: "2026-01-01T00:00:00.000Z" },
  { userId: "u-demo-casemanager", profileId: "cp-demo-jasper", relationship: "therapist", linkedAt: "2026-01-01T00:00:00.000Z" },
  { userId: "u-demo-user", profileId: "cp-demo-jasper", relationship: "self", linkedAt: "2026-01-01T00:00:00.000Z" },
];

const accessCodes: AccessCodeRecord[] = [
  { code: "BR-JSPR-7K4M", profileId: "cp-demo-jasper", createdByUserId: "u-demo-caregiver", createdAt: "2026-01-01T00:00:00.000Z" },
];

const setupRecords: UserSetupRecord[] = [
  { userId: "u-demo-caregiver", accountType: "parent", setupComplete: true },
  { userId: "u-demo-casemanager", accountType: "therapist", setupComplete: true },
  { userId: "u-demo-user", accountType: "parent", setupComplete: true },
];

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomBlock(length = 4): string {
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return out;
}

export function generateAccessCode(profileId: string, createdByUserId: string): string {
  let code = `BR-${randomBlock()}-${randomBlock()}`;
  while (accessCodes.some((c) => c.code === code)) {
    code = `BR-${randomBlock()}-${randomBlock()}`;
  }
  accessCodes.push({
    code,
    profileId,
    createdByUserId,
    createdAt: new Date().toISOString(),
  });
  return code;
}

export function getAccessCodeForProfile(profileId: string): string | null {
  return accessCodes.find((c) => c.profileId === profileId)?.code ?? null;
}

export function getProfileIdForAccessCode(code: string): string | null {
  const normalized = code.trim().toUpperCase();
  return accessCodes.find((c) => c.code === normalized)?.profileId ?? null;
}

export function redeemAccessCode(code: string, userId: string, relationship: ProfileRelationship): string {
  const normalized = code.trim().toUpperCase();
  const record = accessCodes.find((c) => c.code === normalized);
  if (!record) throw new Error("Invalid access code. Check the code and try again.");

  const already = profileLinks.some(
    (l) => l.userId === userId && l.profileId === record.profileId && l.relationship === relationship
  );
  if (!already) {
    profileLinks.push({
      userId,
      profileId: record.profileId,
      relationship,
      linkedAt: new Date().toISOString(),
    });
  }
  return record.profileId;
}

export function linkUserToProfile(userId: string, profileId: string, relationship: ProfileRelationship): void {
  if (profileLinks.some((l) => l.userId === userId && l.profileId === profileId)) return;
  profileLinks.push({
    userId,
    profileId,
    relationship,
    linkedAt: new Date().toISOString(),
  });
}

export function getLinkedProfileIds(userId: string): string[] {
  return [...new Set(profileLinks.filter((l) => l.userId === userId).map((l) => l.profileId))];
}

export function getSelfProfileIdsForUser(userId: string): string[] {
  return profileLinks.filter((l) => l.userId === userId && l.relationship === "self").map((l) => l.profileId);
}

export function getCareTeamUserIdsForProfile(profileId: string): string[] {
  return [
    ...new Set(
      profileLinks
        .filter(
          (l) => l.profileId === profileId && (l.relationship === "parent" || l.relationship === "therapist")
        )
        .map((l) => l.userId)
    ),
  ];
}

export function getUserSetup(userId: string): UserSetupRecord | null {
  return setupRecords.find((s) => s.userId === userId) ?? null;
}

export function createUserSetup(userId: string, accountType: "parent" | "therapist"): UserSetupRecord {
  const existing = getUserSetup(userId);
  if (existing) return existing;
  const record: UserSetupRecord = { userId, accountType, setupComplete: false };
  setupRecords.push(record);
  return record;
}

export function markSetupComplete(userId: string): void {
  const record = setupRecords.find((s) => s.userId === userId);
  if (record) record.setupComplete = true;
  else setupRecords.push({ userId, accountType: "parent", setupComplete: true });
}

export function needsAccountSetup(user: PublicAuthUser): boolean {
  if (user.role === "admin" || user.role === "super_admin" || user.role === "child_user") return false;
  if (typeof user.onboardingComplete === "boolean") return !user.onboardingComplete;
  const setup = getUserSetup(user.id);
  if (!setup) return user.role === "parent_guardian" || user.role === "caregiver_therapist_teacher";
  return !setup.setupComplete;
}

export function setupPathForRole(role: AppRole): string {
  if (role === "caregiver_therapist_teacher") return "/setup/therapist";
  if (role === "parent_guardian") return "/setup/parent";
  return "/dashboard";
}

export function homePathForAuthUser(user: PublicAuthUser): string {
  if (user.mustChangePassword) return "/change-password";
  if (needsAccountSetup(user)) return setupPathForRole(user.role);
  if (user.role === "child_user") return "/my-space";
  if (user.role === "caregiver_therapist_teacher") return "/therapist";
  if (user.role === "admin" || user.role === "super_admin") return "/admin";
  return "/dashboard";
}

export function filterProfileIdsForUser(userId: string, role: AppRole, allProfileIds: string[]): string[] {
  if (role === "admin" || role === "super_admin") return allProfileIds;
  const linked = getLinkedProfileIds(userId);
  if (linked.length > 0) return allProfileIds.filter((id) => linked.includes(id));
  if (role === "parent_guardian" || role === "caregiver_therapist_teacher") return [];
  return [];
}
