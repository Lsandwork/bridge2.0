import { describe, expect, it } from "vitest";
import { companionFanGearItems, fanGearCollections, sportsPartnersSeed } from "./fan-gear";
import { getCompanionPetState } from "./companion-pets";

describe("fan gear catalog", () => {
  it("uses only Bridge-owned placeholder-safe fan gear by default", () => {
    expect(companionFanGearItems.length).toBeGreaterThan(10);
    expect(companionFanGearItems.every((item) => item.theme === "fan_gear")).toBe(true);
    expect(companionFanGearItems.every((item) => item.assetConfig.official === false)).toBe(true);
    expect(companionFanGearItems.every((item) => item.assetConfig.licensingRequired === false)).toBe(true);
  });

  it("keeps sports partners in placeholder licensing status until approved", () => {
    expect(sportsPartnersSeed.length).toBeGreaterThan(0);
    expect(sportsPartnersSeed.every((partner) => partner.partnerType === "placeholder")).toBe(true);
    expect(sportsPartnersSeed.every((partner) => partner.licensingStatus === "placeholder")).toBe(true);
  });

  it("connects every style collection to seeded fan gear items", () => {
    const itemIds = new Set(companionFanGearItems.map((item) => item.id));
    for (const collection of fanGearCollections) {
      expect(collection.itemIds.length).toBeGreaterThan(0);
      expect(collection.itemIds.every((id) => itemIds.has(id))).toBe(true);
    }
  });

  it("appears in the real companion catalog fallback", async () => {
    const state = await getCompanionPetState("fan-gear-test-user");
    expect(state.items.some((item) => item.id === "icon_snapback")).toBe(true);
    expect(state.items.filter((item) => item.theme === "fan_gear").length).toBe(companionFanGearItems.length);
  });
});
