"use client";

import { usePetInventory } from "@/hooks/usePetInventory";
import { PetItemCard } from "./PetItemCard";

export function PetWardrobe({
  outfit,
  onEquip,
}: {
  outfit?: Record<string, string>;
  onEquip: (slot: string, itemId: string) => void;
}) {
  const { items, isUnlocked } = usePetInventory();

  return (
    <div className="pet-wardrobe">
      <div className="pet-panel__section-title">
        <span>Wardrobe</span>
        <small>Unlocks grow with healthy engagement.</small>
      </div>
      <div className="pet-wardrobe__grid">
        {items.map((item) => {
          const slot = typeof item.assetConfig?.slot === "string" ? item.assetConfig.slot : item.itemType;
          return (
            <PetItemCard
              key={item.id}
              item={item}
              unlocked={isUnlocked(item.id)}
              equipped={outfit?.[slot] === item.id}
              onEquip={() => onEquip(slot, item.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
