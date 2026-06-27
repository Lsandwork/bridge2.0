export type PetGrowthStage = "baby" | "little_buddy" | "teen_companion" | "adult_companion" | "master_companion";

export const growthThresholds = [
  { stage: "baby" as const, min: 0, label: "Baby" },
  { stage: "little_buddy" as const, min: 90, label: "Little Buddy" },
  { stage: "teen_companion" as const, min: 300, label: "Teen Companion" },
  { stage: "adult_companion" as const, min: 650, label: "Adult Companion" },
  { stage: "master_companion" as const, min: 1200, label: "Master Companion" },
];

export function stageLabel(stage: string) {
  return growthThresholds.find((item) => item.stage === stage)?.label ?? "Companion";
}

export function nextGrowthTarget(xp: number) {
  return growthThresholds.find((item) => item.min > xp)?.min ?? 1500;
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
