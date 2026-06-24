/**
 * Spectrum-friendly token economy policy.
 *
 * Based on ABA token economy principles: fixed-ratio reinforcement (same stars
 * every completion), predictable daily structure, parent-controlled limits,
 * immediate feedback, and no response-cost (stars are never taken away for play).
 */

export const DEFAULT_REWARDS_POLICY = {
  /** Paid completions allowed per game per calendar day */
  perGameDailyEarnLimit: 3,
  /** Maximum stars earnable from games per day */
  dailyPointsCap: 40,
  /** Minutes between paid plays of the same game (reduces repetitive loops) */
  sameGameCooldownMinutes: 3,
  /** Maximum game sessions that award stars per day (all games combined) */
  dailyEarnSessionLimit: 10,
};

export type RewardsPolicy = {
  perGameDailyEarnLimit: number;
  dailyPointsCap: number;
  sameGameCooldownMinutes: number;
  dailyEarnSessionLimit: number;
};

export type PracticeReason =
  | "per_game_limit"
  | "daily_points_cap"
  | "daily_session_limit"
  | "cooldown";

export type GameEarnOutcome =
  | { kind: "earned"; points: number }
  | { kind: "practice"; reason: PracticeReason; cooldownMinutesLeft?: number };

export function evaluateGameEarn(input: {
  pointsPerPlay: number;
  perGamePlaysToday: number;
  pointsEarnedToday: number;
  earnSessionsToday: number;
  lastEarnAtForGame?: string | null;
  now?: Date;
  policy?: Partial<RewardsPolicy>;
}): GameEarnOutcome {
  const policy = { ...DEFAULT_REWARDS_POLICY, ...input.policy };

  if (input.perGamePlaysToday >= policy.perGameDailyEarnLimit) {
    return { kind: "practice", reason: "per_game_limit" };
  }
  if (input.earnSessionsToday >= policy.dailyEarnSessionLimit) {
    return { kind: "practice", reason: "daily_session_limit" };
  }
  if (input.pointsEarnedToday + input.pointsPerPlay > policy.dailyPointsCap) {
    return { kind: "practice", reason: "daily_points_cap" };
  }
  if (input.lastEarnAtForGame) {
    const last = new Date(input.lastEarnAtForGame).getTime();
    const cooldownMs = policy.sameGameCooldownMinutes * 60 * 1000;
    const elapsed = (input.now ?? new Date()).getTime() - last;
    if (elapsed < cooldownMs) {
      return {
        kind: "practice",
        reason: "cooldown",
        cooldownMinutesLeft: Math.max(1, Math.ceil((cooldownMs - elapsed) / 60000)),
      };
    }
  }

  return { kind: "earned", points: input.pointsPerPlay };
}

export function practiceMessage(
  reason: PracticeReason,
  opts?: { cooldownMinutesLeft?: number; gameTitle?: string }
): string {
  switch (reason) {
    case "per_game_limit":
      return `You earned all your stars for ${opts?.gameTitle ?? "this game"} today. Keep playing for fun — stars reset tomorrow!`;
    case "daily_points_cap":
      return "You reached today's star limit. Amazing work! You can still play; new stars arrive tomorrow.";
    case "daily_session_limit":
      return "You've finished enough earning games for today. Practice mode is on — play anytime without pressure.";
    case "cooldown":
      return `Short break for this game — stars return in ${opts?.cooldownMinutesLeft ?? 1} min. Try a different game meanwhile!`;
  }
}

export function earnedMessage(points: number, gameTitle: string): string {
  return `+${points} stars for ${gameTitle}! You always earn the same amount when you finish.`;
}

export function getNextRewardProgress(
  balance: number,
  rewards: { title: string; pointsRequired: number }[]
): { title: string; pointsRequired: number; remaining: number; progress: number } | null {
  const affordable = rewards.filter((r) => r.pointsRequired > balance);
  if (affordable.length === 0) {
    const cheapest = rewards.reduce(
      (min, r) => (r.pointsRequired < min.pointsRequired ? r : min),
      rewards[0]
    );
    if (!cheapest) return null;
    return {
      title: cheapest.title,
      pointsRequired: cheapest.pointsRequired,
      remaining: 0,
      progress: 1,
    };
  }
  const next = affordable.reduce(
    (min, r) => (r.pointsRequired < min.pointsRequired ? r : min),
    affordable[0]
  );
  const remaining = next.pointsRequired - balance;
  const progress = Math.min(1, balance / next.pointsRequired);
  return { title: next.title, pointsRequired: next.pointsRequired, remaining, progress };
}
