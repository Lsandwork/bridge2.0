"use client";

import Image from "next/image";

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

function imageForItem(item: PetItemCardProps["item"]) {
  const png = item.assetConfig?.png;
  return typeof png === "string" ? png : "";
}

function fallbackIcon(item: PetItemCardProps["item"]) {
  if (item.itemType.includes("head") || item.itemType.includes("hat")) return "🧢";
  if (item.itemType.includes("face") || item.itemType.includes("glasses")) return "🕶️";
  if (item.itemType.includes("badge")) return "⭐";
  if (item.itemType.includes("backpack")) return "🎒";
  if (item.itemType.includes("foot")) return "👟";
  if (item.itemType.includes("effect")) return "✨";
  return "🧸";
}

export function PetItemCard({ item, unlocked, equipped, onEquip }: PetItemCardProps) {
  const image = imageForItem(item);
  return (
    <button
      type="button"
      disabled={!unlocked}
      onClick={onEquip}
      className={`pet-item-card ${equipped ? "pet-item-card--equipped" : ""}`}
    >
      <span className="pet-item-card__icon" aria-hidden>
        {image ? <Image src={image} alt="" width={40} height={40} className="pet-item-card__image" /> : fallbackIcon(item)}
      </span>
      <span className="pet-item-card__name">{item.name}</span>
      <span className="pet-item-card__meta">
        {unlocked ? `${equipped ? "Equipped" : `Equip ${slotForItem(item)}`}` : `Unlocks level ${item.unlockLevel}`}
      </span>
    </button>
  );
}
