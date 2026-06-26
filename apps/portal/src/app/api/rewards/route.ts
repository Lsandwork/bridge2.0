import { NextResponse } from "next/server";
import {
  approveRedemption,
  awardParentPoints,
  completeGameSession,
  createLocalReward,
  fetchRewardsHub,
  getRewardsForProfile,
  getPointsBalance,
  getRedemptions,
  resolveProfilesForSessionUser,
  userCanAccessProfile,
  requestRedemption,
  updateLocalGameSettings,
} from "@family-support/data";
import { getGame as getGameMeta } from "@family-support/core";
import { getSession } from "@/lib/auth/session";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get("profileId");
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

    if (profileId) {
      if (!(await userCanAccessProfile(session, profileId))) {
        return NextResponse.json({ error: "You do not have access to this profile." }, { status: 403 });
      }
      const hub = await fetchRewardsHub(profileId);
      if (!hub) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
      return NextResponse.json(hub);
    }

    const profiles = await resolveProfilesForSessionUser(session);
    return NextResponse.json({
      profiles: profiles.map((profile) => ({
        profile,
        balance: getPointsBalance(profile.id),
        rewards: getRewardsForProfile(profile.id),
        pendingRedemptions: getRedemptions(profile.id).filter((r) => r.status === "pending"),
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to load rewards" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

    const body = await request.json();
    const requestedProfileId = typeof body.profileId === "string" ? body.profileId : null;
    if (requestedProfileId && !(await userCanAccessProfile(session, requestedProfileId))) {
      return NextResponse.json({ error: "You do not have access to this profile." }, { status: 403 });
    }

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
