import { describe, expect, it } from "vitest";
import {
  awardBridgePetActivity,
  bridgePetCatalogSeed,
  bridgePetLevelFromXp,
  bridgePetStageFromXp,
  bridgePetXpForActivity,
  getSelectedBridgePet,
  listBridgePets,
  selectBridgePetForUser,
} from "./bridge-pets";

describe("Bridge PETS", () => {
  it("ships the complete production character catalog", async () => {
    const pets = await listBridgePets({ includeInactive: true });
    const slugs = pets.map((pet) => pet.slug);

    expect(pets.length).toBeGreaterThanOrEqual(13);
    expect(slugs).toEqual(expect.arrayContaining([
      "spark",
      "tide",
      "nova",
      "moss",
      "bolt",
      "ranger",
      "focus",
      "zip",
      "echo",
      "atlas",
      "luna",
      "rocket",
      "sage",
    ]));
    expect(bridgePetCatalogSeed.some((pet) => pet.name === "Ranger")).toBe(true);
  });

  it("starts real new users at zero progress after pet selection", async () => {
    const userId = `bridge-pet-user-${Date.now()}-zero`;
    const selected = await selectBridgePetForUser({ userId, slug: "ranger" });

    expect(selected.petSlug).toBe("ranger");
    expect(selected.xp).toBe(0);
    expect(selected.level).toBe(1);
    expect(selected.growthStage).toBe("baby");
  });

  it("awards XP only from real engagement events", async () => {
    const userId = `bridge-pet-user-${Date.now()}-xp`;
    await selectBridgePetForUser({ userId, slug: "focus" });

    expect(bridgePetXpForActivity("check_in")).toBe(10);
    expect(bridgePetXpForActivity("routine_complete")).toBe(20);
    expect(bridgePetXpForActivity("goal_complete")).toBe(35);

    const result = await awardBridgePetActivity({ userId, activityType: "goal_complete" });
    expect(result.ok).toBe(true);
    expect(result.xpAwarded).toBe(35);
    expect((await getSelectedBridgePet(userId))?.xp).toBe(35);
  });

  it("keeps user Bridge PETS state isolated", async () => {
    const userA = `bridge-pet-user-${Date.now()}-a`;
    const userB = `bridge-pet-user-${Date.now()}-b`;

    await selectBridgePetForUser({ userId: userA, slug: "luna" });
    await selectBridgePetForUser({ userId: userB, slug: "rocket" });
    await awardBridgePetActivity({ userId: userA, activityType: "calm_reset" });

    expect((await getSelectedBridgePet(userA))?.petSlug).toBe("luna");
    expect((await getSelectedBridgePet(userB))?.petSlug).toBe("rocket");
    expect((await getSelectedBridgePet(userA))?.xp).toBeGreaterThan(0);
    expect((await getSelectedBridgePet(userB))?.xp).toBe(0);
  });

  it("calculates growth stages from engagement without fake starting progress", () => {
    expect(bridgePetStageFromXp(0)).toBe("baby");
    expect(bridgePetStageFromXp(90)).toBe("child");
    expect(bridgePetStageFromXp(300)).toBe("teen");
    expect(bridgePetStageFromXp(650)).toBe("adult");
    expect(bridgePetLevelFromXp(-100)).toBe(1);
  });
});
