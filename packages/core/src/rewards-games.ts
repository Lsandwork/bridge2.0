export type GameCategory = "calm" | "focus" | "sensory" | "feelings" | "social";

export type SpectrumGame = {
  id: string;
  title: string;
  tagline: string;
  category: GameCategory;
  emoji: string;
  pointsPerPlay: number;
  durationMinutes: number;
  ageGroups: ("child" | "teen" | "adult")[];
  lowStimulation: boolean;
  noSound: boolean;
  description: string;
  skills: string[];
};

export const spectrumGames: SpectrumGame[] = [
  {
    id: "bubble-breathe",
    title: "Bubble Breathe",
    tagline: "Pop bubbles at your own pace",
    category: "calm",
    emoji: "🫧",
    pointsPerPlay: 3,
    durationMinutes: 3,
    ageGroups: ["child", "teen", "adult"],
    lowStimulation: true,
    noSound: true,
    description: "Slow, predictable bubbles float up. Tap to pop. Great before transitions or after overload.",
    skills: ["Breathing pace", "Hand-eye coordination", "Calm-down practice"],
  },
  {
    id: "color-sort",
    title: "Color Sort",
    tagline: "Sort shapes into the right home",
    category: "focus",
    emoji: "🎨",
    pointsPerPlay: 5,
    durationMinutes: 5,
    ageGroups: ["child", "teen", "adult"],
    lowStimulation: true,
    noSound: true,
    description: "Drag or tap shapes into matching color bins. Clear rules, no timer pressure unless you want it.",
    skills: ["Categorization", "Visual discrimination", "Task completion"],
  },
  {
    id: "mood-check",
    title: "Mood Check-In",
    tagline: "How are you feeling right now?",
    category: "feelings",
    emoji: "💚",
    pointsPerPlay: 4,
    durationMinutes: 2,
    ageGroups: ["child", "teen", "adult"],
    lowStimulation: true,
    noSound: true,
    description: "Pick the face or word that matches your feeling. Saves to your check-in log for your care team.",
    skills: ["Emotion labeling", "Self-awareness", "Communication"],
  },
  {
    id: "pattern-match",
    title: "Pattern Match",
    tagline: "Watch, then repeat the pattern",
    category: "focus",
    emoji: "✨",
    pointsPerPlay: 6,
    durationMinutes: 4,
    ageGroups: ["child", "teen", "adult"],
    lowStimulation: true,
    noSound: true,
    description: "A gentle Simon-style game. Colors light up one at a time — repeat the sequence. Speed adapts to you.",
    skills: ["Working memory", "Attention", "Turn-taking with self"],
  },
  {
    id: "focus-garden",
    title: "Focus Garden",
    tagline: "Grow a plant while you focus",
    category: "calm",
    emoji: "🌱",
    pointsPerPlay: 8,
    durationMinutes: 5,
    ageGroups: ["child", "teen", "adult"],
    lowStimulation: true,
    noSound: true,
    description: "Pick a focus time (1–5 min). A plant grows while you stay on the screen. Pause anytime.",
    skills: ["Sustained attention", "Break planning", "Visual reward"],
  },
  {
    id: "match-pairs",
    title: "Match Pairs",
    tagline: "Find the matching cards",
    category: "sensory",
    emoji: "🃏",
    pointsPerPlay: 5,
    durationMinutes: 6,
    ageGroups: ["child", "teen", "adult"],
    lowStimulation: true,
    noSound: true,
    description: "Flip two cards at a time. Low-stimulation mode uses 6 cards; standard uses 12.",
    skills: ["Memory", "Visual scanning", "Persistence"],
  },
  {
    id: "help-cards",
    title: "Help Card Practice",
    tagline: "Practice asking for what you need",
    category: "social",
    emoji: "🗣️",
    pointsPerPlay: 4,
    durationMinutes: 3,
    ageGroups: ["child", "teen", "adult"],
    lowStimulation: true,
    noSound: true,
    description: "Tap phrase cards: I need help, I need a break, I need space. Builds AAC and self-advocacy habits.",
    skills: ["Self-advocacy", "AAC practice", "Boundary language"],
  },
  {
    id: "sensory-scan",
    title: "Sensory Scan",
    tagline: "What does your body need?",
    category: "sensory",
    emoji: "🧘",
    pointsPerPlay: 4,
    durationMinutes: 3,
    ageGroups: ["child", "teen", "adult"],
    lowStimulation: true,
    noSound: true,
    description: "Choose: quiet, movement, deep pressure, or snack. Logs to sensory check-ins for pattern tracking.",
    skills: ["Interoception", "Sensory vocabulary", "Self-regulation planning"],
  },
  {
    id: "star-catcher",
    title: "Star Catcher",
    tagline: "Catch glowing stars in the sky",
    category: "focus",
    emoji: "⭐",
    pointsPerPlay: 7,
    durationMinutes: 4,
    ageGroups: ["child", "teen", "adult"],
    lowStimulation: false,
    noSound: true,
    description: "Move your basket left and right. Catch stars, dodge clouds. Gentle speed — you choose when to stop.",
    skills: ["Hand-eye coordination", "Reaction timing", "Visual tracking"],
  },
  {
    id: "rhythm-stars",
    title: "Rhythm Stars",
    tagline: "Tap when the star lights up",
    category: "calm",
    emoji: "🎵",
    pointsPerPlay: 6,
    durationMinutes: 3,
    ageGroups: ["child", "teen", "adult"],
    lowStimulation: true,
    noSound: true,
    description: "Four pads light up in a steady beat. Tap along — no wrong notes, just rhythm practice.",
    skills: ["Motor planning", "Predictable patterns", "Turn-taking with self"],
  },
  {
    id: "happy-pet",
    title: "Happy Pet",
    tagline: "Feed and play with your buddy",
    category: "social",
    emoji: "🐾",
    pointsPerPlay: 5,
    durationMinutes: 4,
    ageGroups: ["child", "teen"],
    lowStimulation: true,
    noSound: true,
    description: "Your pet gets hungry and sleepy. Tap to feed, play, and rest. Teaches caring routines in a fun way.",
    skills: ["Sequencing", "Empathy", "Daily care routines"],
  },
  {
    id: "rocket-glide",
    title: "Rocket Glide",
    tagline: "Glide through a calm star field",
    category: "sensory",
    emoji: "🚀",
    pointsPerPlay: 8,
    durationMinutes: 5,
    ageGroups: ["child", "teen", "adult"],
    lowStimulation: false,
    noSound: true,
    description: "Hold to boost, release to coast. Collect gems, avoid asteroids. No lives — just exploration.",
    skills: ["Sustained attention", "Fine motor control", "Calm focus"],
  },
  {
    id: "treasure-path",
    title: "Treasure Path",
    tagline: "Follow the glowing trail",
    category: "focus",
    emoji: "🗺️",
    pointsPerPlay: 6,
    durationMinutes: 4,
    ageGroups: ["child", "teen", "adult"],
    lowStimulation: true,
    noSound: true,
    description: "A path appears tile by tile. Tap the next glowing square. Builds planning and patience.",
    skills: ["Sequential memory", "Planning", "Task completion"],
  },
  {
    id: "emoji-adventure",
    title: "Emoji Adventure",
    tagline: "Pick your story path",
    category: "social",
    emoji: "📖",
    pointsPerPlay: 5,
    durationMinutes: 5,
    ageGroups: ["child", "teen", "adult"],
    lowStimulation: true,
    noSound: true,
    description: "Choose what happens next in a short story. Every path is okay — practice decisions without pressure.",
    skills: ["Decision making", "Narrative thinking", "Flexible thinking"],
  },
];

export function getGame(id: string) {
  return spectrumGames.find((g) => g.id === id) ?? null;
}

export function gamesForAgeGroup(ageGroup: "child" | "teen" | "adult") {
  return spectrumGames.filter((g) => g.ageGroups.includes(ageGroup));
}

export const categoryLabels: Record<GameCategory, string> = {
  calm: "Calm down",
  focus: "Focus & memory",
  sensory: "Sensory",
  feelings: "Feelings",
  social: "Social & communication",
};

export const categoryColors: Record<GameCategory, string> = {
  calm: "#6B9BD2",
  focus: "#7B6BA8",
  sensory: "#6BA88C",
  feelings: "#D4876B",
  social: "#5C8FD6",
};
