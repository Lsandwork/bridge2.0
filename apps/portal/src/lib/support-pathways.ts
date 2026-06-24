export type SupportPathwayId =
  | "autism"
  | "down-syndrome"
  | "adhd"
  | "developmental"
  | "communication"
  | "brain-injury"
  | "veteran"
  | "mental-wellness"
  | "independent-living";

export type SupportPathway = {
  id: SupportPathwayId;
  name: string;
  shortName: string;
  descriptor: string;
  audience: string;
  accent: string;
  accentSoft: string;
  icon: string;
  heroTitle: string;
  heroBody: string;
  primaryAction: string;
  primaryHref: string;
  supportAreas: { title: string; body: string; href: string; icon: string }[];
  today: { time: string; title: string; detail: string; complete?: boolean }[];
  outcomeLabel: string;
  outcomeValue: string;
  careNote: string;
};

export const supportPathways: SupportPathway[] = [
  {
    id: "autism",
    name: "Autism",
    shortName: "Autism",
    descriptor: "Routines, communication, sensory support, and regulation",
    audience: "Autistic children, teens, and adults",
    accent: "#6d5bd0",
    accentSoft: "#eeeafd",
    icon: "∞",
    heroTitle: "Support that continues between appointments.",
    heroBody: "Use the complete original Bridge Autism experience for visual routines, communication, sensory needs, skill practice, caregiver coordination, and measurable progress.",
    primaryAction: "Open today’s support plan",
    primaryHref: "/routines",
    supportAreas: [
      { title: "Visual routines", body: "Predictable steps for home, school, and community.", href: "/routines", icon: "▦" },
      { title: "Communication", body: "AAC-friendly choices and low-pressure ways to connect.", href: "/communication", icon: "◌" },
      { title: "Sensory & regulation", body: "Notice needs and keep helpful strategies close.", href: "/my-space/mood", icon: "◎" },
    ],
    today: [
      { time: "8:00 AM", title: "Morning routine", detail: "5 of 6 steps complete", complete: true },
      { time: "10:30 AM", title: "Communication practice", detail: "10-minute home activity" },
      { time: "1:00 PM", title: "Sensory break", detail: "Quiet space + headphones" },
      { time: "4:30 PM", title: "Choice time", detail: "Pick a preferred activity" },
    ],
    outcomeLabel: "Independent transitions",
    outcomeValue: "+18%",
    careNote: "The visual transition card is working well. Keep it available before changes in activity.",
  },
  {
    id: "down-syndrome",
    name: "Down syndrome",
    shortName: "Down syndrome",
    descriptor: "Daily skills, learning, communication, and confidence",
    audience: "People with Down syndrome and their support circles",
    accent: "#a97722",
    accentSoft: "#fbf1db",
    icon: "✦",
    heroTitle: "Growing confidence, one meaningful step at a time.",
    heroBody: "Reinforce therapy goals, build daily-living skills, support communication, and celebrate increasing independence across everyday routines.",
    primaryAction: "Practice today’s skill",
    primaryHref: "/exercises",
    supportAreas: [
      { title: "Daily-living skills", body: "Visual steps for dressing, meals, hygiene, and home life.", href: "/routines", icon: "☀" },
      { title: "Speech practice", body: "Consistent activities selected with the care team.", href: "/communication", icon: "◌" },
      { title: "Learning library", body: "Practical guidance for families and support staff.", href: "/library", icon: "▤" },
    ],
    today: [
      { time: "8:15 AM", title: "Get ready", detail: "Shoes and backpack", complete: true },
      { time: "11:00 AM", title: "Speech practice", detail: "Sounds and useful phrases" },
      { time: "2:30 PM", title: "Life skill", detail: "Make a simple snack" },
      { time: "6:00 PM", title: "Family recap", detail: "Share one proud moment" },
    ],
    outcomeLabel: "Steps without prompts",
    outcomeValue: "+24%",
    careNote: "The snack routine is becoming more independent. Use the same visual sequence again this week.",
  },
  {
    id: "adhd",
    name: "ADHD & executive function",
    shortName: "ADHD",
    descriptor: "Focus, planning, task initiation, and emotional balance",
    audience: "Children, teens, and adults who benefit from executive-function support",
    accent: "#4f78a6",
    accentSoft: "#e8f0f9",
    icon: "↗",
    heroTitle: "Less overwhelm. One clear next step.",
    heroBody: "Break tasks into manageable actions, create focus rhythms, prepare for transitions, and build systems that work with the person’s brain.",
    primaryAction: "Begin a focus session",
    primaryHref: "/tasks",
    supportAreas: [
      { title: "Task breakdown", body: "Turn large tasks into visible, achievable steps.", href: "/tasks", icon: "☷" },
      { title: "Focus routines", body: "Flexible work blocks with planned reset breaks.", href: "/routines", icon: "◷" },
      { title: "Goal momentum", body: "Track effort, progress, and strategies that help.", href: "/goals", icon: "↗" },
    ],
    today: [
      { time: "8:30 AM", title: "Plan the day", detail: "Choose the top three", complete: true },
      { time: "10:00 AM", title: "Focus block", detail: "25 minutes + movement break" },
      { time: "2:00 PM", title: "Task reset", detail: "Review and reprioritize" },
      { time: "7:00 PM", title: "Tomorrow prep", detail: "Bag, clothes, calendar" },
    ],
    outcomeLabel: "Tasks started on time",
    outcomeValue: "+31%",
    careNote: "Completion is strongest when each task begins with one visible first step.",
  },
  {
    id: "developmental",
    name: "Developmental & intellectual disability",
    shortName: "Developmental support",
    descriptor: "Choice, daily living, safety, and supported independence",
    audience: "People with developmental or intellectual disabilities",
    accent: "#397865",
    accentSoft: "#e2f2eb",
    icon: "◇",
    heroTitle: "Everyday support that builds independence.",
    heroBody: "Create clear routines, meaningful choices, community plans, and consistent support across family, residential, educational, and employment settings.",
    primaryAction: "Open today’s plan",
    primaryHref: "/routines",
    supportAreas: [
      { title: "Step-by-step tasks", body: "Accessible prompts for everyday activities.", href: "/tasks", icon: "☷" },
      { title: "Choice & self-direction", body: "Support preferences and personal decision-making.", href: "/communication", icon: "◌" },
      { title: "Care coordination", body: "Keep the support circle working from one shared plan.", href: "/care-team", icon: "♧" },
    ],
    today: [
      { time: "8:00 AM", title: "Morning checklist", detail: "Ready for the day", complete: true },
      { time: "11:30 AM", title: "Community outing", detail: "Bus route + shopping list" },
      { time: "3:00 PM", title: "Home skill", detail: "Laundry steps" },
      { time: "6:30 PM", title: "Plan tomorrow", detail: "Choose clothes and activity" },
    ],
    outcomeLabel: "Independent choices",
    outcomeValue: "+16%",
    careNote: "Offering two clear choices before outings is supporting stronger self-direction.",
  },
  {
    id: "communication",
    name: "Speech & communication",
    shortName: "Communication",
    descriptor: "Expression, connection, speech carryover, and AAC support",
    audience: "People with speech, language, or communication support needs",
    accent: "#b15f4c",
    accentSoft: "#fbe9e4",
    icon: "◌",
    heroTitle: "More ways to be heard and understood.",
    heroBody: "Support communication across home, school, work, and therapy with visual choices, personalized vocabulary, and consistent practice.",
    primaryAction: "Open communication board",
    primaryHref: "/communication",
    supportAreas: [
      { title: "Communication boards", body: "Fast access to useful words, people, and choices.", href: "/communication", icon: "▦" },
      { title: "Practice together", body: "Care-team activities for real-life carryover.", href: "/exercises", icon: "▶" },
      { title: "Progress notes", body: "Track new expressions across settings.", href: "/reports", icon: "↗" },
    ],
    today: [
      { time: "8:00 AM", title: "Morning choices", detail: "Breakfast and clothing", complete: true },
      { time: "10:30 AM", title: "Practice together", detail: "Five core words" },
      { time: "3:30 PM", title: "Tell me about it", detail: "Share one part of the day" },
      { time: "7:00 PM", title: "Family connection", detail: "People and feelings board" },
    ],
    outcomeLabel: "Spontaneous communication",
    outcomeValue: "+22%",
    careNote: "Keep the “help” choice in the same location on every communication board.",
  },
  {
    id: "brain-injury",
    name: "Brain injury & stroke recovery",
    shortName: "Recovery",
    descriptor: "Memory, rehabilitation, energy pacing, and daily routines",
    audience: "People recovering from TBI, acquired brain injury, or stroke",
    accent: "#55749b",
    accentSoft: "#e8eff7",
    icon: "↺",
    heroTitle: "Make recovery feel more manageable.",
    heroBody: "Bring memory supports, rehabilitation carryover, energy pacing, appointments, and everyday tasks into one calm and coordinated plan.",
    primaryAction: "Review today’s recovery plan",
    primaryHref: "/routines",
    supportAreas: [
      { title: "Memory prompts", body: "Time-based cues for important daily actions.", href: "/tasks", icon: "◷" },
      { title: "Energy pacing", body: "Balance effort, rest, and recovery windows.", href: "/routines", icon: "≋" },
      { title: "Rehab carryover", body: "Keep approved exercises and care notes organized.", href: "/exercises", icon: "✓" },
    ],
    today: [
      { time: "8:30 AM", title: "Morning orientation", detail: "Date, plan, medications", complete: true },
      { time: "10:00 AM", title: "Rehab practice", detail: "Speech and movement" },
      { time: "1:00 PM", title: "Rest window", detail: "Low stimulation" },
      { time: "4:00 PM", title: "Daily task", detail: "Prepare a simple meal" },
    ],
    outcomeLabel: "Planned tasks completed",
    outcomeValue: "+14%",
    careNote: "Energy has been strongest before noon. Keep higher-effort activities in that window.",
  },
  {
    id: "veteran",
    name: "Veteran & service member",
    shortName: "Veteran support",
    descriptor: "Routine, grounding, memory, reintegration, and caregiver support",
    audience: "Veterans, service members, and military families",
    accent: "#416d62",
    accentSoft: "#e3efeb",
    icon: "★",
    heroTitle: "A steadier rhythm for the day ahead.",
    heroBody: "Private, practical support for routines, grounding, memory, appointments, reintegration, and connection with trusted people.",
    primaryAction: "Start morning check-in",
    primaryHref: "/routines",
    supportAreas: [
      { title: "Grounding plan", body: "Simple, personal prompts for returning to the present.", href: "/exercises", icon: "◎" },
      { title: "Today’s mission", body: "Turn priorities into a clear and flexible plan.", href: "/tasks", icon: "☷" },
      { title: "Trusted contacts", body: "Keep the chosen support network close.", href: "/care-team", icon: "♧" },
    ],
    today: [
      { time: "7:30 AM", title: "Morning check-in", detail: "Sleep, energy, and plan", complete: true },
      { time: "10:00 AM", title: "Appointment", detail: "Questions and notes ready" },
      { time: "2:00 PM", title: "Reset break", detail: "Grounding + brief walk" },
      { time: "6:30 PM", title: "Connect", detail: "Check in with a trusted person" },
    ],
    outcomeLabel: "Routine consistency",
    outcomeValue: "+19%",
    careNote: "The pre-appointment question list made the last visit more useful. A new copy is ready.",
  },
  {
    id: "mental-wellness",
    name: "Mental & emotional wellness",
    shortName: "Emotional wellness",
    descriptor: "Coping routines, self-awareness, and therapy carryover",
    audience: "People using Bridge alongside licensed mental-health care",
    accent: "#8b617d",
    accentSoft: "#f4e8ef",
    icon: "♡",
    heroTitle: "Meet today with a little more support.",
    heroBody: "Build coping routines, notice patterns, prepare for appointments, and carry clinician-approved strategies into everyday life.",
    primaryAction: "Begin a gentle check-in",
    primaryHref: "/my-space/mood",
    supportAreas: [
      { title: "Private check-ins", body: "Notice mood, energy, and needs without judgment.", href: "/my-space/mood", icon: "♡" },
      { title: "Coping plan", body: "Keep care-team strategies available in the moment.", href: "/exercises", icon: "◎" },
      { title: "Weekly patterns", body: "Bring clear summaries to care appointments.", href: "/progress", icon: "↗" },
    ],
    today: [
      { time: "8:30 AM", title: "Morning check-in", detail: "Mood, energy, and needs", complete: true },
      { time: "11:00 AM", title: "Small next step", detail: "One meaningful activity" },
      { time: "3:00 PM", title: "Reset moment", detail: "Breathing or grounding" },
      { time: "8:00 PM", title: "Reflect", detail: "Notice what helped today" },
    ],
    outcomeLabel: "Helpful strategies used",
    outcomeValue: "+27%",
    careNote: "Afternoon check-ins are showing a useful pattern to discuss at the next appointment.",
  },
  {
    id: "independent-living",
    name: "Independent living & work",
    shortName: "Independent living",
    descriptor: "Life skills, employment, self-advocacy, and community access",
    audience: "Teens and adults building greater independence",
    accent: "#9a7637",
    accentSoft: "#faf0d9",
    icon: "⌂",
    heroTitle: "Build the life you want, your way.",
    heroBody: "Practical support for employment, transportation, home routines, money skills, self-advocacy, and participation in community life.",
    primaryAction: "Open today’s goals",
    primaryHref: "/goals",
    supportAreas: [
      { title: "Getting there", body: "Routes, reminders, backup plans, and arrival steps.", href: "/routines", icon: "⌖" },
      { title: "Work support", body: "Prepare, practice, and track successful job routines.", href: "/tasks", icon: "▤" },
      { title: "Home skills", body: "Step-by-step support for everyday living.", href: "/exercises", icon: "⌂" },
    ],
    today: [
      { time: "7:45 AM", title: "Work prep", detail: "Uniform, lunch, bus pass", complete: true },
      { time: "9:00 AM", title: "Shift plan", detail: "Top tasks and break times" },
      { time: "4:30 PM", title: "Travel home", detail: "Route and check-in" },
      { time: "6:00 PM", title: "Home skill", detail: "Dinner and clean-up" },
    ],
    outcomeLabel: "Independent routines",
    outcomeValue: "+21%",
    careNote: "The arrival routine was completed independently three times. Begin fading the final reminder.",
  },
];

export const defaultPathway = supportPathways[0];

export function findPathway(id: string | null | undefined) {
  return supportPathways.find((pathway) => pathway.id === id) ?? defaultPathway;
}
