import { describe, expect, it } from "vitest";
import {
  awardCompanionPetXp,
  calculatePetGrowthStage,
  calculatePetLevel,
  createCompanionPet,
  getCompanionPetState,
  unlockEligiblePetItems,
  xpForPetEvent,
} from "./companion-pets";

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

  it("does not duplicate or reset an existing companion when setup is repeated", async () => {
    const userId = `pet-user-${Date.now()}-duplicate`;
    const first = await createCompanionPet({
      userId,
      name: "First Buddy",
      species: "spark",
      personality: "gentle",
    });
    await awardCompanionPetXp({ userId, eventType: "manual_celebrate" });
    const second = await createCompanionPet({
      userId,
      name: "Second Buddy",
      species: "calm_cat",
      personality: "calm",
    });

    expect(second.id).toBe(first.id);
    expect(second.name).toBe(first.name);
    expect((await getCompanionPetState(userId)).pet?.xp).toBeGreaterThan(0);
  });

  it("rate-limits repeat XP farming for the same event", async () => {
    const userId = `pet-user-${Date.now()}-rate`;
    const first = await awardCompanionPetXp({ userId, eventType: "routine_complete" });
    const second = await awardCompanionPetXp({ userId, eventType: "routine_complete" });

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(false);
    expect(second.reason).toBe("rate_limited");
  });

  it("unlocks eligible items by XP and event rules", async () => {
    const userId = `pet-user-${Date.now()}-unlock`;
    await createCompanionPet({ userId, name: "Unlock Spark", species: "spark", personality: "gentle" });
    const unlocked = await unlockEligiblePetItems(userId, 350, "goal_complete");
    const ids = unlocked.map((item) => "itemId" in item ? item.itemId : item.id);

    expect(ids).toContain("focus-glasses");
    expect(ids).toContain("star-badge");
  });
});
