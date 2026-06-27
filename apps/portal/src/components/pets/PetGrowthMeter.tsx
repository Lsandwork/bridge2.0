"use client";

import { growthPercent, nextGrowthTarget, stageLabel } from "@/lib/pets/petGrowth";

export function PetGrowthMeter({ xp, stage, level }: { xp: number; stage: string; level: number }) {
  const target = nextGrowthTarget(xp);
  const percent = growthPercent(xp);

  return (
    <div className="pet-growth" aria-label={`Level ${level}, ${stageLabel(stage)}, ${xp} XP`}>
      <div className="pet-growth__row">
        <span>Level {level}</span>
        <span>{stageLabel(stage)}</span>
      </div>
      <div className="pet-growth__track">
        <span className="pet-growth__bar" style={{ width: `${percent}%` }} />
      </div>
      <div className="pet-growth__row pet-growth__row--muted">
        <span>{xp} XP</span>
        <span>{target >= 1500 ? "Master path" : `${Math.max(0, target - xp)} XP to next stage`}</span>
      </div>
    </div>
  );
}
