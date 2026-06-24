/** Therapist dashboard demo data — clinical operating system for neurodiversity care. */

export type AlertLevel = "low" | "medium" | "high" | "critical";

export type AutismPassport = {
  communicationStyle: string;
  sensoryTriggers: string[];
  sensorySupports: string[];
  preferredActivities: string[];
  calmingStrategies: string[];
  socialPreferences: string[];
  emergencyNotes: string;
  strengths: string[];
  interests: string[];
  accommodations: string[];
};

export type ClientProfile = {
  id: string;
  demographics: {
    name: string;
    age: number;
    diagnosis: string[];
    supportLevel: string;
  };
  insurance: {
    payer: string;
    authNumber: string;
    approvedUnits: number;
    usedUnits: number;
    expirationDate: string;
  };
  passport: AutismPassport;
  goalsProgress: number;
  parentEngagementScore: number;
};

export type TherapistGoal = {
  id: string;
  clientId: string;
  title: string;
  currentProgress: number;
  target: number;
  dueDate: string;
};

export type BehaviorEvent = {
  id: string;
  clientId: string;
  type: string;
  severity: number;
  durationMinutes: number;
  trigger?: string;
  interventionUsed?: string;
  outcome?: string;
  reportedBy: string;
  timestamp: string;
};

export type TherapistAction = {
  id: string;
  level: AlertLevel;
  title: string;
  detail: string;
  clientName?: string;
  dueLabel?: string;
};

export type TherapistMessage = {
  id: string;
  from: string;
  role: string;
  preview: string;
  body: string;
  unread: boolean;
  urgent: boolean;
  timestamp: string;
  replies: { from: string; text: string; at: string }[];
};

export type DocumentType = "progress_note" | "treatment_plan" | "medical_necessity" | "iep_report";

export type GeneratedDocument = {
  id: string;
  type: DocumentType;
  clientId: string;
  clientName: string;
  title: string;
  content: string;
  generatedAt: string;
  updatedAt: string;
  status: "draft" | "submitted";
};

export type InsuranceAuthorization = {
  clientId: string;
  clientName: string;
  payer: string;
  authNumber: string;
  approvedUnits: number;
  usedUnits: number;
  expirationDate: string;
  daysRemaining: number;
};

export type PatternInsight = {
  id: string;
  text: string;
  severity: AlertLevel;
};

export type TherapistDashboardSnapshot = {
  overview: {
    activeClients: number;
    sessionsThisWeek: number;
    reauthorizationsDue: number;
    highPriorityAlerts: number;
    unreadParentMessages: number;
    goalsCompletedThisMonth: number;
  };
  actionCenter: TherapistAction[];
  clients: ClientProfile[];
  goals: TherapistGoal[];
  recentBehaviors: BehaviorEvent[];
  patternInsights: PatternInsight[];
  messages: TherapistMessage[];
  documents: GeneratedDocument[];
  insurance: InsuranceAuthorization[];
  insuranceReadiness: {
    documentationComplete: number;
    authorizationUsage: number;
    missingNotes: number;
    reauthorizationRisk: "low" | "medium" | "high";
  };
  trends: {
    weeklyBehaviorFrequency: { label: string; count: number }[];
    monthlyImprovementScore: number;
    goalProgression: number;
    attendanceTrend: number;
    parentEngagementScore: number;
  };
};

const clients: ClientProfile[] = [
  {
    id: "cp1",
    demographics: {
      name: "Nathan",
      age: 15,
      diagnosis: ["Autism Spectrum Disorder", "ADHD"],
      supportLevel: "Level 2 — Substantial support",
    },
    insurance: {
      payer: "Blue Cross PPO",
      authNumber: "AUTH-2026-8842",
      approvedUnits: 48,
      usedUnits: 31,
      expirationDate: "2026-09-15",
    },
    passport: {
      communicationStyle: "Prefers short, direct sentences. Uses AAC cards when overwhelmed.",
      sensoryTriggers: ["Loud cafeterias", "Fluorescent flicker", "Unexpected schedule changes"],
      sensorySupports: ["Noise-canceling headphones", "Weighted lap pad", "Visual timer"],
      preferredActivities: ["Drawing", "Star Catcher game", "Outdoor walks"],
      calmingStrategies: ["Deep pressure", "Quiet corner", "Breathing with Tess"],
      socialPreferences: ["Small groups", "One friend at a time", "Advance notice for new people"],
      emergencyNotes: "May shut down before meltdown. Give space; do not force eye contact.",
      strengths: ["Visual memory", "Pattern recognition", "Kindness to younger kids"],
      interests: ["Space", "Trains", "Pixel art games"],
      accommodations: ["Extended time", "Movement breaks", "Written instructions"],
    },
    goalsProgress: 68,
    parentEngagementScore: 92,
  },
  {
    id: "cp2",
    demographics: {
      name: "Sam",
      age: 14,
      diagnosis: ["Autism Spectrum Disorder"],
      supportLevel: "Level 1 — Requiring support",
    },
    insurance: {
      payer: "Aetna",
      authNumber: "AUTH-2026-7711",
      approvedUnits: 32,
      usedUnits: 28,
      expirationDate: "2026-07-01",
    },
    passport: {
      communicationStyle: "Verbal; may need processing time before answering.",
      sensoryTriggers: ["Strong smells", "Crowded hallways"],
      sensorySupports: ["Sunglasses indoors", "Fidget tools"],
      preferredActivities: ["Reading", "Chess club"],
      calmingStrategies: ["Counting breaths", "Listening to music"],
      socialPreferences: ["Structured clubs", "Clear rules"],
      emergencyNotes: "Contact parent before calling crisis line unless safety risk.",
      strengths: ["Reading comprehension", "Attention to detail"],
      interests: ["History", "Maps", "Chess"],
      accommodations: ["Preferential seating", "Break cards"],
    },
    goalsProgress: 54,
    parentEngagementScore: 78,
  },
];

const goalsSeed: TherapistGoal[] = [
  { id: "g1", clientId: "cp1", title: "Initiate peer interaction", currentProgress: 68, target: 80, dueDate: "2026-09-01" },
  { id: "g2", clientId: "cp1", title: "Use AAC when overwhelmed", currentProgress: 82, target: 90, dueDate: "2026-08-15" },
  { id: "g3", clientId: "cp2", title: "Transition tolerance (5 min)", currentProgress: 54, target: 75, dueDate: "2026-10-01" },
  { id: "g4", clientId: "cp2", title: "Self-advocate for breaks", currentProgress: 61, target: 80, dueDate: "2026-09-20" },
  { id: "g5", clientId: "cp1", title: "Morning routine independence", currentProgress: 74, target: 85, dueDate: "2026-11-01" },
];

let behaviorEvents: BehaviorEvent[] = [
  { id: "b1", clientId: "cp1", type: "Sensory overload", severity: 3, durationMinutes: 25, trigger: "Fire drill", interventionUsed: "Quiet room + headphones", outcome: "Recovered within 30 min", reportedBy: "Erika (Parent)", timestamp: "2026-06-20T15:30:00.000Z" },
  { id: "b2", clientId: "cp1", type: "Anxiety episode", severity: 2, durationMinutes: 15, trigger: "Schedule change", reportedBy: "School staff", timestamp: "2026-06-19T09:00:00.000Z" },
  { id: "b3", clientId: "cp2", type: "Shutdown", severity: 2, durationMinutes: 40, trigger: "Group project", interventionUsed: "Break + written plan", reportedBy: "Jordan Therapist", timestamp: "2026-06-18T14:00:00.000Z" },
];

let therapistMessages: TherapistMessage[] = [
  {
    id: "m1",
    from: "Erika Parent",
    role: "Parent",
    preview: "Rough morning — used the calm plan. Can we review…",
    body: "Rough morning — used the calm plan before school. Nathan was able to get on the bus but seemed anxious. Can we review the transition strategy at our next session?",
    unread: true,
    urgent: false,
    timestamp: "2026-06-21T08:15:00.000Z",
    replies: [],
  },
  {
    id: "m2",
    from: "Ms. Rivera",
    role: "School",
    preview: "IEP accommodation check-in for Nathan",
    body: "Hi Jordan — I wanted to check in on Nathan's IEP accommodations before our quarterly meeting. The extended time and movement breaks are working well. Can you share updated goal progress?",
    unread: true,
    urgent: true,
    timestamp: "2026-06-20T16:00:00.000Z",
    replies: [],
  },
  {
    id: "m3",
    from: "Care Coordinator",
    role: "Coordinator",
    preview: "Prior auth submitted for Sam",
    body: "Prior authorization packet for Sam has been submitted to Aetna. Expected turnaround is 7–10 business days. I'll notify you when we receive approval.",
    unread: false,
    urgent: false,
    timestamp: "2026-06-19T11:00:00.000Z",
    replies: [{ from: "Jordan Therapist", text: "Thank you — please flag me if they request additional documentation.", at: "2026-06-19T14:30:00.000Z" }],
  },
];

let generatedDocuments: GeneratedDocument[] = [];

function nowIso() {
  return new Date().toISOString();
}

function documentTitle(type: DocumentType): string {
  const map: Record<DocumentType, string> = {
    progress_note: "Progress Note",
    treatment_plan: "Treatment Plan",
    medical_necessity: "Medical Necessity Report",
    iep_report: "IEP Support Report",
  };
  return map[type];
}

function buildDocumentContent(type: DocumentType, client: ClientProfile, clientGoals: TherapistGoal[]): string {
  const name = client.demographics.name;
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const goalLines = clientGoals
    .map((g) => `• ${g.title}: ${g.currentProgress}% progress (target ${g.target}% by ${g.dueDate})`)
    .join("\n");

  if (type === "progress_note") {
    return `PROGRESS NOTE — ${name}
Date: ${date}
Provider: Jordan Therapist, BCBA
Authorization: ${client.insurance.authNumber}

SESSION SUMMARY
Client participated in a 53-minute ABA session focused on social initiation and self-regulation skills. Parent report indicates consistent use of visual schedules at home. School staff noted one sensory overload event this week related to fire drill.

INTERVENTIONS
• Discrete trial training for peer greeting initiation
• AAC modeling during simulated overwhelm scenarios
• Parent coaching on transition warnings (5-minute visual timer)

GOAL PROGRESS
${goalLines || "• No active goals on file"}

BEHAVIORAL OBSERVATIONS
Client demonstrated improved self-advocacy using AAC cards when presented with unexpected schedule changes. Sensory supports (noise-canceling headphones, weighted lap pad) were effective per passport protocol.

PLAN
Continue current authorization units. Coordinate with school on IEP accommodation effectiveness. Next session: generalization of peer interaction skills in community setting.

[Review and edit before submission to payer portal]`;
  }

  if (type === "treatment_plan") {
    return `TREATMENT PLAN — ${name}
Effective date: ${date}
Diagnosis: ${client.demographics.diagnosis.join("; ")}
Support level: ${client.demographics.supportLevel}

TREATMENT GOALS
${goalLines || "• Goals to be established at intake"}

MEDICAL NECESSITY
${name} requires ongoing behavioral health services to develop communication, daily living, and self-regulation skills. Without continued intervention, regression in school participation and family functioning is clinically expected.

FREQUENCY & DURATION
Recommended: 2–3 sessions per week, 53-minute units, 6-month authorization period.

SENSORY & COMMUNICATION CONSIDERATIONS
${client.passport.communicationStyle}

Calming strategies: ${client.passport.calmingStrategies.join(", ")}
Accommodations: ${client.passport.accommodations.join(", ")}

PARENT/CAREGIVER INVOLVEMENT
Parent engagement score: ${client.parentEngagementScore}%. Caregiver training embedded in each session with home practice assignments via Bridge parent portal.

[Review and edit before submission]`;
  }

  if (type === "medical_necessity") {
    return `MEDICAL NECESSITY REPORT — ${name}
Date: ${date}
Payer: ${client.insurance.payer}
Authorization: ${client.insurance.authNumber}

CLINICAL JUSTIFICATION
${name} (age ${client.demographics.age}) has a diagnosis of ${client.demographics.diagnosis.join(" and ")} requiring skilled behavioral intervention. Current functional impairments include difficulty with transitions, peer interaction, and self-regulation in school and community settings.

SERVICES REQUESTED
Applied Behavior Analysis (ABA) — ${client.insurance.approvedUnits} units per authorization period.

OUTCOME DATA
Overall goal progress: ${client.goalsProgress}%. Documented improvement in AAC utilization and morning routine independence. Behavior frequency data shows correlation between sleep disruption and sensory overload events.

RISK IF SERVICES DISCONTINUED
Without continued services, client is at elevated risk for school refusal, increased caregiver stress, and loss of acquired self-advocacy skills.

SUPPORTING EVIDENCE
• Session notes (Bridge documentation module)
• Parent daily logs via Bridge My Space
• School behavior observations
• Goal tracking data (attached)

[Review and edit before payer submission]`;
  }

  return `IEP SUPPORT REPORT — ${name}
Prepared: ${date}
For: School team / IEP meeting

STUDENT PROFILE
Age ${client.demographics.age} · ${client.demographics.supportLevel}
Communication: ${client.passport.communicationStyle}

GOAL PROGRESS SUMMARY
${goalLines || "• No active goals on file"}

CLASSROOM BEHAVIOR TRENDS
Recent events include sensory overload during fire drills and anxiety related to schedule changes. Transitions on Tuesdays/Thursdays show elevated anxiety per pattern analysis.

ACCOMMODATION EFFECTIVENESS
Recommended accommodations currently in use:
${client.passport.accommodations.map((a) => `• ${a}`).join("\n")}

Sensory supports: ${client.passport.sensorySupports.join(", ")}

TEAM RECOMMENDATIONS
1. Maintain advance notice for schedule changes (visual + verbal)
2. Allow movement breaks per passport protocol
3. Continue extended time for written assignments
4. Share Bridge calm-plan strategies with classroom staff

EMERGENCY PROTOCOL
${client.passport.emergencyNotes}

[Export-ready for IEP team meeting — review and edit before sharing]`;
}

export function generateTherapistDocument(type: DocumentType, clientId: string): GeneratedDocument {
  const client = getTherapistClient(clientId);
  if (!client) throw new Error("Client not found.");

  const clientGoals = goalsSeed.filter((g) => g.clientId === clientId);
  const content = buildDocumentContent(type, client, clientGoals);
  const doc: GeneratedDocument = {
    id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    clientId,
    clientName: client.demographics.name,
    title: `${documentTitle(type)} — ${client.demographics.name}`,
    content,
    generatedAt: nowIso(),
    updatedAt: nowIso(),
    status: "draft",
  };
  generatedDocuments.unshift(doc);
  if (generatedDocuments.length > 50) generatedDocuments.length = 50;
  return doc;
}

export function updateTherapistDocument(docId: string, content: string, status?: "draft" | "submitted"): GeneratedDocument | null {
  const doc = generatedDocuments.find((d) => d.id === docId);
  if (!doc) return null;
  doc.content = content;
  doc.updatedAt = nowIso();
  if (status) doc.status = status;
  return doc;
}

export function getTherapistDocuments(): GeneratedDocument[] {
  return [...generatedDocuments];
}

export function markTherapistMessageRead(messageId: string): TherapistMessage | null {
  const msg = therapistMessages.find((m) => m.id === messageId);
  if (!msg) return null;
  msg.unread = false;
  return msg;
}

export function replyToTherapistMessage(messageId: string, text: string, from = "Jordan Therapist"): TherapistMessage | null {
  const msg = therapistMessages.find((m) => m.id === messageId);
  if (!msg) return null;
  msg.replies.push({ from, text, at: nowIso() });
  msg.unread = false;
  return msg;
}

export function logTherapistBehaviorEvent(
  input: Omit<BehaviorEvent, "id" | "timestamp">
): BehaviorEvent {
  const event: BehaviorEvent = {
    ...input,
    id: `b-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: nowIso(),
  };
  behaviorEvents.unshift(event);
  if (behaviorEvents.length > 100) behaviorEvents.length = 100;
  return event;
}

export function getTherapistDashboard(): TherapistDashboardSnapshot {
  return {
    overview: {
      activeClients: 42,
      sessionsThisWeek: 18,
      reauthorizationsDue: 6,
      highPriorityAlerts: 3,
      unreadParentMessages: therapistMessages.filter((m) => m.unread).length,
      goalsCompletedThisMonth: 24,
    },
    actionCenter: [
      { id: "a1", level: "high", title: "Insurance renewal due", detail: "Sam — Aetna auth expires in 14 days", clientName: "Sam", dueLabel: "14 days" },
      { id: "a2", level: "high", title: "Parent submitted incident report", detail: "Nathan — sensory overload at school transition", clientName: "Nathan" },
      { id: "a3", level: "medium", title: "Goal regression detected", detail: "Initiate peer interaction dropped 12% over 2 weeks", clientName: "Nathan" },
      { id: "a4", level: "medium", title: "Missing progress notes", detail: "1 session from June 18 needs documentation" },
      { id: "a5", level: "critical", title: "Authorization expiring", detail: "Sam — only 4 units remaining", clientName: "Sam", dueLabel: "7 days" },
    ],
    clients,
    goals: goalsSeed,
    recentBehaviors: [...behaviorEvents],
    patternInsights: [
      { id: "p1", text: "Sleep disruption correlates with increased meltdowns (Nathan, r=0.72).", severity: "high" },
      { id: "p2", text: "School transitions linked to anxiety spikes on Tuesdays/Thursdays.", severity: "medium" },
      { id: "p3", text: "Sensory overload events increased 34% over the last 30 days.", severity: "high" },
    ],
    messages: [...therapistMessages],
    documents: getTherapistDocuments(),
    insurance: clients.map((c) => ({
      clientId: c.id,
      clientName: c.demographics.name,
      payer: c.insurance.payer,
      authNumber: c.insurance.authNumber,
      approvedUnits: c.insurance.approvedUnits,
      usedUnits: c.insurance.usedUnits,
      expirationDate: c.insurance.expirationDate,
      daysRemaining: Math.ceil((new Date(c.insurance.expirationDate).getTime() - Date.now()) / 86400000),
    })),
    insuranceReadiness: {
      documentationComplete: 92,
      authorizationUsage: 81,
      missingNotes: 1,
      reauthorizationRisk: "low",
    },
    trends: {
      weeklyBehaviorFrequency: [
        { label: "Mon", count: 2 },
        { label: "Tue", count: 4 },
        { label: "Wed", count: 1 },
        { label: "Thu", count: 5 },
        { label: "Fri", count: 2 },
        { label: "Sat", count: 0 },
        { label: "Sun", count: 1 },
      ],
      monthlyImprovementScore: 12,
      goalProgression: 68,
      attendanceTrend: 94,
      parentEngagementScore: 85,
    },
  };
}

export function getTherapistClient(clientId: string): ClientProfile | null {
  return clients.find((c) => c.id === clientId) ?? null;
}
