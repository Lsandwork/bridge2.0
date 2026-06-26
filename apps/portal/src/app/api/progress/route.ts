import { NextResponse } from "next/server";
import { getCheckIns, getGoals, getTasks, resolveProfilesForSessionUser } from "@family-support/data";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

    const profiles = await resolveProfilesForSessionUser(session);
    const profileIds = profiles.map((profile) => profile.id);
    if (!profileIds.length) {
      return NextResponse.json({ tasks: [], checkIns: [], goals: [] });
    }

    const [tasks, checkIns, goals] = await Promise.all([
      Promise.all(profileIds.map((profileId) => getTasks(profileId))).then((rows) => rows.flat()),
      Promise.all(profileIds.map((profileId) => getCheckIns(profileId))).then((rows) => rows.flat()),
      Promise.all(profileIds.map((profileId) => getGoals(profileId))).then((rows) => rows.flat()),
    ]);

    return NextResponse.json({ tasks, checkIns, goals });
  } catch {
    return NextResponse.json({ error: "Failed to load progress data" }, { status: 500 });
  }
}
