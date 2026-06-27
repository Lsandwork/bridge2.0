export const nuvioPointEvents = {
  stress_relief_reset: {
    points: 20,
    label: "Stressed Out reset",
    description: "A supportive reset with Nuvio Pet.",
    unlimited: true,
  },
  routine_complete: { points: 20, label: "Complete routine" },
  task_complete: { points: 15, label: "Complete task" },
  mood_check_in: { points: 10, label: "Mood check-in" },
  communication_card: { points: 15, label: "Communication practice" },
  social_story_complete: { points: 15, label: "Social story completion" },
  exercise_complete: { points: 15, label: "Exercise completion" },
  play_with_nuvio: { points: 10, label: "Play with Nuvio" },
  talk_to_nuvio: { points: 10, label: "Talk to Nuvio" },
  daily_streak: { points: 25, label: "Daily check-in streak" },
  goal_complete: { points: 35, label: "Goal completion" },
  therapist_goal_approved: { points: 30, label: "Care-team approved milestone" },
  calm_activity_complete: { points: 15, label: "Calm activity completion" },
  family_challenge_complete: { points: 25, label: "Family challenge completion" },
  mystery_reward: { points: 30, label: "Mystery reward" },
  daily_reset_wheel: { points: 20, label: "Daily Reset Wheel" },
} as const;

export type NuvioPointEvent = keyof typeof nuvioPointEvents;

export const nuvioPetAgeStages = [
  { stage: "baby", label: "Baby", minPoints: 0 },
  { stage: "little_buddy", label: "Young", minPoints: 90 },
  { stage: "teen_companion", label: "Teen", minPoints: 300 },
  { stage: "adult_companion", label: "Adult", minPoints: 650 },
  { stage: "master_companion", label: "Champion", minPoints: 1200 },
] as const;

export function pointsForNuvioEvent(eventType: string): number {
  return nuvioPointEvents[eventType as NuvioPointEvent]?.points ?? 0;
}

export function nuvioAgeLabel(stage: string): string {
  return nuvioPetAgeStages.find((item) => item.stage === stage)?.label ?? "Baby";
}

export function nextNuvioAgeStage(points: number) {
  return nuvioPetAgeStages.find((item) => item.minPoints > points) ?? null;
}
