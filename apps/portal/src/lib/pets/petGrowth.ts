export type PetGrowthStage =
  | "baby"
  | "little_buddy"
  | "teen_companion"
  | "adult_companion"
  | "master_companion"
  | "legendary";

export const growthThresholds = [
  { stage: "baby" as const, min: 0, label: "Baby" },
  { stage: "little_buddy" as const, min: 90, label: "Young" },
  { stage: "teen_companion" as const, min: 300, label: "Teen" },
  { stage: "adult_companion" as const, min: 650, label: "Adult" },
  { stage: "master_companion" as const, min: 1200, label: "Champion" },
  { stage: "legendary" as const, min: 2200, label: "Legendary" },
];

export function stageLabel(stage: string) {
  return growthThresholds.find((item) => item.stage === stage)?.label ?? "Companion";
}

export function nextGrowthTarget(xp: number) {
  return growthThresholds.find((item) => item.min > xp)?.min ?? xp + 500;
}

export function currentGrowthFloor(xp: number) {
  return [...growthThresholds].reverse().find((item) => xp >= item.min)?.min ?? 0;
}

export function growthPercent(xp: number) {
  const floor = currentGrowthFloor(xp);
  const target = nextGrowthTarget(xp);
  if (target <= floor) return 100;
  return Math.max(0, Math.min(100, ((xp - floor) / (target - floor)) * 100));
}
