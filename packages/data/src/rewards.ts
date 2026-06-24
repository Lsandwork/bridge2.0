import {
  approveRedemption,
  awardParentPoints,
  completeGameSession,
  createLocalReward,
  getLocalChildProfiles,
  getPointsBalance,
  getPointEvents,
  getRedemptions,
  getRewardsForProfile,
  getRewardsHub,
  requestRedemption,
  updateLocalGameSettings,
} from "./local-store";

export type { PointEvent, ProfileGameSettings, Redemption, GameCompleteResult } from "./local-store";

export async function fetchRewardsHub(childProfileId: string) {
  return getRewardsHub(childProfileId);
}

export async function fetchAllProfilesRewards() {
  const profiles = getLocalChildProfiles();
  return profiles.map((p) => ({
    profile: p,
    balance: getPointsBalance(p.id),
    rewards: getRewardsForProfile(p.id),
    pendingRedemptions: getRedemptions(p.id).filter((r) => r.status === "pending"),
  }));
}

export {
  approveRedemption,
  awardParentPoints,
  completeGameSession,
  createLocalReward,
  getPointsBalance,
  getPointEvents,
  getRedemptions,
  getRewardsForProfile,
  getRewardsHub,
  requestRedemption,
  updateLocalGameSettings,
};
