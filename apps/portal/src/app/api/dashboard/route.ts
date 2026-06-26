import { NextRequest, NextResponse } from "next/server";
import {
  getDashboardSnapshot,
  resolveProfilesForSessionUser,
  userCanAccessProfile,
} from "@family-support/data";
import { getSession } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Sign in to view your dashboard." }, { status: 401 });
    }

    const profileId = req.nextUrl.searchParams.get("profileId");
    const accessible = await resolveProfilesForSessionUser(session);

    if (!profileId) {
      if (!accessible.length) {
        return NextResponse.json({ error: "No profile found for this account." }, { status: 404 });
      }
      const first = accessible[0];
      const data = await getDashboardSnapshot(first.id, {
        childName: first.name,
        allowEmpty: true,
        authUserId: session.id,
      });
      return NextResponse.json(data);
    }

    if (!(await userCanAccessProfile(session, profileId))) {
      return NextResponse.json({ error: "You do not have access to this profile." }, { status: 403 });
    }

    const profile = accessible.find((p) => p.id === profileId);
    const data = await getDashboardSnapshot(profileId, {
      childName: profile?.name,
      allowEmpty: true,
      authUserId: session.id,
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load dashboard" },
      { status: 500 }
    );
  }
}
