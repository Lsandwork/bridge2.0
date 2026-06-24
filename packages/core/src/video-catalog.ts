export type VideoCatalogItem = {
  id: string;
  youtubeId: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  durationLabel: string;
};

/** Curated, embed-friendly videos for calm, regulation, and skill-building. */
export const videoCatalog: VideoCatalogItem[] = [
  {
    id: "v-calm-breath",
    youtubeId: "lj54U1J5IuE",
    title: "Belly Breathing with Elmo",
    description: "A short calming breathing exercise with a familiar friend.",
    category: "Calm",
    tags: ["breathing", "calm", "sesame", "regulation"],
    durationLabel: "2 min",
  },
  {
    id: "v-yoga-cosmic",
    youtubeId: "1ZYbU82GVz4",
    title: "Cosmic Kids — Yoga Adventure",
    description: "Gentle mindfulness and body awareness for kids and teens.",
    category: "Calm",
    tags: ["yoga", "mindfulness", "cosmic kids", "calm"],
    durationLabel: "5 min",
  },
  {
    id: "v-5-finger",
    youtubeId: "W38tywrMREs",
    title: "Five-Finger Breathing",
    description: "A simple hand-tracing breath to reset when overwhelmed.",
    category: "Calm",
    tags: ["breathing", "anxiety", "calm", "self-regulation"],
    durationLabel: "3 min",
  },
  {
    id: "v-quiet-time",
    youtubeId: "4AMLy8ag0H0",
    title: "Quiet Time — Mindfulness",
    description: "Soft mindfulness break for sensory regulation.",
    category: "Sensory",
    tags: ["quiet", "sensory", "break", "calm"],
    durationLabel: "4 min",
  },
  {
    id: "v-social-greeting",
    youtubeId: "n2sSXf2plhQ",
    title: "Saying Hello — Social Skills",
    description: "Practice friendly greetings in low-pressure steps.",
    category: "Social",
    tags: ["social", "greeting", "friends", "communication"],
    durationLabel: "4 min",
  },
  {
    id: "v-routine-morning",
    youtubeId: "BLODgpfjKMQ",
    title: "Morning Calm Start",
    description: "Breathing and focus to begin the day.",
    category: "Daily Living",
    tags: ["routine", "morning", "calm", "independence"],
    durationLabel: "3 min",
  },
  {
    id: "v-emotions-identify",
    youtubeId: "h6fcIjP4AG4",
    title: "Name That Feeling",
    description: "Match faces and body clues to emotion words.",
    category: "Feelings",
    tags: ["emotions", "feelings", "identify", "mood"],
    durationLabel: "5 min",
  },
  {
    id: "v-transition-timer",
    youtubeId: "Kj3kF4Z3n6w",
    title: "Transition Breathing",
    description: "A short breathing exercise before switching activities.",
    category: "Transitions",
    tags: ["transition", "breathing", "change", "routine"],
    durationLabel: "3 min",
  },
  {
    id: "v-space-facts",
    youtubeId: "libKVRa01L8",
    title: "Amazing Space — Fun Facts",
    description: "Short, engaging space facts for curious minds.",
    category: "Interests",
    tags: ["space", "science", "facts", "interest"],
    durationLabel: "4 min",
  },
  {
    id: "v-drawing-calm",
    youtubeId: "86m4rc_ADcM",
    title: "Calm Drawing — Follow Along",
    description: "Slow, simple drawing with quiet background music.",
    category: "Creative",
    tags: ["drawing", "art", "calm", "creative"],
    durationLabel: "6 min",
  },
];

export function getVideoById(id: string): VideoCatalogItem | undefined {
  return videoCatalog.find((v) => v.id === id);
}

export function getVideoByYoutubeId(youtubeId: string): VideoCatalogItem | undefined {
  return videoCatalog.find((v) => v.youtubeId === youtubeId);
}

export function filterVideoCatalog(query: string): VideoCatalogItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...videoCatalog];
  return videoCatalog.filter(
    (v) =>
      v.title.toLowerCase().includes(q) ||
      v.description.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q) ||
      v.tags.some((tag) => tag.toLowerCase().includes(q))
  );
}
