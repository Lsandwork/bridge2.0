export const petXpEvents = {
  routine_complete: 20,
  goal_complete: 35,
  emotional_regulation: 15,
  mood_check_in: 10,
  communication_card: 15,
  caregiver_encouragement: 20,
  therapist_goal_approved: 30,
  daily_streak: 25,
  returning_after_hard_day: 10,
  manual_celebrate: 5,
} as const;

export type PetXpEvent = keyof typeof petXpEvents;

export function xpLabel(event: PetXpEvent) {
  return `+${petXpEvents[event]} XP`;
}
