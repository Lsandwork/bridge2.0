export const companionMessages = {
  idle: [
    "Nice job showing up today.",
    "I’m here when you’re ready.",
    "Want to do one small step together?",
  ],
  calm: [
    "Let’s take one slow breath.",
    "Quiet mode is okay. Tiny steps count.",
    "You do not have to rush.",
  ],
  focus: [
    "One step. Then the next.",
    "Want to start a focus moment?",
    "I can sit with you while you begin.",
  ],
  celebrating: [
    "That was a win. Tiny wins count.",
    "You earned XP!",
    "Your effort matters.",
  ],
  routine_reminder: ["Your routine is ready.", "Want to try the first step?"],
  overwhelmed_support: ["Need calm mode?", "I’m here. We can slow everything down."],
};

export function messageForMood(mood?: string) {
  const list = companionMessages[(mood as keyof typeof companionMessages) ?? "idle"] ?? companionMessages.idle;
  return list[Math.floor(Date.now() / 7000) % list.length];
}
