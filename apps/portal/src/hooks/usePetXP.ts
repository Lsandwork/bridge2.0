"use client";

import { useCompanionPet } from "@/components/pets/CompanionPetProvider";
import type { PetXpEvent } from "@/lib/pets/petXP";

export function usePetXP() {
  const { awardXp } = useCompanionPet();
  return {
    awardXp: (eventType: PetXpEvent, metadata?: Record<string, unknown>) => awardXp(eventType, metadata),
  };
}
