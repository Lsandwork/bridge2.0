export const starterPets = [
  { id: "spark", name: "Spark", emoji: "✨", colors: ["#f97316", "#facc15"], supportTone: "motivating" },
  { id: "tide", name: "Tide", emoji: "💧", colors: ["#0ea5e9", "#67e8f9"], supportTone: "calm" },
  { id: "nova", name: "Nova", emoji: "🌟", colors: ["#7c3aed", "#c4b5fd"], supportTone: "creative" },
  { id: "ranger", name: "Ranger", emoji: "⛰️", colors: ["#3f6212", "#bef264"], supportTone: "ready-for-action" },
  { id: "focus", name: "Focus", emoji: "🎯", colors: ["#0284c7", "#7dd3fc"], supportTone: "attention support" },
  { id: "zip", name: "Zip", emoji: "⚡", colors: ["#ea580c", "#fdba74"], supportTone: "routine support" },
  { id: "echo", name: "Echo", emoji: "🎵", colors: ["#9333ea", "#d8b4fe"], supportTone: "creative expression" },
  { id: "atlas", name: "Atlas", emoji: "🧭", colors: ["#111827", "#f59e0b"], supportTone: "adult goals" },
  { id: "luna", name: "Luna", emoji: "🌙", colors: ["#8b5cf6", "#f0abfc"], supportTone: "calm reset" },
  { id: "rocket", name: "Rocket", emoji: "🚀", colors: ["#dc2626", "#fb7185"], supportTone: "follow-through" },
  { id: "sage", name: "Sage", emoji: "🍃", colors: ["#365314", "#bef264"], supportTone: "steady guide" },
];

export const petPersonalities = [
  "cheerful",
  "calm",
  "silly",
  "brave",
  "gentle",
  "coach-like",
  "quiet supporter",
  "focus buddy",
  "adventure friend",
];

export function petById(id?: string) {
  return starterPets.find((pet) => pet.id === id) ?? starterPets[0];
}
