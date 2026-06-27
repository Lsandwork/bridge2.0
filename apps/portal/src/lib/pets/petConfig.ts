export const starterPets = [
  { id: "star_pup", name: "Star Pup", emoji: "🐶", colors: ["#7c3aed", "#c4b5fd"], supportTone: "cheerful" },
  { id: "calm_cat", name: "Calm Cat", emoji: "🐱", colors: ["#0f766e", "#99f6e4"], supportTone: "calm" },
  { id: "brave_bear", name: "Brave Bear", emoji: "🐻", colors: ["#92400e", "#fde68a"], supportTone: "brave" },
  { id: "robot_buddy", name: "Robot Buddy", emoji: "🤖", colors: ["#334155", "#93c5fd"], supportTone: "coach-like" },
  { id: "dragon_sprout", name: "Dragon Sprout", emoji: "🐲", colors: ["#15803d", "#bbf7d0"], supportTone: "playful" },
  { id: "turtle_guide", name: "Turtle Guide", emoji: "🐢", colors: ["#166534", "#86efac"], supportTone: "quiet" },
  { id: "fox_helper", name: "Fox Helper", emoji: "🦊", colors: ["#ea580c", "#fed7aa"], supportTone: "focus" },
  { id: "cloud_friend", name: "Cloud Friend", emoji: "☁️", colors: ["#38bdf8", "#e0f2fe"], supportTone: "gentle" },
  { id: "service_pup", name: "Service Pup", emoji: "🦮", colors: ["#1d4ed8", "#bfdbfe"], supportTone: "steady" },
  { id: "space_critter", name: "Space Critter", emoji: "🛸", colors: ["#4c1d95", "#ddd6fe"], supportTone: "adventure" },
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
