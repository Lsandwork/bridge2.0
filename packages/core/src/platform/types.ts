export type BridgeMemberRole =
  | "center_user"
  | "parent_caregiver"
  | "therapist"
  | "case_manager"
  | "school_iep"
  | "admin_observer";

export type BridgeGroupStatus = "active" | "inactive" | "archived";

export type BridgeGroup = {
  id: string;
  displayName: string;
  centerUserId: string | null;
  centerChildProfileId: string | null;
  createdBy: string | null;
  status: BridgeGroupStatus;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BridgeGroupMember = {
  id: string;
  bridgeGroupId: string;
  userId: string;
  memberRole: BridgeMemberRole;
  status: "active" | "removed" | "pending";
  joinedAt: string;
  userName?: string;
  userEmail?: string;
};

export type BridgeAccessCode = {
  id: string;
  bridgeGroupId: string;
  code: string;
  memberRole: BridgeMemberRole;
  expiresAt: string | null;
  revokedAt: string | null;
  redeemedAt: string | null;
  createdAt: string;
};

export type BridgeConversation = {
  id: string;
  bridgeGroupId: string;
  bridgeGroupName: string;
  subject: string | null;
  urgency: "normal" | "urgent";
  lastMessageAt: string;
  unreadCount: number;
  participantNames: string[];
};

export type BridgeMessage = {
  id: string;
  conversationId: string;
  bridgeGroupId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  body: string;
  urgency: "normal" | "urgent";
  createdAt: string;
  readByMe: boolean;
};

export type SafetySeverity = "low" | "moderate" | "high" | "critical";
export type SafetyAlertStatus = "new" | "acknowledged" | "in_progress" | "resolved" | "escalated";

export type SafetyAlert = {
  id: string;
  bridgeGroupId: string | null;
  bridgeGroupName: string | null;
  userId: string;
  userName: string;
  childProfileId: string | null;
  concernCategory: string;
  severity: SafetySeverity;
  status: SafetyAlertStatus;
  triggeringExcerpt: string;
  aiSummary: string | null;
  recommendedSteps: string | null;
  assignedResponderId: string | null;
  emergencyRecommended: boolean;
  isDemo: boolean;
  source: string;
  createdAt: string;
  updatedAt: string;
};

export type PlatformNotification = {
  id: string;
  userId: string;
  bridgeGroupId: string | null;
  type: string;
  title: string;
  body: string;
  severity: string;
  readAt: string | null;
  createdAt: string;
};

export type ErrorLogSeverity = "critical" | "high" | "medium" | "low" | "info";
export type ErrorLogStatus = "open" | "resolved" | "ignored";

export type ErrorLogEntry = {
  id: string;
  severity: ErrorLogSeverity;
  status: ErrorLogStatus;
  service: string;
  message: string;
  stackTrace: string | null;
  userId: string | null;
  route: string | null;
  requestId: string | null;
  environment: string;
  notes: string | null;
  createdAt: string;
  resolvedAt: string | null;
};

export type UserActivityEventType =
  | "login"
  | "logout"
  | "signup"
  | "onboarding_completed"
  | "profile_created"
  | "bridge_group_joined"
  | "message_sent"
  | "message_read"
  | "nuvio_chat_started"
  | "nuvio_safety_detected"
  | "safety_alert_created"
  | "course_unlocked"
  | "credit_granted"
  | "payment_status_changed"
  | "admin_action";

export type UserActivityEvent = {
  id: string;
  userId: string | null;
  email: string | null;
  bridgeGroupId: string | null;
  eventType: UserActivityEventType;
  detail: string | null;
  createdAt: string;
};

export type PaymentProcessorId = "stripe" | "paypal" | "square" | "venmo";

export type PaymentProcessorStatus = {
  id: PaymentProcessorId;
  label: string;
  configured: boolean;
  environment: "test" | "live" | "unknown";
  publicKeyPresent: boolean;
  secretKeyPresent: boolean;
  webhookConfigured: boolean;
  webhookHealthy: boolean | null;
  lastWebhookAt: string | null;
  lastPaymentError: string | null;
  enabled: boolean;
  notes: string;
};

export const NUVIO_CRISIS_RESPONSE = `I'm really glad you told me. You don't have to carry this alone.

Let's slow this moment down together. Are you in immediate danger right now?

Please stay near someone safe if you can. If you might hurt yourself or someone else, call emergency services now or tell a trusted adult right away.

I'm here with you in this moment.`;

export const SAFETY_CONCERN_CATEGORIES = [
  "self_harm",
  "harm_to_others",
  "bullying",
  "abuse",
  "substance_danger",
  "illegal_unsafe_act",
  "crisis_language",
  "distress",
] as const;

export type SafetyConcernCategory = (typeof SAFETY_CONCERN_CATEGORIES)[number];
