"use client";

import { messageForMood } from "@/lib/pets/petMessages";

export function PetBubble({ mood, hidden }: { mood?: string; hidden?: boolean }) {
  if (hidden) return null;

  return (
    <div className="pet-bubble" role="status" aria-live="polite">
      {messageForMood(mood)}
    </div>
  );
}
