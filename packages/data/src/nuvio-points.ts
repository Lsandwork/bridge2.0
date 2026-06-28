export const nuvioPointEvents = {
  open_nuvio_pet: { points: 2, label: "Open Nuvio Pet" },
  send_chat_message: { points: 3, label: "Send chat message" },
  voice_chat: { points: 5, label: "Voice chat" },
  ask_advice: { points: 5, label: "Ask advice" },
  complete_nuvio_suggestion: { points: 10, label: "Complete Nuvio suggestion" },
  stressed_out_reset: {
    points: 20,
    label: "Stressed Out reset",
    description: "A supportive reset with Nuvio Pet.",
    unlimited: true,
  },
  stress_relief_reset: {
    points: 20,
    label: "Stressed Out reset",
    description: "A supportive reset with Nuvio Pet.",
    unlimited: true,
  },
  routine_complete: { points: 20, label: "Complete routine" },
  routine_completed: { points: 20, label: "Complete routine" },
  task_complete: { points: 15, label: "Complete task" },
  task_completed: { points: 15, label: "Complete task" },
  mood_check_in: { points: 10, label: "Mood check-in" },
  communication_card: { points: 15, label: "Communication practice" },
  social_story_complete: { points: 15, label: "Social story completion" },
  exercise_complete: { points: 15, label: "Exercise completion" },
  play_with_nuvio: { points: 5, label: "Play with Nuvio" },
  play_interaction: { points: 5, label: "Play interaction" },
  talk_to_nuvio: { points: 5, label: "Talk to Nuvio" },
  daily_streak: { points: 25, label: "Daily check-in streak" },
  goal_complete: { points: 35, label: "Goal completion" },
  goal_completed: { points: 35, label: "Goal completion" },
  therapist_goal_approved: { points: 50, label: "Care-team approved milestone" },
  care_team_approved_milestone: { points: 50, label: "Care-team approved milestone" },
  calm_activity_complete: { points: 10, label: "Calm activity completion" },
  breathing_exercise: { points: 10, label: "Breathing exercise" },
  journal_prompt: { points: 8, label: "Journal prompt" },
  gratitude_prompt: { points: 8, label: "Gratitude prompt" },
  family_challenge_complete: { points: 25, label: "Family challenge completion" },
  confidence_challenge: { points: 15, label: "Confidence challenge" },
  redeem_reward: { points: 5, label: "Redeem reward" },
  mystery_reward: { points: 25, label: "Mystery reward" },
  daily_reset_wheel: { points: 20, label: "Daily Reset Wheel" },
} as const;

export type NuvioPointEvent = keyof typeof nuvioPointEvents;

export const nuvioPetAgeStages = [
  { stage: "baby", label: "Baby", minPoints: 0 },
  { stage: "young", label: "Young", minPoints: 90 },
  { stage: "little_buddy", label: "Young", minPoints: 90 },
  { stage: "teen", label: "Teen", minPoints: 300 },
  { stage: "teen_companion", label: "Teen", minPoints: 300 },
  { stage: "adult", label: "Adult", minPoints: 650 },
  { stage: "adult_companion", label: "Adult", minPoints: 650 },
  { stage: "champion", label: "Champion", minPoints: 1200 },
  { stage: "master_companion", label: "Champion", minPoints: 1200 },
  { stage: "legendary", label: "Legendary", minPoints: 2200 },
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
