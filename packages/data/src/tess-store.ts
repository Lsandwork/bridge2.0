import {
  buildTessSystemPrompt,
  checkTessSafety,
  type TessConversationMode,
  type TessRiskLevel,
  type TessRoleScope,
  type TessSuggestionStatus,
  type TessSuggestionType,
} from "@family-support/core";
import {
  createLocalCommunicationCard,
  createLocalExercise,
  createLocalGoal,
  createLocalRoutine,
  createLocalReward,
  createLocalSocialStory,
  createLocalTask,
  getLocalChildProfiles,
  getLocalCheckIns,
  getLocalCommunicationCards,
  getLocalExercises,
  getLocalGoals,
  getLocalRoutines,
  getLocalSocialStories,
  getLocalTasks,
} from "./local-store";

export type TessConversation = {
  id: string;
  organizationId?: string;
  profileId?: string;
  childProfileId?: string;
  userId: string;
  role: string;
  title?: string;
  mode: TessConversationMode;
  summary?: string;
  safetyStatus: string;
  isFlagged: boolean;
  flaggedReason?: string;
  createdAt: string;
  updatedAt: string;
};

export type TessMessage = {
  id: string;
  conversationId: string;
  userId?: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  contentJson?: Record<string, unknown>;
  audioUrl?: string;
  transcript?: string;
  tokensInput: number;
  tokensOutput: number;
  model?: string;
  provider?: string;
  safetyStatus: string;
  createdAt: string;
};

export type TessAiSuggestion = {
  id: string;
  organizationId?: string;
  childProfileId?: string;
  createdByUserId?: string;
  conversationId?: string;
  suggestionType: TessSuggestionType;
  title: string;
  reason: string;
  suggestedPayload: Record<string, unknown>;
  status: TessSuggestionStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  riskLevel: TessRiskLevel;
  adminFlag: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TessSettings = {
  id: string;
  childProfileId?: string;
  userId?: string;
  organizationId?: string;
  tessEnabled: boolean;
  voiceEnabled: boolean;
  speechToTextEnabled: boolean;
  textToSpeechEnabled: boolean;
  simpleLanguage: boolean;
  lowStimulation: boolean;
  teenAdultRespectfulMode: boolean;
  requireParentApproval: boolean;
  allowSavePhrases: boolean;
  allowRoutineSuggestions: boolean;
  allowTaskSuggestions: boolean;
  allowExerciseSuggestions: boolean;
  allowSocialStorySuggestions: boolean;
  allowRewardSuggestions: boolean;
  allowGoalSuggestions: boolean;
  dataRetentionDays: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  escalationEnabled: boolean;
  onboardingComplete: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TessSafetyFlag = {
  id: string;
  conversationId: string;
  messageId?: string;
  userId?: string;
  childProfileId?: string;
  organizationId?: string;
  flagType: string;
  riskLevel: TessRiskLevel;
  description: string;
  status: "open" | "reviewing" | "resolved" | "escalated";
  adminNotes?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
};

export type TessPromptVersion = {
  id: string;
  name: string;
  roleScope: TessRoleScope;
  systemPrompt: string;
  safetyPrompt: string;
  version: number;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
};

export type TessUsageLog = {
  id: string;
  userId?: string;
  organizationId?: string;
  childProfileId?: string;
  provider?: string;
  model?: string;
  requestType: string;
  tokensInput: number;
  tokensOutput: number;
  estimatedCost: number;
  latencyMs?: number;
  success: boolean;
  errorMessage?: string;
  createdAt: string;
};

export type TessParentNotification = {
  id: string;
  parentUserId: string;
  childProfileId?: string;
  conversationId?: string;
  notificationType: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
};

function id(prefix: string) {
  return `${prefix}${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
}

function now() {
  return new Date().toISOString();
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const DEMO_USER = "u-parent-1";
const DEMO_CHILD = "cp1";

const defaultSettings = (): TessSettings => ({
  id: id("ts-"),
  tessEnabled: true,
  voiceEnabled: true,
  speechToTextEnabled: true,
  textToSpeechEnabled: true,
  simpleLanguage: false,
  lowStimulation: false,
  teenAdultRespectfulMode: true,
  requireParentApproval: true,
  allowSavePhrases: true,
  allowRoutineSuggestions: true,
  allowTaskSuggestions: true,
  allowExerciseSuggestions: true,
  allowSocialStorySuggestions: true,
  allowRewardSuggestions: true,
  allowGoalSuggestions: true,
  dataRetentionDays: 365,
  escalationEnabled: true,
  onboardingComplete: true,
  createdAt: now(),
  updatedAt: now(),
});

const store: {
  conversations: TessConversation[];
  messages: TessMessage[];
  suggestions: TessAiSuggestion[];
  settings: TessSettings[];
  safetyFlags: TessSafetyFlag[];
  promptVersions: TessPromptVersion[];
  usageLogs: TessUsageLog[];
  notifications: TessParentNotification[];
  providerConfig: {
    provider: string;
    model: string;
    voiceModel: string;
    sttModel: string;
    maxTokens: number;
    temperature: number;
  };
} = {
  providerConfig: {
    provider: process.env.AI_PROVIDER ?? "gemini",
    model: process.env.TESS_MODEL ?? "",
    voiceModel: process.env.TESS_VOICE_MODEL ?? "nova",
    sttModel: process.env.TESS_STT_MODEL ?? "whisper-1",
    maxTokens: 2048,
    temperature: 0.7,
  },
  conversations: [],
  messages: [],
  suggestions: [],
  settings: [
    { ...defaultSettings(), userId: DEMO_USER, childProfileId: DEMO_CHILD, id: "ts-cp1" },
    { ...defaultSettings(), userId: DEMO_USER, childProfileId: "cp2", id: "ts-cp2", simpleLanguage: true },
    { ...defaultSettings(), userId: DEMO_USER, id: "ts-parent", teenAdultRespectfulMode: true },
  ],
  safetyFlags: [],
  promptVersions: [
    {
      id: "tp-global-1",
      name: "Global Tess v1",
      roleScope: "global",
      systemPrompt: buildTessSystemPrompt("global"),
      safetyPrompt: "Safety-first educational companion.",
      version: 1,
      isActive: true,
      createdAt: daysAgo(30),
    },
    {
      id: "tp-child-1",
      name: "Child Tess v1",
      roleScope: "child",
      systemPrompt: buildTessSystemPrompt("child", { simpleLanguage: true }),
      safetyPrompt: "Child-safe responses only.",
      version: 1,
      isActive: true,
      createdAt: daysAgo(30),
    },
    {
      id: "tp-parent-1",
      name: "Parent Tess v1",
      roleScope: "parent",
      systemPrompt: buildTessSystemPrompt("parent"),
      safetyPrompt: "Parent guidance without diagnosis.",
      version: 1,
      isActive: true,
      createdAt: daysAgo(30),
    },
    {
      id: "tp-teen-1",
      name: "Teen Tess v1",
      roleScope: "teen",
      systemPrompt: buildTessSystemPrompt("teen", { teenAdultRespectful: true }),
      safetyPrompt: "Respectful teen mode.",
      version: 1,
      isActive: false,
      createdAt: daysAgo(20),
    },
    {
      id: "tp-caregiver-1",
      name: "Caregiver Tess v1",
      roleScope: "caregiver",
      systemPrompt: buildTessSystemPrompt("caregiver"),
      safetyPrompt: "Caregiver scope limits.",
      version: 1,
      isActive: true,
      createdAt: daysAgo(15),
    },
  ],
  usageLogs: [],
  notifications: [],
};

function seedTessData() {
  if (store.conversations.length > 0) return;

  const convIds = Array.from({ length: 10 }, (_, i) => `tc-seed-${i + 1}`);
  convIds.forEach((cid, i) => {
    const isParent = i % 3 === 0;
    store.conversations.push({
      id: cid,
      childProfileId: isParent ? DEMO_CHILD : DEMO_CHILD,
      userId: DEMO_USER,
      role: isParent ? "parent_guardian" : i % 2 ? "child_user" : "teen",
      title: isParent
        ? ["Bedtime routine planning", "Sensory log review", "Weekly summary"][i % 3]
        : ["Help with schedule", "I need a break", "Calm-down help"][i % 3],
      mode: isParent ? "parent_assistant" : i % 4 === 0 ? "voice" : "text",
      summary: "Conversation about daily support and skill practice.",
      safetyStatus: i === 7 ? "flagged" : "safe",
      isFlagged: i === 7,
      flaggedReason: i === 7 ? "Distress keywords detected" : undefined,
      createdAt: daysAgo(10 - i),
      updatedAt: daysAgo(10 - i),
    });
    store.messages.push(
      {
        id: `tm-${cid}-1`,
        conversationId: cid,
        userId: DEMO_USER,
        role: "user",
        content: isParent ? "Help me build a calming bedtime routine." : "I need a break.",
        tokensInput: 0,
        tokensOutput: 0,
        safetyStatus: "safe",
        createdAt: daysAgo(10 - i),
      },
      {
        id: `tm-${cid}-2`,
        conversationId: cid,
        role: "assistant",
        content: isParent
          ? "Here is a gentle bedtime routine with 5 steps. I can save this for your review."
          : "Okay. A break is a good choice. Do you want quiet, space, or movement?",
        tokensInput: 120,
        tokensOutput: 85,
        model: "tess",
        provider: "gemini",
        safetyStatus: "safe",
        createdAt: daysAgo(10 - i),
      }
    );
  });

  const suggestionTemplates: Omit<TessAiSuggestion, "id" | "createdAt" | "updatedAt">[] = [
    { childProfileId: DEMO_CHILD, suggestionType: "routine", title: "Calm bedtime routine", reason: "Requested in chat", suggestedPayload: { title: "Calm bedtime", schedule: "Daily 8:30 PM", steps: ["Bath", "Pajamas", "Story", "Lights dim"] }, status: "pending", riskLevel: "low", adminFlag: false },
    { childProfileId: DEMO_CHILD, suggestionType: "communication_card", title: "I need quiet", reason: "Frequent sensory logs", suggestedPayload: { phrase: "I need quiet", category: "Sensory" }, status: "pending", riskLevel: "low", adminFlag: false },
    { childProfileId: DEMO_CHILD, suggestionType: "social_story", title: "Dentist visit", reason: "Parent request", suggestedPayload: { title: "Going to the dentist", sentences: ["Today I visit the dentist.", "I can bring my comfort item."] }, status: "pending", riskLevel: "low", adminFlag: false },
    { childProfileId: DEMO_CHILD, suggestionType: "exercise", title: "Brushing teeth steps", reason: "Daily living skill", suggestedPayload: { title: "Brush teeth", goal: "Independent brushing", steps: ["Get toothbrush", "Apply paste", "Brush", "Rinse"] }, status: "pending", riskLevel: "low", adminFlag: false },
    { childProfileId: DEMO_CHILD, suggestionType: "reward", title: "Choose a show", reason: "Motivation", suggestedPayload: { title: "Choose family show", pointsRequired: 10, emoji: "📺" }, status: "pending", riskLevel: "low", adminFlag: false },
    { childProfileId: DEMO_CHILD, suggestionType: "goal", title: "Morning routine independence", reason: "Progress tracking", suggestedPayload: { title: "Morning routine independence", target: 7, current: 3 }, status: "pending", riskLevel: "low", adminFlag: false },
    { childProfileId: DEMO_CHILD, suggestionType: "task", title: "Pack lunch", reason: "Daily task", suggestedPayload: { title: "Pack lunch", points: 5 }, status: "pending", riskLevel: "low", adminFlag: false },
    { childProfileId: DEMO_CHILD, suggestionType: "calm_plan", title: "Quiet corner plan", reason: "Sensory support", suggestedPayload: { steps: ["Go to quiet corner", "Headphones", "Deep breath choice"] }, status: "pending", riskLevel: "low", adminFlag: false },
    { childProfileId: DEMO_CHILD, suggestionType: "routine", title: "Morning routine", reason: "Approved", suggestedPayload: { title: "Morning routine", schedule: "Weekdays 8 AM", steps: ["Wake", "Dress", "Breakfast"] }, status: "approved", riskLevel: "low", adminFlag: false, reviewedBy: DEMO_USER, reviewedAt: daysAgo(2) },
    { childProfileId: DEMO_CHILD, suggestionType: "communication_card", title: "I need help", reason: "Approved", suggestedPayload: { phrase: "I need help", category: "Help" }, status: "approved", riskLevel: "low", adminFlag: false, reviewedBy: DEMO_USER, reviewedAt: daysAgo(3) },
    { childProfileId: DEMO_CHILD, suggestionType: "exercise", title: "Hand washing", reason: "Rejected - too many steps", suggestedPayload: { title: "Hand washing", steps: ["Turn on water"] }, status: "rejected", riskLevel: "low", adminFlag: false, reviewedBy: DEMO_USER, reviewedAt: daysAgo(1) },
    { childProfileId: DEMO_CHILD, suggestionType: "social_story", title: "Loud places", reason: "Rejected", suggestedPayload: { title: "Loud places" }, status: "rejected", riskLevel: "low", adminFlag: false, reviewedBy: DEMO_USER, reviewedAt: daysAgo(1) },
    { childProfileId: DEMO_CHILD, suggestionType: "parent_summary", title: "Weekly summary", reason: "Auto-generated", suggestedPayload: { body: "Alex completed most tasks. Consider sensory breaks on Tuesdays." }, status: "approved", riskLevel: "low", adminFlag: false, reviewedBy: DEMO_USER, reviewedAt: daysAgo(4) },
    { childProfileId: DEMO_CHILD, suggestionType: "sensory_plan", title: "After-school sensory plan", reason: "Pattern noted", suggestedPayload: { items: ["Quiet time", "Movement break", "Snack"] }, status: "pending", riskLevel: "medium", adminFlag: false },
    { childProfileId: "cp2", suggestionType: "routine", title: "Homework routine", reason: "Teen profile", suggestedPayload: { title: "Homework block", schedule: "Daily 4 PM" }, status: "pending", riskLevel: "low", adminFlag: false },
  ];

  suggestionTemplates.forEach((s, i) => {
    store.suggestions.push({
      ...s,
      id: `tsg-seed-${i + 1}`,
      createdByUserId: DEMO_USER,
      conversationId: convIds[i % convIds.length],
      createdAt: daysAgo(8 - (i % 8)),
      updatedAt: daysAgo(8 - (i % 8)),
    });
  });

  for (let i = 0; i < 5; i++) {
    store.safetyFlags.push({
      id: `tsf-seed-${i + 1}`,
      conversationId: convIds[i],
      userId: DEMO_USER,
      childProfileId: DEMO_CHILD,
      flagType: ["distress", "overwhelmed", "help_request", "escalation", "review"][i],
      riskLevel: (["low", "medium", "medium", "high", "low"] as TessRiskLevel[])[i],
      description: "Sample safety flag for admin review",
      status: i < 2 ? "open" : "resolved",
      createdAt: daysAgo(5 - i),
    });
  }

  store.notifications.push({
    id: "tn-1",
    parentUserId: DEMO_USER,
    childProfileId: DEMO_CHILD,
    notificationType: "suggestion_pending",
    title: "New Tess suggestion ready",
    body: "Review a bedtime routine suggestion from Tess.",
    isRead: false,
    createdAt: daysAgo(0),
  });
}

seedTessData();

export function getTessProviderConfig() {
  return { ...store.providerConfig };
}

export function updateTessProviderConfig(patch: Partial<typeof store.providerConfig>) {
  Object.assign(store.providerConfig, patch);
  return getTessProviderConfig();
}

export function getTessConversations(filters?: { userId?: string; childProfileId?: string; role?: string }) {
  let list = [...store.conversations];
  if (filters?.userId) list = list.filter((c) => c.userId === filters.userId);
  if (filters?.childProfileId) list = list.filter((c) => c.childProfileId === filters.childProfileId);
  if (filters?.role) list = list.filter((c) => c.role === filters.role);
  return list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getTessConversation(id: string) {
  return store.conversations.find((c) => c.id === id) ?? null;
}

export function getTessMessages(conversationId: string) {
  return store.messages
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function createTessConversation(input: Omit<TessConversation, "id" | "createdAt" | "updatedAt" | "safetyStatus" | "isFlagged">) {
  const conv: TessConversation = {
    ...input,
    id: id("tc-"),
    safetyStatus: "safe",
    isFlagged: false,
    createdAt: now(),
    updatedAt: now(),
  };
  store.conversations.push(conv);
  return conv;
}

export function addTessMessage(input: Omit<TessMessage, "id" | "createdAt">) {
  const msg: TessMessage = { ...input, id: id("tm-"), createdAt: now() };
  store.messages.push(msg);
  const conv = store.conversations.find((c) => c.id === input.conversationId);
  if (conv) {
    conv.updatedAt = now();
    if (!conv.title && input.role === "user") conv.title = input.content.slice(0, 60);
  }
  return msg;
}

export function getTessSuggestions(filters?: {
  childProfileId?: string;
  status?: TessSuggestionStatus;
  suggestionType?: TessSuggestionType;
}) {
  let list = [...store.suggestions];
  if (filters?.childProfileId) list = list.filter((s) => s.childProfileId === filters.childProfileId);
  if (filters?.status) list = list.filter((s) => s.status === filters.status);
  if (filters?.suggestionType) list = list.filter((s) => s.suggestionType === filters.suggestionType);
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getTessSuggestion(id: string) {
  return store.suggestions.find((s) => s.id === id) ?? null;
}

export function createTessSuggestion(input: Omit<TessAiSuggestion, "id" | "createdAt" | "updatedAt" | "status" | "adminFlag">) {
  const s: TessAiSuggestion = {
    ...input,
    id: id("tsg-"),
    status: "pending",
    adminFlag: false,
    createdAt: now(),
    updatedAt: now(),
  };
  store.suggestions.push(s);
  store.notifications.push({
    id: id("tn-"),
    parentUserId: DEMO_USER,
    childProfileId: input.childProfileId,
    conversationId: input.conversationId,
    notificationType: "suggestion_pending",
    title: "Tess suggestion ready for review",
    body: input.title,
    isRead: false,
    createdAt: now(),
  });
  return s;
}

export function approveTessSuggestion(suggestionId: string, reviewedBy: string, editedPayload?: Record<string, unknown>) {
  const s = getTessSuggestion(suggestionId);
  if (!s || s.status !== "pending") return null;
  const payload = editedPayload ?? s.suggestedPayload;
  const childId = s.childProfileId ?? DEMO_CHILD;

  switch (s.suggestionType) {
    case "routine":
      createLocalRoutine({
        childProfileId: childId,
        title: String(payload.title ?? s.title),
        schedule: String(payload.schedule ?? "Daily"),
        steps: (payload.steps as string[] | undefined)?.map((t) => ({ title: t })) ?? [{ title: "Step 1" }],
        active: true,
      });
      break;
    case "task":
      createLocalTask({
        childProfileId: childId,
        title: String(payload.title ?? s.title),
        status: "pending",
        points: Number(payload.points ?? 5),
        dueAt: String(payload.dueAt ?? new Date().toISOString()),
      });
      break;
    case "social_story":
      createLocalSocialStory({
        childProfileId: childId,
        title: String(payload.title ?? s.title),
        sentences: (payload.sentences as string[]) ?? [String(payload.narrative ?? s.title)],
        situation: String(payload.situation ?? s.title),
      });
      break;
    case "communication_card":
      createLocalCommunicationCard({
        childProfileId: childId,
        phrase: String(payload.phrase ?? s.title),
        category: String(payload.category ?? "Help"),
        isFavorite: false,
      });
      break;
    case "exercise":
      createLocalExercise({
        childProfileId: childId,
        title: String(payload.title ?? s.title),
        category: String(payload.category ?? "life_skill"),
        goal: String(payload.goal ?? ""),
        steps: (payload.steps as string[]) ?? [],
        promptLevel: "Gestural",
        timerMinutes: 5,
        difficulty: "easy",
        frequency: "daily",
        rewardIdea: String(payload.rewardIdea ?? "Preferred activity"),
      });
      break;
    case "reward":
      createLocalReward({
        childProfileId: childId,
        title: String(payload.title ?? s.title),
        pointsRequired: Number(payload.pointsRequired ?? 10),
        emoji: String(payload.emoji ?? "⭐"),
      });
      break;
    case "goal":
      createLocalGoal({
        childProfileId: childId,
        title: String(payload.title ?? s.title),
        current: Number(payload.current ?? 0),
        target: Number(payload.target ?? 5),
      });
      break;
    default:
      break;
  }

  s.status = editedPayload ? "edited" : "approved";
  s.reviewedBy = reviewedBy;
  s.reviewedAt = now();
  s.suggestedPayload = payload;
  s.updatedAt = now();
  return s;
}

export function rejectTessSuggestion(suggestionId: string, reviewedBy: string) {
  const s = getTessSuggestion(suggestionId);
  if (!s) return null;
  s.status = "rejected";
  s.reviewedBy = reviewedBy;
  s.reviewedAt = now();
  s.updatedAt = now();
  return s;
}

export function archiveTessSuggestion(suggestionId: string, reviewedBy: string) {
  const s = getTessSuggestion(suggestionId);
  if (!s) return null;
  s.status = "archived";
  s.reviewedBy = reviewedBy;
  s.reviewedAt = now();
  s.updatedAt = now();
  return s;
}

export function getTessSettings(filters: { userId?: string; childProfileId?: string }) {
  if (filters.childProfileId) {
    return store.settings.find((s) => s.childProfileId === filters.childProfileId) ?? defaultSettings();
  }
  if (filters.userId) {
    return store.settings.find((s) => s.userId === filters.userId && !s.childProfileId) ?? defaultSettings();
  }
  return defaultSettings();
}

export function updateTessSettings(filters: { userId?: string; childProfileId?: string }, patch: Partial<TessSettings>) {
  let s = store.settings.find(
    (x) =>
      (filters.childProfileId && x.childProfileId === filters.childProfileId) ||
      (filters.userId && x.userId === filters.userId && !filters.childProfileId && !x.childProfileId)
  );
  if (!s) {
    s = { ...defaultSettings(), ...filters, id: id("ts-") };
    store.settings.push(s);
  }
  Object.assign(s, patch, { updatedAt: now() });
  return s;
}

export function createTessSafetyFlag(input: Omit<TessSafetyFlag, "id" | "createdAt" | "status">) {
  const flag: TessSafetyFlag = { ...input, id: id("tsf-"), status: "open", createdAt: now() };
  store.safetyFlags.push(flag);
  const conv = store.conversations.find((c) => c.id === input.conversationId);
  if (conv) {
    conv.isFlagged = true;
    conv.flaggedReason = input.description;
    conv.safetyStatus = "flagged";
  }
  return flag;
}

export function getTessSafetyFlags(status?: string) {
  let list = [...store.safetyFlags];
  if (status) list = list.filter((f) => f.status === status);
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function resolveTessSafetyFlag(flagId: string, resolvedBy: string, adminNotes?: string, escalate?: boolean) {
  const f = store.safetyFlags.find((x) => x.id === flagId);
  if (!f) return null;
  f.status = escalate ? "escalated" : "resolved";
  f.resolvedBy = resolvedBy;
  f.resolvedAt = now();
  if (adminNotes) f.adminNotes = adminNotes;
  return f;
}

export function getTessPromptVersions(activeOnly?: boolean) {
  let list = [...store.promptVersions];
  if (activeOnly) list = list.filter((p) => p.isActive);
  return list.sort((a, b) => b.version - a.version);
}

export function logTessUsage(input: Omit<TessUsageLog, "id" | "createdAt">) {
  const log: TessUsageLog = { ...input, id: id("tul-"), createdAt: now() };
  store.usageLogs.push(log);
  return log;
}

export function getTessUsageLogs(limit = 100) {
  return [...store.usageLogs].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
}

export function getTessAdminStats() {
  const suggestions = store.suggestions;
  return {
    totalConversations: store.conversations.length,
    totalMessages: store.messages.length,
    activeUsers: new Set(store.conversations.map((c) => c.userId)).size,
    tokenUsage: store.usageLogs.reduce((s, l) => s + l.tokensInput + l.tokensOutput, 0),
    estimatedCost: store.usageLogs.reduce((s, l) => s + l.estimatedCost, 0),
    provider: store.providerConfig.provider,
    model: store.providerConfig.model || "default",
    avgLatency:
      store.usageLogs.length > 0
        ? Math.round(store.usageLogs.reduce((s, l) => s + (l.latencyMs ?? 0), 0) / store.usageLogs.length)
        : 0,
    failedRequests: store.usageLogs.filter((l) => !l.success).length,
    safetyFilterActivations: store.safetyFlags.length,
    suggestionCount: suggestions.length,
    pendingSuggestions: suggestions.filter((s) => s.status === "pending").length,
    approvalRate:
      suggestions.filter((s) => s.status === "approved").length /
      Math.max(1, suggestions.filter((s) => ["approved", "rejected"].includes(s.status)).length),
    rejectionRate:
      suggestions.filter((s) => s.status === "rejected").length /
      Math.max(1, suggestions.filter((s) => ["approved", "rejected"].includes(s.status)).length),
    openSafetyFlags: store.safetyFlags.filter((f) => f.status === "open").length,
  };
}

export function getTessNotifications(parentUserId: string) {
  return store.notifications.filter((n) => n.parentUserId === parentUserId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function buildTessContext(childProfileId: string, roleScope: string) {
  const profile = getLocalChildProfiles().find((p) => p.id === childProfileId);
  return {
    profile: profile ?? null,
    routines: getLocalRoutines(childProfileId).slice(0, 5),
    tasks: getLocalTasks(childProfileId).slice(0, 10),
    goals: getLocalGoals().filter((g) => g.childProfileId === childProfileId),
    checkIns: getLocalCheckIns().filter((c) => c.childProfileId === childProfileId).slice(0, 10),
    communicationCards: getLocalCommunicationCards(childProfileId).slice(0, 15),
    exercises: getLocalExercises().filter((e) => e.childProfileId === childProfileId),
    socialStories: getLocalSocialStories(childProfileId),
    roleScope,
  };
}

export function processTessUserMessage(content: string, conversationId: string) {
  return checkTessSafety(content);
}

export { DEMO_USER, DEMO_CHILD };
