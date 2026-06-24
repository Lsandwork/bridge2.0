import { describe, expect, it } from "vitest";
import { DEFAULT_REWARDS_POLICY, evaluateGameEarn } from "./rewards-policy";

describe("evaluateGameEarn", () => {
  it("awards fixed points when within all limits", () => {
    const result = evaluateGameEarn({
      pointsPerPlay: 5,
      perGamePlaysToday: 0,
      pointsEarnedToday: 0,
      earnSessionsToday: 0,
    });
    expect(result).toEqual({ kind: "earned", points: 5 });
  });

  it("uses practice mode after per-game limit", () => {
    const result = evaluateGameEarn({
      pointsPerPlay: 5,
      perGamePlaysToday: DEFAULT_REWARDS_POLICY.perGameDailyEarnLimit,
      pointsEarnedToday: 10,
      earnSessionsToday: 2,
    });
    expect(result).toEqual({ kind: "practice", reason: "per_game_limit" });
  });

  it("uses practice mode when daily points cap would be exceeded", () => {
    const result = evaluateGameEarn({
      pointsPerPlay: 8,
      perGamePlaysToday: 0,
      pointsEarnedToday: DEFAULT_REWARDS_POLICY.dailyPointsCap - 5,
      earnSessionsToday: 5,
    });
    expect(result).toEqual({ kind: "practice", reason: "daily_points_cap" });
  });

  it("enforces cooldown between same-game earns", () => {
    const now = new Date("2026-06-21T12:00:00Z");
    const result = evaluateGameEarn({
      pointsPerPlay: 4,
      perGamePlaysToday: 1,
      pointsEarnedToday: 4,
      earnSessionsToday: 1,
      lastEarnAtForGame: new Date("2026-06-21T11:58:30Z").toISOString(),
      now,
      policy: { sameGameCooldownMinutes: 3, perGameDailyEarnLimit: 3, dailyPointsCap: 40, dailyEarnSessionLimit: 10 },
    });
    expect(result.kind).toBe("practice");
    if (result.kind === "practice") {
      expect(result.reason).toBe("cooldown");
      expect(result.cooldownMinutesLeft).toBeGreaterThan(0);
    }
  });
});
