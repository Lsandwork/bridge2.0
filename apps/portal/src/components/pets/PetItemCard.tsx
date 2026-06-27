"use client";

type PetItemCardProps = {
  item: {
    id: string;
    name: string;
    itemType: string;
    theme: string | null;
    unlockLevel: number;
    assetConfig: Record<string, unknown>;
  };
  unlocked: boolean;
  equipped: boolean;
  onEquip: () => void;
};

function slotForItem(item: PetItemCardProps["item"]) {
  const slot = item.assetConfig?.slot;
  return typeof slot === "string" ? slot : item.itemType;
}

export function PetItemCard({ item, unlocked, equipped, onEquip }: PetItemCardProps) {
  return (
    <button
      type="button"
      disabled={!unlocked}
      onClick={onEquip}
      className={`pet-item-card ${equipped ? "pet-item-card--equipped" : ""}`}
    >
      <span className="pet-item-card__icon" aria-hidden>
        {item.itemType.includes("hat") ? "🎩" : item.itemType.includes("glasses") ? "👓" : item.itemType.includes("badge") ? "⭐" : item.itemType.includes("backpack") ? "🎒" : "🧸"}
      </span>
      <span className="pet-item-card__name">{item.name}</span>
      <span className="pet-item-card__meta">
        {unlocked ? `${equipped ? "Equipped" : `Equip ${slotForItem(item)}`}` : `Unlocks level ${item.unlockLevel}`}
      </span>
    </button>
  );
}
