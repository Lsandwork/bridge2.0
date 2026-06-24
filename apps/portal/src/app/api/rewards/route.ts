import { NextResponse } from "next/server";
import {
  approveRedemption,
  awardParentPoints,
  completeGameSession,
  createLocalReward,
  fetchAllProfilesRewards,
  fetchRewardsHub,
  requestRedemption,
  updateLocalGameSettings,
} from "@family-support/data";
import { getGame as getGameMeta } from "@family-support/core";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get("profileId");
  try {
    if (profileId) {
      const hub = await fetchRewardsHub(profileId);
      if (!hub) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
      return NextResponse.json(hub);
    }
    return NextResponse.json({ profiles: await fetchAllProfilesRewards() });
  } catch {
    return NextResponse.json({ error: "Failed to load rewards" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    switch (body.action) {
      case "game-complete": {
        const game = getGameMeta(body.gameId);
        if (!game) return NextResponse.json({ error: "Unknown game" }, { status: 400 });
        const result = completeGameSession(body.profileId, body.gameId, game.title, game.pointsPerPlay);
        return NextResponse.json(result);
      }
      case "redeem": {
        const redemption = requestRedemption(body.profileId, body.rewardId);
        return NextResponse.json({ redemption, hub: await fetchRewardsHub(body.profileId) });
      }
      case "approve-redemption": {
        const item = approveRedemption(body.redemptionId);
        return NextResponse.json({ item });
      }
      case "create-reward": {
        const reward = createLocalReward({
          childProfileId: body.profileId,
          title: body.title,
          pointsRequired: body.pointsRequired,
          emoji: body.emoji ?? "⭐",
        });
        return NextResponse.json({ reward });
      }
      case "update-games": {
        const settings = updateLocalGameSettings(body.profileId, {
          enabledGameIds: body.enabledGameIds,
          dailyEarnSessionLimit: body.dailyEarnSessionLimit ?? body.dailyGameLimit,
          perGameDailyEarnLimit: body.perGameDailyEarnLimit,
          dailyPointsCap: body.dailyPointsCap,
          sameGameCooldownMinutes: body.sameGameCooldownMinutes,
        });
        return NextResponse.json({ settings });
      }
      case "award-points": {
        const event = awardParentPoints(body.profileId, body.amount, body.reason ?? "Bonus from parent");
        return NextResponse.json({ event, balance: (await fetchRewardsHub(body.profileId))?.balance });
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Request failed" }, { status: 400 });
  }
}
