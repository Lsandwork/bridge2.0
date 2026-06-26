import type { BridgeConversation, BridgeMessage } from "@family-support/core";
import {
  getBridgeGroup,
  getBridgeGroupMembers,
  getBridgeGroupsForUser,
  usersShareBridgeGroup,
} from "./bridge-store";
import { getDemoAuthUserById } from "./auth-store";
import { logPlatformActivity } from "./safety-alert-store";

type ConversationRecord = BridgeConversation & { memberIds: string[] };
const conversations = new Map<string, ConversationRecord>();
const messages = new Map<string, BridgeMessage[]>();
const readReceipts = new Map<string, Set<string>>();

function now() {
  return new Date().toISOString();
}

function seedDemoMessages() {
  if (conversations.size > 0) return;
  const convId = "conv-demo-1";
  const group = getBridgeGroup("bg-demo-jasper");
  if (!group) return;

  conversations.set(convId, {
    id: convId,
    bridgeGroupId: group.id,
    bridgeGroupName: group.displayName,
    subject: "Welcome to Jasper's Bridge",
    urgency: "normal",
    lastMessageAt: now(),
    unreadCount: 0,
    participantNames: ["Alex Caregiver", "Sam Case Manager"],
    memberIds: ["u-demo-caregiver", "u-demo-casemanager", "u-demo-user"],
  });

  messages.set(convId, [
    {
      id: "msg-1",
      conversationId: convId,
      bridgeGroupId: group.id,
      senderId: "u-demo-casemanager",
      senderName: "Sam Case Manager",
      senderRole: "case_manager",
      body: "Welcome to Jasper's Bridge. I'm here to support coordination across the care team.",
      urgency: "normal",
      createdAt: now(),
      readByMe: true,
    },
    {
      id: "msg-2",
      conversationId: convId,
      bridgeGroupId: group.id,
      senderId: "u-demo-caregiver",
      senderName: "Alex Caregiver",
      senderRole: "parent_caregiver",
      body: "Thank you. Jasper had a good morning with routines today.",
      urgency: "normal",
      createdAt: now(),
      readByMe: false,
    },
  ]);
}

seedDemoMessages();

export function listConversationsForUser(userId: string, query?: string): BridgeConversation[] {
  const userGroups = new Set(getBridgeGroupsForUser(userId).map((g) => g.id));
  let list = [...conversations.values()].filter((c) => {
    if (!userGroups.has(c.bridgeGroupId)) return false;
    return c.memberIds.includes(userId) || getBridgeGroupMembers(c.bridgeGroupId).some((m) => m.userId === userId);
  });

  if (query?.trim()) {
    const q = query.toLowerCase();
    list = list.filter(
      (c) =>
        c.subject?.toLowerCase().includes(q) ||
        c.bridgeGroupName.toLowerCase().includes(q) ||
        c.participantNames.some((n) => n.toLowerCase().includes(q))
    );
  }

  return list
    .map((c) => ({
      ...c,
      unreadCount: countUnread(c.id, userId),
    }))
    .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
}

function countUnread(conversationId: string, userId: string): number {
  const msgs = messages.get(conversationId) ?? [];
  const read = readReceipts.get(conversationId) ?? new Set();
  return msgs.filter((m) => m.senderId !== userId && !read.has(`${m.id}:${userId}`)).length;
}

export function getConversationMessages(conversationId: string, userId: string): BridgeMessage[] {
  const conv = conversations.get(conversationId);
  if (!conv) return [];
  const userGroups = new Set(getBridgeGroupsForUser(userId).map((g) => g.id));
  if (!userGroups.has(conv.bridgeGroupId)) return [];

  const msgs = messages.get(conversationId) ?? [];
  return msgs.map((m) => ({
    ...m,
    readByMe: m.senderId === userId || (readReceipts.get(conversationId)?.has(`${m.id}:${userId}`) ?? false),
  }));
}

export function sendBridgeMessage(input: {
  conversationId?: string;
  bridgeGroupId: string;
  senderId: string;
  recipientId?: string;
  body: string;
  urgency?: "normal" | "urgent";
  subject?: string;
}): { conversation: BridgeConversation; message: BridgeMessage } | { error: string } {
  const group = getBridgeGroup(input.bridgeGroupId);
  if (!group) return { error: "Bridge Group not found." };

  const senderGroups = getBridgeGroupsForUser(input.senderId);
  if (!senderGroups.some((g) => g.id === input.bridgeGroupId)) {
    return { error: "You are not a member of this Bridge Group." };
  }

  if (input.recipientId && !usersShareBridgeGroup(input.senderId, input.recipientId)) {
    return { error: "You can only message members of your Bridge Group." };
  }

  let convId = input.conversationId;
  let conv = convId ? conversations.get(convId) : undefined;

  if (!conv) {
    convId = `conv-${Date.now()}`;
    const members = getBridgeGroupMembers(input.bridgeGroupId)
      .filter((m) => m.status === "active")
      .map((m) => m.userId);
    const names = members
      .map((id) => getDemoAuthUserById(id)?.name)
      .filter(Boolean) as string[];

    conv = {
      id: convId,
      bridgeGroupId: input.bridgeGroupId,
      bridgeGroupName: group.displayName,
      subject: input.subject ?? `Message in ${group.displayName}`,
      urgency: input.urgency ?? "normal",
      lastMessageAt: now(),
      unreadCount: 0,
      participantNames: names,
      memberIds: members,
    };
    conversations.set(convId, conv);
    messages.set(convId, []);
  }

  const sender = getDemoAuthUserById(input.senderId);
  const memberRole =
    getBridgeGroupMembers(input.bridgeGroupId).find((m) => m.userId === input.senderId)?.memberRole ?? "member";

  const message: BridgeMessage = {
    id: `msg-${Date.now()}`,
    conversationId: conv.id,
    bridgeGroupId: input.bridgeGroupId,
    senderId: input.senderId,
    senderName: sender?.name ?? "User",
    senderRole: memberRole,
    body: input.body.trim(),
    urgency: input.urgency ?? "normal",
    createdAt: now(),
    readByMe: true,
  };

  const list = messages.get(conv.id) ?? [];
  list.push(message);
  messages.set(conv.id, list);
  conv.lastMessageAt = message.createdAt;
  conv.urgency = message.urgency;

  logPlatformActivity({
    userId: input.senderId,
    email: sender?.email ?? null,
    bridgeGroupId: input.bridgeGroupId,
    eventType: "message_sent",
    detail: `Conversation ${conv.id}`,
  });

  return { conversation: { ...conv, unreadCount: 0 }, message };
}

export function markConversationRead(conversationId: string, userId: string): void {
  const msgs = messages.get(conversationId) ?? [];
  const read = readReceipts.get(conversationId) ?? new Set();
  for (const m of msgs) {
    if (m.senderId !== userId) read.add(`${m.id}:${userId}`);
  }
  readReceipts.set(conversationId, read);
  logPlatformActivity({
    userId,
    email: getDemoAuthUserById(userId)?.email ?? null,
    eventType: "message_read",
    detail: conversationId,
  });
}

export function getUnreadMessageCount(userId: string): number {
  return listConversationsForUser(userId).reduce((n, c) => n + c.unreadCount, 0);
}

export function getMessageableMembers(userId: string, bridgeGroupId: string) {
  const members = getBridgeGroupMembers(bridgeGroupId).filter(
    (m) => m.status === "active" && m.userId !== userId
  );
  return members.map((m) => ({
    userId: m.userId,
    name: m.userName ?? "Member",
    email: m.userEmail ?? "",
    role: m.memberRole,
  }));
}
