import { NextResponse } from "next/server";
import { getGoals, getRewards, getRoutines, getTasks, resolveProfilesForSessionUser } from "@family-support/data";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

    const profiles = await resolveProfilesForSessionUser(session);
    const profileIds = new Set(profiles.map((profile) => profile.id));

    if (profileIds.size === 0) {
      return NextResponse.json({ routines: [], tasks: [], goals: [], rewards: [] });
    }

    const [routinesByProfile, tasksByProfile, goalsByProfile, rewardsByProfile] = await Promise.all([
      Promise.all([...profileIds].map((profileId) => getRoutines(profileId))),
      Promise.all([...profileIds].map((profileId) => getTasks(profileId))),
      Promise.all([...profileIds].map((profileId) => getGoals(profileId))),
      Promise.all([...profileIds].map((profileId) => getRewards(profileId))),
    ]);

    return NextResponse.json({
      routines: routinesByProfile.flat(),
      tasks: tasksByProfile.flat(),
      goals: goalsByProfile.flat(),
      rewards: rewardsByProfile.flat(),
    });
  } catch {
    return NextResponse.json({ error: "Failed to load routines data" }, { status: 500 });
  }
}
