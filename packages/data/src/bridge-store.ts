import type {
  BridgeAccessCode,
  BridgeGroup,
  BridgeGroupMember,
  BridgeMemberRole,
} from "@family-support/core";
import { getDemoAuthUserById, listDemoAuthUsers, type PublicAuthUser } from "./auth-store";

export const DEMO_BRIDGE_GROUP_ID = "bg-demo-jasper";
export const LEGACY_DEMO_BRIDGE_GROUP_ID = "bg-legacy-nathan";

const groups = new Map<string, BridgeGroup>();
const members = new Map<string, BridgeGroupMember[]>();
const accessCodes = new Map<string, BridgeAccessCode>();

function now() {
  return new Date().toISOString();
}

function genCode() {
  const part = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BR-${part()}-${part()}`;
}

function seedDemoBridge() {
  if (groups.has(DEMO_BRIDGE_GROUP_ID)) return;

  groups.set(DEMO_BRIDGE_GROUP_ID, {
    id: DEMO_BRIDGE_GROUP_ID,
    displayName: "Jasper's Bridge",
    centerUserId: "u-demo-user",
    centerChildProfileId: "cp-demo-jasper",
    createdBy: "u-demo-caregiver",
    status: "active",
    isDemo: true,
    createdAt: now(),
    updatedAt: now(),
  });

  members.set(DEMO_BRIDGE_GROUP_ID, [
    {
      id: "bgm-1",
      bridgeGroupId: DEMO_BRIDGE_GROUP_ID,
      userId: "u-demo-user",
      memberRole: "center_user",
      status: "active",
      joinedAt: now(),
      userName: "Jasper",
      userEmail: "user@demo.com",
    },
    {
      id: "bgm-2",
      bridgeGroupId: DEMO_BRIDGE_GROUP_ID,
      userId: "u-demo-caregiver",
      memberRole: "parent_caregiver",
      status: "active",
      joinedAt: now(),
      userName: "Alex Caregiver",
      userEmail: "caregiver@demo.com",
    },
    {
      id: "bgm-3",
      bridgeGroupId: DEMO_BRIDGE_GROUP_ID,
      userId: "u-demo-casemanager",
      memberRole: "case_manager",
      status: "active",
      joinedAt: now(),
      userName: "Sam Case Manager",
      userEmail: "casemanager@demo.com",
    },
    {
      id: "bgm-4",
      bridgeGroupId: DEMO_BRIDGE_GROUP_ID,
      userId: "u-admin",
      memberRole: "admin_observer",
      status: "active",
      joinedAt: now(),
      userName: "Lonnie Admin",
      userEmail: "lsand.work@gmail.com",
    },
  ]);

  accessCodes.set("bac-demo-therapist", {
    id: "bac-demo-therapist",
    bridgeGroupId: DEMO_BRIDGE_GROUP_ID,
    code: "BR-DEMO-THER",
    memberRole: "therapist",
    expiresAt: null,
    revokedAt: null,
    redeemedAt: null,
    createdAt: now(),
  });

  groups.set(LEGACY_DEMO_BRIDGE_GROUP_ID, {
    id: LEGACY_DEMO_BRIDGE_GROUP_ID,
    displayName: "Nathan's Bridge (Legacy Demo)",
    centerUserId: "u-child",
    centerChildProfileId: "cp1",
    createdBy: "u-parent",
    status: "active",
    isDemo: true,
    createdAt: now(),
    updatedAt: now(),
  });

  members.set(LEGACY_DEMO_BRIDGE_GROUP_ID, [
    {
      id: "bgm-l1",
      bridgeGroupId: LEGACY_DEMO_BRIDGE_GROUP_ID,
      userId: "u-child",
      memberRole: "center_user",
      status: "active",
      joinedAt: now(),
      userName: "Nathan",
      userEmail: "nathan@test.com",
    },
    {
      id: "bgm-l2",
      bridgeGroupId: LEGACY_DEMO_BRIDGE_GROUP_ID,
      userId: "u-parent",
      memberRole: "parent_caregiver",
      status: "active",
      joinedAt: now(),
      userName: "Erika Parent",
      userEmail: "erika@test.com",
    },
    {
      id: "bgm-l3",
      bridgeGroupId: LEGACY_DEMO_BRIDGE_GROUP_ID,
      userId: "u-therapist",
      memberRole: "therapist",
      status: "active",
      joinedAt: now(),
      userName: "Jordan Therapist",
      userEmail: "therapist@test.com",
    },
  ]);
}

seedDemoBridge();

export function isDemoUserId(userId: string): boolean {
  return (
    userId.startsWith("u-demo-") ||
    ["u-parent", "u-therapist", "u-child", "u-admin"].includes(userId)
  );
}

export function listBridgeGroups(options?: { includeDemo?: boolean }): BridgeGroup[] {
  return [...groups.values()].filter((g) => options?.includeDemo || !g.isDemo);
}

export function getBridgeGroup(id: string): BridgeGroup | null {
  return groups.get(id) ?? null;
}

export function getBridgeGroupsForUser(userId: string): BridgeGroup[] {
  return [...groups.values()].filter((g) => {
    const groupMembers = members.get(g.id) ?? [];
    return groupMembers.some((m) => m.userId === userId && m.status === "active");
  });
}

export function getBridgeGroupMembers(bridgeGroupId: string): BridgeGroupMember[] {
  return members.get(bridgeGroupId) ?? [];
}

export function usersShareBridgeGroup(userA: string, userB: string): boolean {
  for (const group of groups.values()) {
    const groupMembers = members.get(group.id) ?? [];
    const ids = new Set(groupMembers.filter((m) => m.status === "active").map((m) => m.userId));
    if (ids.has(userA) && ids.has(userB)) return true;
  }
  return false;
}

export function getSharedBridgeGroup(userA: string, userB: string): BridgeGroup | null {
  for (const group of groups.values()) {
    const groupMembers = members.get(group.id) ?? [];
    const ids = new Set(groupMembers.filter((m) => m.status === "active").map((m) => m.userId));
    if (ids.has(userA) && ids.has(userB)) return group;
  }
  return null;
}

export function createBridgeGroup(input: {
  displayName: string;
  centerUserId?: string;
  centerChildProfileId?: string;
  createdBy: string;
  isDemo?: boolean;
}): BridgeGroup {
  const id = `bg-${Date.now()}`;
  const group: BridgeGroup = {
    id,
    displayName: input.displayName,
    centerUserId: input.centerUserId ?? null,
    centerChildProfileId: input.centerChildProfileId ?? null,
    createdBy: input.createdBy,
    status: "active",
    isDemo: input.isDemo ?? false,
    createdAt: now(),
    updatedAt: now(),
  };
  groups.set(id, group);
  members.set(id, []);
  return group;
}

export function addBridgeGroupMember(input: {
  bridgeGroupId: string;
  userId: string;
  memberRole: BridgeMemberRole;
  userName?: string;
  userEmail?: string;
}): BridgeGroupMember {
  const list = members.get(input.bridgeGroupId) ?? [];
  const existing = list.find((m) => m.userId === input.userId);
  if (existing) {
    existing.status = "active";
    existing.memberRole = input.memberRole;
    return existing;
  }
  const user = getDemoAuthUserById(input.userId);
  const member: BridgeGroupMember = {
    id: `bgm-${Date.now()}`,
    bridgeGroupId: input.bridgeGroupId,
    userId: input.userId,
    memberRole: input.memberRole,
    status: "active",
    joinedAt: now(),
    userName: input.userName ?? user?.name,
    userEmail: input.userEmail ?? user?.email,
  };
  list.push(member);
  members.set(input.bridgeGroupId, list);
  return member;
}

export function removeBridgeGroupMember(bridgeGroupId: string, userId: string): boolean {
  const list = members.get(bridgeGroupId) ?? [];
  const member = list.find((m) => m.userId === userId);
  if (!member) return false;
  member.status = "removed";
  return true;
}

export function createBridgeAccessCode(input: {
  bridgeGroupId: string;
  memberRole: BridgeMemberRole;
  createdBy: string;
  expiresInDays?: number;
}): BridgeAccessCode {
  const id = `bac-${Date.now()}`;
  const expiresAt = input.expiresInDays
    ? new Date(Date.now() + input.expiresInDays * 86400000).toISOString()
    : null;
  const code: BridgeAccessCode = {
    id,
    bridgeGroupId: input.bridgeGroupId,
    code: genCode(),
    memberRole: input.memberRole,
    expiresAt,
    revokedAt: null,
    redeemedAt: null,
    createdAt: now(),
  };
  accessCodes.set(id, code);
  return code;
}

export function revokeBridgeAccessCode(codeId: string): BridgeAccessCode | null {
  const code = accessCodes.get(codeId);
  if (!code) return null;
  code.revokedAt = now();
  return code;
}

export function redeemBridgeAccessCode(code: string, userId: string): {
  ok: boolean;
  error?: string;
  group?: BridgeGroup;
  member?: BridgeGroupMember;
} {
  const normalized = code.trim().toUpperCase();
  const entry = [...accessCodes.values()].find((c) => c.code === normalized);
  if (!entry) return { ok: false, error: "Invalid access code." };
  if (entry.revokedAt) return { ok: false, error: "This access code has been revoked." };
  if (entry.redeemedAt) return { ok: false, error: "This access code has already been used." };
  if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
    return { ok: false, error: "This access code has expired." };
  }

  const group = groups.get(entry.bridgeGroupId);
  if (!group || group.status !== "active") {
    return { ok: false, error: "Bridge Group is not active." };
  }

  const user = getDemoAuthUserById(userId);
  const member = addBridgeGroupMember({
    bridgeGroupId: entry.bridgeGroupId,
    userId,
    memberRole: entry.memberRole,
    userName: user?.name,
    userEmail: user?.email,
  });
  entry.redeemedAt = now();
  return { ok: true, group, member };
}

export function listBridgeAccessCodes(bridgeGroupId: string): BridgeAccessCode[] {
  return [...accessCodes.values()].filter((c) => c.bridgeGroupId === bridgeGroupId);
}

export function getAdminBridgeOverview() {
  return {
    totalGroups: groups.size,
    activeGroups: [...groups.values()].filter((g) => g.status === "active").length,
    demoGroups: [...groups.values()].filter((g) => g.isDemo).length,
    totalMembers: [...members.values()].reduce((n, m) => n + m.filter((x) => x.status === "active").length, 0),
    activeCodes: [...accessCodes.values()].filter((c) => !c.revokedAt && !c.redeemedAt).length,
  };
}

export function enrichUserWithBridgeInfo(user: PublicAuthUser) {
  const userGroups = getBridgeGroupsForUser(user.id);
  return {
    ...user,
    bridgeGroups: userGroups.map((g) => ({
      id: g.id,
      displayName: g.displayName,
      isDemo: g.isDemo,
      members: getBridgeGroupMembers(g.id).filter((m) => m.status === "active"),
    })),
  };
}

export function listAllUsersForAdmin() {
  return listDemoAuthUsers().map(enrichUserWithBridgeInfo);
}
