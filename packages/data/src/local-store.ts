import {
  DEFAULT_REWARDS_POLICY,
  earnedMessage,
  evaluateGameEarn,
  practiceMessage,
  parentLibraryCategories,
  SAFETY_DISCLAIMER,
} from "@family-support/core";

export type ChildProfile = {
  id: string;
  name: string;
  ageGroup: "child" | "teen" | "adult";
  mode: string;
  supportNotes: string;
};

export type Routine = {
  id: string;
  childProfileId: string;
  title: string;
  schedule: string;
  steps: { title: string; supportTip?: string }[];
  active: boolean;
};

export type Task = {
  id: string;
  childProfileId: string;
  title: string;
  status: "pending" | "completed" | "skipped";
  points: number;
  dueAt: string;
};

export type CommunicationCard = {
  id: string;
  childProfileId: string;
  category: string;
  phrase: string;
  isFavorite: boolean;
  lastUsedAt?: string;
};

export type Goal = {
  id: string;
  childProfileId: string;
  title: string;
  current: number;
  target: number;
};

export type Reward = {
  id: string;
  childProfileId: string;
  title: string;
  pointsRequired: number;
  emoji?: string;
};

export type PointEvent = {
  id: string;
  childProfileId: string;
  amount: number;
  reason: string;
  source: "task" | "game" | "parent" | "redemption" | "video";
  createdAt: string;
};

export type Redemption = {
  id: string;
  childProfileId: string;
  rewardId: string;
  rewardTitle: string;
  pointsSpent: number;
  status: "pending" | "approved";
  createdAt: string;
};

export type ProfileGameSettings = {
  childProfileId: string;
  enabledGameIds: string[];
  /** @deprecated use dailyEarnSessionLimit */
  dailyGameLimit: number;
  dailyEarnSessionLimit: number;
  perGameDailyEarnLimit: number;
  dailyPointsCap: number;
  sameGameCooldownMinutes: number;
  gamesPlayedToday: number;
  earnSessionsToday: number;
  pointsEarnedToday: number;
  perGamePlaysToday: Record<string, number>;
  lastEarnAtByGame: Record<string, string>;
  lastPlayDate: string;
};

export type GameCompleteResult = {
  pointsAwarded: number;
  status: "earned" | "practice";
  practiceReason?: "per_game_limit" | "daily_points_cap" | "daily_session_limit" | "cooldown";
  message: string;
  event: PointEvent | null;
  balance: number;
  earnSummary: {
    pointsEarnedToday: number;
    dailyPointsCap: number;
    earnSessionsToday: number;
    dailyEarnSessionLimit: number;
    perGamePlaysToday: number;
    perGameDailyEarnLimit: number;
    cooldownMinutesLeft?: number;
  };
};

export type AiSuggestion = {
  id: string;
  childProfileId: string;
  type: string;
  details: string;
  status: "pending_review" | "approved" | "rejected";
  createdAt: string;
};

export type Exercise = {
  id: string;
  childProfileId: string;
  title: string;
  category: string;
  goal: string;
  steps: string[];
  promptLevel: string;
  timerMinutes: number;
  difficulty: string;
  frequency: string;
  rewardIdea: string;
};

export type CheckIn = {
  id: string;
  childProfileId: string;
  type: "emotion" | "sensory";
  value: string;
  notes?: string;
  createdAt: string;
};

export type CareTeamMember = {
  id: string;
  name: string;
  email: string;
  role: "therapist" | "teacher" | "caregiver" | "doctor";
  childProfileIds: string[];
  notes?: string;
};

export type Report = {
  id: string;
  childProfileId: string;
  title: string;
  body: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
};

export type SocialStory = {
  id: string;
  childProfileId: string;
  title: string;
  sentences: string[];
  situation: string;
};

export type LibraryArticle = {
  slug: string;
  title: string;
  body: string;
  purpose?: string;
  ageLevel?: string;
  materials?: string[];
  steps?: string[];
  promptGuide?: string;
  fadeGuide?: string;
  rewardIdea?: string;
  parentNotes?: string;
  safetyWarning?: string;
};

export type LibraryCategory = {
  slug: string;
  title: string;
  description: string;
  articles: LibraryArticle[];
};

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function articleBody(title: string, category: string): LibraryArticle {
  const base = {
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    title,
    body: `${title}: practical, evidence-informed guidance written in plain language for families supporting autistic children, teens, and adults.`,
    purpose: `Help families implement ${title.toLowerCase()} with dignity and predictability.`,
    ageLevel: "All ages (adjust prompts and visuals to developmental level)",
    materials: ["Visual schedule", "Communication board", "Timer", "Preferred reward"],
    steps: [
      "Preview what will happen before starting.",
      "Use one clear prompt at a time.",
      "Offer a break option before escalation.",
      "Celebrate effort, not perfection.",
    ],
    promptGuide: "Start with full support, then fade to gestural and independent steps.",
    fadeGuide: "Reduce prompts only after 3 successful calm completions.",
    rewardIdea: "Short preferred activity immediately after completion.",
    parentNotes: "Track patterns across sleep, hunger, sensory load, and transitions.",
  };

  if (category === "crisis-overload-support") {
    return {
      ...base,
      safetyWarning:
        "If anyone is at immediate risk of harm, contact emergency services. This guide supports overload response, not clinical crisis treatment.",
      body: `${title}: safety-first guidance for reducing demands, protecting everyone, and supporting recovery after overload.`,
    };
  }

  return base;
}

const library: LibraryCategory[] = parentLibraryCategories.map((cat) => ({
  slug: cat.slug,
  title: cat.title,
  description: `Evidence-informed ${cat.title.toLowerCase()} modules for daily family support.`,
  articles: cat.articles.map((title) => articleBody(title, cat.slug)),
}));

const store: {
  childProfiles: ChildProfile[];
  routines: Routine[];
  tasks: Task[];
  communicationCards: CommunicationCard[];
  goals: Goal[];
  rewards: Reward[];
  aiSuggestions: AiSuggestion[];
  exercises: Exercise[];
  checkIns: CheckIn[];
  users: { id: string; email: string; name: string; role: string }[];
  supportTickets: { id: string; title: string; status: string; createdAt: string }[];
  subscriptions: { id: string; org: string; plan: string; status: string; renewsAt: string }[];
  pointEvents: PointEvent[];
  redemptions: Redemption[];
  gameSettings: ProfileGameSettings[];
  careTeam: CareTeamMember[];
  reports: Report[];
  socialStories: SocialStory[];
} = {
  childProfiles: [
    { id: "cp1", name: "Nathan", ageGroup: "teen" as const, mode: "teen", supportNotes: "Responds well to visual schedules. Needs sensory breaks after loud environments." },
    { id: "cp2", name: "Sam", ageGroup: "teen" as const, mode: "teen", supportNotes: "Prefers written instructions and advance notice." },
  ],
  routines: [
    {
      id: "r1",
      childProfileId: "cp1",
      title: "Morning routine",
      schedule: "Weekdays 8:00 AM",
      steps: [
        { title: "Wake up", supportTip: "Gentle alarm + visual timer" },
        { title: "Get dressed", supportTip: "Two clothing choices ready" },
        { title: "Breakfast", supportTip: "Same plate and cup each day" },
        { title: "Brush teeth", supportTip: "Step-by-step visual card" },
        { title: "Pack bag", supportTip: "Picture checklist on door" },
      ],
      active: true,
    },
    {
      id: "r2",
      childProfileId: "cp1",
      title: "School transition",
      schedule: "Weekdays 8:45 AM",
      steps: [
        { title: "Put on shoes", supportTip: "Sensory-friendly options" },
        { title: "Review schedule", supportTip: "First/then board" },
        { title: "Walk to bus", supportTip: "Noise-canceling headphones available" },
      ],
      active: true,
    },
    {
      id: "r3",
      childProfileId: "cp2",
      title: "Bedtime routine",
      schedule: "Daily 9:00 PM",
      steps: [
        { title: "Shower", supportTip: "Preview steps 10 minutes early" },
        { title: "Pajamas", supportTip: "Soft fabric options ready" },
        { title: "Journal", supportTip: "Optional — no pressure" },
        { title: "Lights out", supportTip: "Calm-down menu if needed" },
      ],
      active: true,
    },
  ],
  tasks: [
    { id: "t1", childProfileId: "cp1", title: "Brush teeth", status: "completed" as const, points: 5, dueAt: daysAgo(0) },
    { id: "t2", childProfileId: "cp1", title: "Pack lunch", status: "completed" as const, points: 5, dueAt: daysAgo(0) },
    { id: "t3", childProfileId: "cp1", title: "Put toys away", status: "pending" as const, points: 3, dueAt: daysAgo(0) },
    { id: "t4", childProfileId: "cp1", title: "Wash hands before snack", status: "completed" as const, points: 3, dueAt: daysAgo(0) },
    { id: "t5", childProfileId: "cp1", title: "Read for 10 minutes", status: "completed" as const, points: 5, dueAt: daysAgo(1) },
    { id: "t6", childProfileId: "cp2", title: "Complete homework", status: "pending" as const, points: 8, dueAt: daysAgo(0) },
    { id: "t7", childProfileId: "cp2", title: "Walk the dog", status: "skipped" as const, points: 5, dueAt: daysAgo(1) },
  ],
  communicationCards: [
    { id: "cc1", childProfileId: "cp1", category: "Food", phrase: "I'm hungry", isFavorite: true, lastUsedAt: daysAgo(0) },
    { id: "cc2", childProfileId: "cp1", category: "Food", phrase: "More please", isFavorite: false },
    { id: "cc3", childProfileId: "cp1", category: "Bathroom", phrase: "I need the bathroom", isFavorite: true },
    { id: "cc4", childProfileId: "cp1", category: "Feelings", phrase: "I feel happy", isFavorite: true },
    { id: "cc5", childProfileId: "cp1", category: "Feelings", phrase: "I feel overwhelmed", isFavorite: true },
    { id: "cc6", childProfileId: "cp1", category: "Help", phrase: "I need help", isFavorite: true, lastUsedAt: daysAgo(0) },
    { id: "cc7", childProfileId: "cp1", category: "Break", phrase: "I need a break", isFavorite: true },
    { id: "cc8", childProfileId: "cp1", category: "Stop", phrase: "Stop", isFavorite: false },
    { id: "cc9", childProfileId: "cp1", category: "Yes / No", phrase: "Yes", isFavorite: false },
    { id: "cc10", childProfileId: "cp1", category: "Yes / No", phrase: "No", isFavorite: false },
    { id: "cc11", childProfileId: "cp1", category: "People", phrase: "Mom", isFavorite: false },
    { id: "cc12", childProfileId: "cp1", category: "Activities", phrase: "Play outside", isFavorite: true },
    { id: "cc13", childProfileId: "cp2", category: "Help", phrase: "I need space", isFavorite: true },
    { id: "cc14", childProfileId: "cp2", category: "Food", phrase: "I'm hungry", isFavorite: true },
    { id: "cc15", childProfileId: "cp2", category: "Feelings", phrase: "I feel happy", isFavorite: false },
    { id: "cc16", childProfileId: "cp2", category: "Bathroom", phrase: "I need the bathroom", isFavorite: false },
    { id: "cc17", childProfileId: "cp2", category: "Break", phrase: "I need a break", isFavorite: true },
  ],
  goals: [
    { id: "g1", childProfileId: "cp1", title: "Independent morning routine", current: 5, target: 7 },
    { id: "g2", childProfileId: "cp1", title: "Use AAC for transitions", current: 8, target: 10 },
    { id: "g3", childProfileId: "cp2", title: "Complete homework independently", current: 3, target: 5 },
  ],
  rewards: [
    { id: "rw1", childProfileId: "cp1", title: "Choose family movie", pointsRequired: 15, emoji: "🎬" },
    { id: "rw2", childProfileId: "cp1", title: "Extra playground time", pointsRequired: 10, emoji: "🛝" },
    { id: "rw3", childProfileId: "cp1", title: "Favorite snack pick", pointsRequired: 8, emoji: "🍿" },
    { id: "rw4", childProfileId: "cp2", title: "30 min gaming time", pointsRequired: 20, emoji: "🎮" },
  ],
  pointEvents: [
    { id: "pe1", childProfileId: "cp1", amount: 5, reason: "Completed: Brush teeth", source: "task", createdAt: new Date().toISOString() },
    { id: "pe2", childProfileId: "cp1", amount: 6, reason: "Pattern Match game", source: "game", createdAt: new Date().toISOString() },
    { id: "pe3", childProfileId: "cp2", amount: 3, reason: "Completed: Wash hands before snack", source: "task", createdAt: new Date().toISOString() },
    { id: "pe4", childProfileId: "cp2", amount: 4, reason: "Mood Check-In game", source: "game", createdAt: new Date().toISOString() },
  ],
  redemptions: [],
  gameSettings: [
    {
      childProfileId: "cp1",
      enabledGameIds: [
        "bubble-breathe", "color-sort", "mood-check", "pattern-match", "focus-garden", "match-pairs",
        "help-cards", "sensory-scan", "star-catcher", "rhythm-stars", "happy-pet", "rocket-glide",
        "treasure-path", "emoji-adventure",
      ],
      dailyGameLimit: 10,
      dailyEarnSessionLimit: 10,
      perGameDailyEarnLimit: 3,
      dailyPointsCap: 40,
      sameGameCooldownMinutes: 3,
      gamesPlayedToday: 1,
      earnSessionsToday: 1,
      pointsEarnedToday: 6,
      perGamePlaysToday: { "pattern-match": 1 },
      lastEarnAtByGame: { "pattern-match": new Date().toISOString() },
      lastPlayDate: new Date().toISOString().slice(0, 10),
    },
    {
      childProfileId: "cp2",
      enabledGameIds: [
        "bubble-breathe", "mood-check", "match-pairs", "help-cards", "sensory-scan",
        "star-catcher", "rhythm-stars", "happy-pet", "rocket-glide", "treasure-path", "emoji-adventure",
      ],
      dailyGameLimit: 10,
      dailyEarnSessionLimit: 10,
      perGameDailyEarnLimit: 3,
      dailyPointsCap: 40,
      sameGameCooldownMinutes: 3,
      gamesPlayedToday: 1,
      earnSessionsToday: 1,
      pointsEarnedToday: 4,
      perGamePlaysToday: { "mood-check": 1 },
      lastEarnAtByGame: { "mood-check": new Date().toISOString() },
      lastPlayDate: new Date().toISOString().slice(0, 10),
    },
  ],
  aiSuggestions: [
    {
      id: "ai1",
      childProfileId: "cp1",
      type: "AI routine builder",
      details: "Build a lower-demand bedtime routine for noisy evenings.",
      status: "pending_review" as const,
      createdAt: new Date().toISOString(),
    },
    {
      id: "ai2",
      childProfileId: "cp2",
      type: "AI social story generator",
      details: "When plans change at school with visual supports.",
      status: "pending_review" as const,
      createdAt: new Date().toISOString(),
    },
  ],
  exercises: [
    {
      id: "ex1",
      childProfileId: "cp2",
      title: "Brushing teeth",
      category: "hygiene_skill",
      goal: "Complete tooth brushing with visual sequence.",
      steps: ["Get toothbrush", "Apply pea-sized paste", "Brush top teeth", "Brush bottom teeth", "Rinse"],
      promptLevel: "Gestural",
      timerMinutes: 3,
      difficulty: "easy",
      frequency: "daily",
      rewardIdea: "Sticker on routine chart",
    },
  ],
  checkIns: [
    { id: "ci1", childProfileId: "cp1", type: "emotion" as const, value: "Happy", createdAt: daysAgo(0) },
    { id: "ci2", childProfileId: "cp1", type: "emotion" as const, value: "Calm", createdAt: daysAgo(1) },
    { id: "ci3", childProfileId: "cp1", type: "emotion" as const, value: "Anxious", createdAt: daysAgo(2) },
    { id: "ci4", childProfileId: "cp1", type: "emotion" as const, value: "Happy", createdAt: daysAgo(3) },
    { id: "ci5", childProfileId: "cp1", type: "emotion" as const, value: "Calm", createdAt: daysAgo(4) },
    { id: "ci6", childProfileId: "cp1", type: "sensory" as const, value: "Too loud", notes: "After lunchroom", createdAt: daysAgo(1) },
    { id: "ci7", childProfileId: "cp1", type: "sensory" as const, value: "Need quiet", createdAt: daysAgo(2) },
    { id: "ci8", childProfileId: "cp2", type: "emotion" as const, value: "Calm", createdAt: daysAgo(0) },
    { id: "ci9", childProfileId: "cp2", type: "sensory" as const, value: "Need movement", createdAt: daysAgo(1) },
  ],
  careTeam: [
    { id: "ct1", name: "Dr. Maya Chen", email: "maya.chen@sunriseclinic.org", role: "therapist", childProfileIds: ["cp1"], notes: "OT — sensory integration focus" },
    { id: "ct2", name: "Mr. James Rivera", email: "j.rivera@school.edu", role: "teacher", childProfileIds: ["cp1"], notes: "3rd grade — uses visual supports in class" },
    { id: "ct3", name: "Taylor Caregiver", email: "caregiver@demo.com", role: "caregiver", childProfileIds: ["cp1", "cp2"], notes: "After-school support Mon–Thu" },
  ],
  reports: [
    {
      id: "rp1",
      childProfileId: "cp1",
      title: "Weekly Progress — Alex",
      body: "Alex completed 78% of assigned tasks and maintained morning routines 5 of 7 days. Emotion check-ins show mostly Happy and Calm with one Anxious day (Tuesday). Recommend continuing visual schedule and adding a sensory break before transitions on busy days.",
      periodStart: daysAgo(7).slice(0, 10),
      periodEnd: daysAgo(0).slice(0, 10),
      createdAt: daysAgo(0),
    },
  ],
  socialStories: [
    {
      id: "ss1",
      childProfileId: "cp1",
      title: "When plans change at school",
      situation: "Schedule changes",
      sentences: [
        "Sometimes my teacher changes the plan.",
        "That can feel surprising.",
        "I can look at my visual schedule.",
        "I can ask for a break if I need one.",
        "The new plan will be okay.",
      ],
    },
    {
      id: "ss2",
      childProfileId: "cp1",
      title: "Going to the dentist",
      situation: "Medical visit",
      sentences: [
        "Today I will visit the dentist.",
        "The dentist helps keep my teeth healthy.",
        "I can bring my comfort item.",
        "I can tell the dentist if something feels too loud.",
        "When we are done, we go home.",
      ],
    },
  ],
  users: [
    { id: "u-admin", email: "lsand.work@gmail.com", name: "Lonnie Admin", role: "admin" },
    { id: "u-parent", email: "erika@test.com", name: "Erika Parent", role: "parent_guardian" },
    { id: "u-therapist", email: "therapist@test.com", name: "Jordan Therapist", role: "caregiver_therapist_teacher" },
    { id: "u-child", email: "nathan@test.com", name: "Nathan", role: "child_user" },
  ],
  supportTickets: [
    { id: "st1", title: "Need help exporting PDF", status: "open", createdAt: new Date().toISOString() },
    { id: "st2", title: "Push notifications not arriving", status: "in_progress", createdAt: new Date().toISOString() },
  ],
  subscriptions: [
    { id: "sub1", org: "Demo Family Org", plan: "family_plus", status: "active", renewsAt: "2026-07-19" },
    { id: "sub2", org: "Sunrise Therapy Center", plan: "starter", status: "trialing", renewsAt: "2026-06-26" },
  ],
};

export function getLocalDashboard(childProfileId = "cp1") {
  const today = new Date().toISOString().slice(0, 10);
  const profile = store.childProfiles.find((p) => p.id === childProfileId);
  const profileTasks = store.tasks.filter((t) => t.childProfileId === childProfileId);
  const completed = profileTasks.filter((t) => t.status === "completed").length;
  const profileRoutines = store.routines.filter((r) => r.childProfileId === childProfileId && r.active);
  const profileCheckIns = store.checkIns.filter((c) => c.childProfileId === childProfileId);
  const newSkills = store.goals.filter((g) => g.childProfileId === childProfileId && g.current >= 3).length;
  const completedRoutines =
    profileRoutines.length > 0 && profileTasks.some((t) => t.status === "completed")
      ? Math.min(profileRoutines.length, completed)
      : 0;

  return {
    safetyDisclaimer: SAFETY_DISCLAIMER,
    childProfileId,
    childName: profile?.name ?? "Child",
    tasksCompletedPct: profileTasks.length ? Math.round((completed / profileTasks.length) * 100) : 0,
    routinesCompletedPct:
      profileRoutines.length > 0 ? Math.round((completedRoutines / profileRoutines.length) * 100) : 0,
    checkInsCount: profileCheckIns.length,
    newSkillsCount: newSkills,
    routinesDue: profileRoutines.length,
    tasksCompletedToday: profileTasks.filter((t) => t.status === "completed" && t.dueAt.startsWith(today)).length,
    tasksSkipped: profileTasks.filter((t) => t.status === "skipped").length,
    emotionCheckIns: profileCheckIns.filter((c) => c.type === "emotion").length,
    sensoryLogs: profileCheckIns.filter((c) => c.type === "sensory").length,
    communicationCards: store.communicationCards.filter((c) => c.childProfileId === childProfileId).length,
    rewardsAvailable: store.rewards.filter((r) => r.childProfileId === childProfileId).length,
    completionRate: profileTasks.length ? Math.round((completed / profileTasks.length) * 100) : 0,
    weekChart: getLocalWeekChart(childProfileId),
    emotionBreakdown: getLocalEmotionBreakdown(childProfileId),
  };
}

export function getEmptyDashboard(childProfileId: string, childName: string) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return {
    safetyDisclaimer: SAFETY_DISCLAIMER,
    childProfileId,
    childName,
    tasksCompletedPct: 0,
    routinesCompletedPct: 0,
    checkInsCount: 0,
    newSkillsCount: 0,
    routinesDue: 0,
    tasksCompletedToday: 0,
    tasksSkipped: 0,
    emotionCheckIns: 0,
    sensoryLogs: 0,
    communicationCards: 0,
    rewardsAvailable: 0,
    completionRate: 0,
    weekChart: days.map((label) => ({ label, tasks: 0, routines: 0, checkIns: 0 })),
    emotionBreakdown: [] as { label: string; count: number; color: string }[],
  };
}

function getLocalWeekChart(childProfileId: string) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((label, i) => ({
    label,
    tasks: store.tasks.filter(
      (t) =>
        t.childProfileId === childProfileId &&
        t.status === "completed" &&
        t.dueAt.slice(0, 10) === daysAgo(6 - i).slice(0, 10)
    ).length,
    routines: store.tasks.filter(
      (t) =>
        t.childProfileId === childProfileId &&
        t.status === "completed" &&
        t.dueAt.slice(0, 10) === daysAgo(6 - i).slice(0, 10)
    ).length > 0
      ? 1
      : 0,
    checkIns: store.checkIns.filter(
      (c) => c.childProfileId === childProfileId && c.createdAt.slice(0, 10) === daysAgo(6 - i).slice(0, 10)
    ).length,
  }));
}

function getLocalEmotionBreakdown(childProfileId: string) {
  const colors: Record<string, string> = {
    Happy: "#6366f1",
    Calm: "#10b981",
    Anxious: "#f59e0b",
    Sad: "#3b82f6",
    Overwhelmed: "#ef4444",
  };
  const counts: Record<string, number> = {};
  store.checkIns
    .filter((c) => c.childProfileId === childProfileId && c.type === "emotion")
    .forEach((c) => {
      counts[c.value] = (counts[c.value] ?? 0) + 1;
    });
  return Object.entries(counts).map(([label, count]) => ({
    label,
    count,
    color: colors[label] ?? "#8b8499",
  }));
}

export function getLocalLibrary() {
  return library;
}

export function getLocalLibraryCategory(slug: string) {
  return library.find((c) => c.slug === slug) ?? null;
}

export function getLocalChildProfiles() {
  return store.childProfiles;
}

export function createLocalChildProfile(input: Omit<ChildProfile, "id">) {
  const profile = { ...input, id: `cp${Date.now()}` };
  store.childProfiles.push(profile);
  return profile;
}

export function getLocalRoutines(childProfileId?: string) {
  return childProfileId
    ? store.routines.filter((r) => r.childProfileId === childProfileId)
    : store.routines;
}

export function getLocalTasks(childProfileId?: string) {
  return childProfileId ? store.tasks.filter((t) => t.childProfileId === childProfileId) : store.tasks;
}

export function createLocalTask(input: Omit<Task, "id">) {
  const task = { ...input, id: `task${Date.now()}` };
  store.tasks.push(task);
  return task;
}

export function getLocalCommunicationCards(childProfileId?: string) {
  return childProfileId
    ? store.communicationCards.filter((c) => c.childProfileId === childProfileId)
    : store.communicationCards;
}

export function createLocalCommunicationCard(input: Omit<CommunicationCard, "id">) {
  const card = { ...input, id: `cc${Date.now()}` };
  store.communicationCards.push(card);
  return card;
}

export function getLocalGoals() {
  return store.goals;
}

export function getLocalRewards() {
  return store.rewards;
}

export function getLocalAiSuggestions() {
  return store.aiSuggestions;
}

export function updateLocalAiSuggestion(id: string, status: "approved" | "rejected") {
  const item = store.aiSuggestions.find((s) => s.id === id);
  if (item) item.status = status;
  return item ?? null;
}

export function getLocalExercises() {
  return store.exercises;
}

export function createLocalExercise(input: Omit<Exercise, "id">) {
  const exercise = { ...input, id: `ex${Date.now()}` };
  store.exercises.push(exercise);
  return exercise;
}

export function getLocalCheckIns() {
  return store.checkIns;
}

export function getLocalAdminStats() {
  return {
    activeFamilies: 1284,
    openTickets: store.supportTickets.filter((t) => t.status === "open").length,
    pendingAiReviews: store.aiSuggestions.filter((s) => s.status === "pending_review").length,
    safetyFlags: 6,
    errorLogs24h: 13,
    retention: "92%",
    trialingOrgs: store.subscriptions.filter((s) => s.status === "trialing").length,
    pushDeliveryRate: "97.8%",
  };
}

export function getLocalUsers() {
  return store.users;
}

export function getLocalSupportTickets() {
  return store.supportTickets;
}

export function getLocalSubscriptions() {
  return store.subscriptions;
}

export function getPointsBalance(childProfileId: string) {
  return store.pointEvents
    .filter((e) => e.childProfileId === childProfileId)
    .reduce((sum, e) => sum + e.amount, 0);
}

export function getPointEvents(childProfileId?: string) {
  const events = childProfileId
    ? store.pointEvents.filter((e) => e.childProfileId === childProfileId)
    : store.pointEvents;
  return [...events].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getRedemptions(childProfileId?: string) {
  return childProfileId
    ? store.redemptions.filter((r) => r.childProfileId === childProfileId)
    : store.redemptions;
}

export function getGameSettings(childProfileId: string) {
  let settings = store.gameSettings.find((s) => s.childProfileId === childProfileId);
  if (!settings) {
    settings = {
      childProfileId,
      enabledGameIds: [
        "bubble-breathe", "color-sort", "mood-check", "pattern-match", "focus-garden", "match-pairs",
        "help-cards", "sensory-scan", "star-catcher", "rhythm-stars", "happy-pet", "rocket-glide",
        "treasure-path", "emoji-adventure",
      ],
      dailyGameLimit: DEFAULT_REWARDS_POLICY.dailyEarnSessionLimit,
      dailyEarnSessionLimit: DEFAULT_REWARDS_POLICY.dailyEarnSessionLimit,
      perGameDailyEarnLimit: DEFAULT_REWARDS_POLICY.perGameDailyEarnLimit,
      dailyPointsCap: DEFAULT_REWARDS_POLICY.dailyPointsCap,
      sameGameCooldownMinutes: DEFAULT_REWARDS_POLICY.sameGameCooldownMinutes,
      gamesPlayedToday: 0,
      earnSessionsToday: 0,
      pointsEarnedToday: 0,
      perGamePlaysToday: {},
      lastEarnAtByGame: {},
      lastPlayDate: new Date().toISOString().slice(0, 10),
    };
    store.gameSettings.push(settings);
  }
  return normalizeGameSettings(settings);
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeGameSettings(settings: ProfileGameSettings): ProfileGameSettings {
  const today = todayKey();
  const base = {
    dailyEarnSessionLimit:
      settings.dailyEarnSessionLimit ??
      settings.dailyGameLimit ??
      DEFAULT_REWARDS_POLICY.dailyEarnSessionLimit,
    perGameDailyEarnLimit:
      settings.perGameDailyEarnLimit ?? DEFAULT_REWARDS_POLICY.perGameDailyEarnLimit,
    dailyPointsCap: settings.dailyPointsCap ?? DEFAULT_REWARDS_POLICY.dailyPointsCap,
    sameGameCooldownMinutes:
      settings.sameGameCooldownMinutes ?? DEFAULT_REWARDS_POLICY.sameGameCooldownMinutes,
    perGamePlaysToday: settings.perGamePlaysToday ?? {},
    lastEarnAtByGame: settings.lastEarnAtByGame ?? {},
    earnSessionsToday: settings.earnSessionsToday ?? 0,
    pointsEarnedToday: settings.pointsEarnedToday ?? 0,
  };

  if (settings.lastPlayDate !== today) {
    settings.lastPlayDate = today;
    settings.gamesPlayedToday = 0;
    settings.earnSessionsToday = 0;
    settings.pointsEarnedToday = 0;
    settings.perGamePlaysToday = {};
    settings.lastEarnAtByGame = {};
  }

  Object.assign(settings, base);
  settings.dailyGameLimit = settings.dailyEarnSessionLimit;
  return settings;
}

export function getRewardsForProfile(childProfileId: string) {
  return store.rewards.filter((r) => r.childProfileId === childProfileId);
}

export function getRewardsHub(childProfileId: string) {
  const profile = store.childProfiles.find((p) => p.id === childProfileId);
  if (!profile) return null;
  return {
    profile,
    balance: getPointsBalance(childProfileId),
    pointEvents: getPointEvents(childProfileId),
    rewards: getRewardsForProfile(childProfileId),
    redemptions: getRedemptions(childProfileId),
    gameSettings: getGameSettings(childProfileId),
  };
}

export function addPointEvent(input: Omit<PointEvent, "id" | "createdAt">) {
  const event: PointEvent = {
    ...input,
    id: `pe${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  store.pointEvents.push(event);
  return event;
}

export function completeGameSession(
  childProfileId: string,
  gameId: string,
  gameTitle: string,
  pointsPerPlay: number
): GameCompleteResult {
  const settings = getGameSettings(childProfileId);
  if (!settings.enabledGameIds.includes(gameId)) {
    throw new Error("This game is not enabled for your profile.");
  }

  settings.gamesPlayedToday += 1;

  const perGamePlays = settings.perGamePlaysToday[gameId] ?? 0;
  const policy = {
    perGameDailyEarnLimit: settings.perGameDailyEarnLimit,
    dailyPointsCap: settings.dailyPointsCap,
    sameGameCooldownMinutes: settings.sameGameCooldownMinutes,
    dailyEarnSessionLimit: settings.dailyEarnSessionLimit,
  };

  const outcome = evaluateGameEarn({
    pointsPerPlay,
    perGamePlaysToday: perGamePlays,
    pointsEarnedToday: settings.pointsEarnedToday,
    earnSessionsToday: settings.earnSessionsToday,
    lastEarnAtForGame: settings.lastEarnAtByGame[gameId] ?? null,
    policy,
  });

  let event: PointEvent | null = null;
  let pointsAwarded = 0;
  let status: GameCompleteResult["status"] = "practice";
  let practiceReason: GameCompleteResult["practiceReason"];
  let message: string;
  let cooldownMinutesLeft: number | undefined;

  if (outcome.kind === "earned") {
    pointsAwarded = outcome.points;
    status = "earned";
    message = earnedMessage(pointsAwarded, gameTitle);
    settings.earnSessionsToday += 1;
    settings.pointsEarnedToday += pointsAwarded;
    settings.perGamePlaysToday[gameId] = perGamePlays + 1;
    settings.lastEarnAtByGame[gameId] = new Date().toISOString();
    event = addPointEvent({
      childProfileId,
      amount: pointsAwarded,
      reason: `${gameTitle} game`,
      source: "game",
    });
  } else {
    practiceReason = outcome.reason;
    cooldownMinutesLeft = outcome.cooldownMinutesLeft;
    message = practiceMessage(outcome.reason, {
      gameTitle,
      cooldownMinutesLeft: outcome.cooldownMinutesLeft,
    });
  }

  const balance = getPointsBalance(childProfileId);

  return {
    pointsAwarded,
    status,
    practiceReason,
    message,
    event,
    balance,
    earnSummary: {
      pointsEarnedToday: settings.pointsEarnedToday,
      dailyPointsCap: settings.dailyPointsCap,
      earnSessionsToday: settings.earnSessionsToday,
      dailyEarnSessionLimit: settings.dailyEarnSessionLimit,
      perGamePlaysToday: settings.perGamePlaysToday[gameId] ?? 0,
      perGameDailyEarnLimit: settings.perGameDailyEarnLimit,
      cooldownMinutesLeft,
    },
  };
}

export function requestRedemption(childProfileId: string, rewardId: string) {
  const reward = store.rewards.find((r) => r.id === rewardId && r.childProfileId === childProfileId);
  if (!reward) throw new Error("Reward not found.");
  const balance = getPointsBalance(childProfileId);
  if (balance < reward.pointsRequired) throw new Error("Not enough points yet.");
  const existing = store.redemptions.find(
    (r) => r.childProfileId === childProfileId && r.rewardId === rewardId && r.status === "pending"
  );
  if (existing) throw new Error("You already requested this reward.");
  const redemption: Redemption = {
    id: `rd${Date.now()}`,
    childProfileId,
    rewardId,
    rewardTitle: reward.title,
    pointsSpent: reward.pointsRequired,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  store.redemptions.push(redemption);
  addPointEvent({
    childProfileId,
    amount: -reward.pointsRequired,
    reason: `Redeemed: ${reward.title}`,
    source: "redemption",
  });
  return redemption;
}

export function approveRedemption(redemptionId: string) {
  const item = store.redemptions.find((r) => r.id === redemptionId);
  if (item) item.status = "approved";
  return item ?? null;
}

export function createLocalReward(input: Omit<Reward, "id">) {
  const reward = { ...input, id: `rw${Date.now()}` };
  store.rewards.push(reward);
  return reward;
}

export function updateLocalGameSettings(
  childProfileId: string,
  patch: Partial<
    Pick<
      ProfileGameSettings,
      | "enabledGameIds"
      | "dailyGameLimit"
      | "dailyEarnSessionLimit"
      | "perGameDailyEarnLimit"
      | "dailyPointsCap"
      | "sameGameCooldownMinutes"
    >
  >
) {
  const settings = getGameSettings(childProfileId);
  if (patch.enabledGameIds) settings.enabledGameIds = patch.enabledGameIds;
  if (patch.dailyEarnSessionLimit !== undefined) {
    settings.dailyEarnSessionLimit = patch.dailyEarnSessionLimit;
    settings.dailyGameLimit = patch.dailyEarnSessionLimit;
  } else if (patch.dailyGameLimit !== undefined) {
    settings.dailyGameLimit = patch.dailyGameLimit;
    settings.dailyEarnSessionLimit = patch.dailyGameLimit;
  }
  if (patch.perGameDailyEarnLimit !== undefined) settings.perGameDailyEarnLimit = patch.perGameDailyEarnLimit;
  if (patch.dailyPointsCap !== undefined) settings.dailyPointsCap = patch.dailyPointsCap;
  if (patch.sameGameCooldownMinutes !== undefined) {
    settings.sameGameCooldownMinutes = patch.sameGameCooldownMinutes;
  }
  return settings;
}

export function awardParentPoints(childProfileId: string, amount: number, reason: string) {
  return addPointEvent({ childProfileId, amount, reason, source: "parent" });
}

export function createLocalCheckIn(input: Omit<CheckIn, "id" | "createdAt">) {
  const checkIn: CheckIn = { ...input, id: `ci${Date.now()}`, createdAt: new Date().toISOString() };
  store.checkIns.push(checkIn);
  return checkIn;
}

export function completeLocalTask(taskId: string) {
  const task = store.tasks.find((t) => t.id === taskId);
  if (!task) return null;
  task.status = "completed";
  addPointEvent({ childProfileId: task.childProfileId, amount: task.points, reason: `Completed: ${task.title}`, source: "task" });
  return task;
}

export function createLocalRoutine(input: Omit<Routine, "id">) {
  const routine = { ...input, id: `r${Date.now()}` };
  store.routines.push(routine);
  return routine;
}

export function createLocalGoal(input: Omit<Goal, "id">) {
  const goal = { ...input, id: `g${Date.now()}` };
  store.goals.push(goal);
  return goal;
}

export function updateLocalGoalProgress(id: string, current: number) {
  const goal = store.goals.find((g) => g.id === id);
  if (goal) goal.current = current;
  return goal ?? null;
}

export function createLocalAiSuggestion(input: Omit<AiSuggestion, "id" | "createdAt" | "status">) {
  const suggestion: AiSuggestion = {
    ...input,
    id: `ai${Date.now()}`,
    status: "pending_review",
    createdAt: new Date().toISOString(),
  };
  store.aiSuggestions.push(suggestion);
  return suggestion;
}

export function getLocalCareTeam() {
  return store.careTeam;
}

export function createLocalCareTeamMember(input: Omit<CareTeamMember, "id">) {
  const member = { ...input, id: `ct${Date.now()}` };
  store.careTeam.push(member);
  return member;
}

export function getLocalReports(childProfileId?: string) {
  return childProfileId ? store.reports.filter((r) => r.childProfileId === childProfileId) : store.reports;
}

export function createLocalReport(input: Omit<Report, "id" | "createdAt">) {
  const report: Report = { ...input, id: `rp${Date.now()}`, createdAt: new Date().toISOString() };
  store.reports.push(report);
  return report;
}

export function createLocalSocialStory(input: Omit<SocialStory, "id">) {
  const story = { ...input, id: `ss${Date.now()}` };
  store.socialStories.push(story);
  return story;
}

export function getLocalSocialStories(childProfileId?: string) {
  return childProfileId ? store.socialStories.filter((s) => s.childProfileId === childProfileId) : store.socialStories;
}

export function useCommunicationCard(cardId: string) {
  const card = store.communicationCards.find((c) => c.id === cardId);
  if (card) card.lastUsedAt = new Date().toISOString();
  return card ?? null;
}
