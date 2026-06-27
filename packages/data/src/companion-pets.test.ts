import { describe, expect, it } from "vitest";
import { calculatePetGrowthStage, calculatePetLevel, xpForPetEvent } from "./companion-pets";

describe("Nuvio Companion Pets", () => {
  it("uses supportive XP values for real engagement events", () => {
    expect(xpForPetEvent("routine_complete")).toBe(20);
    expect(xpForPetEvent("goal_complete")).toBe(35);
    expect(xpForPetEvent("mood_check_in")).toBe(10);
    expect(xpForPetEvent("returning_after_hard_day")).toBe(10);
  });

  it("calculates growth stages from XP without punishment mechanics", () => {
    expect(calculatePetGrowthStage(0)).toBe("baby");
    expect(calculatePetGrowthStage(90)).toBe("little_buddy");
    expect(calculatePetGrowthStage(300)).toBe("teen_companion");
    expect(calculatePetGrowthStage(650)).toBe("adult_companion");
    expect(calculatePetGrowthStage(1200)).toBe("master_companion");
  });

  it("never returns a level below one", () => {
    expect(calculatePetLevel(-100)).toBe(1);
    expect(calculatePetLevel(0)).toBe(1);
    expect(calculatePetLevel(300)).toBeGreaterThan(1);
  });
});
