"use client";

import { useCompanionPet } from "@/components/pets/CompanionPetProvider";

export function usePetInventory() {
  const { state } = useCompanionPet();
  const unlocked = new Set((state?.inventory ?? []).map((item) => item.itemId));
  return {
    items: state?.items ?? [],
    inventory: state?.inventory ?? [],
    isUnlocked: (itemId: string) => unlocked.has(itemId),
  };
}
