import { NextResponse } from "next/server";
import {
  createLocalExercise,
  getExercises,
  resolveProfilesForSessionUser,
  userCanAccessProfile,
} from "@family-support/data";
import { getSession } from "@/lib/auth/session";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("childProfileId") ?? searchParams.get("profileId") ?? undefined;
    if (profileId && !(await userCanAccessProfile(session, profileId))) {
      return NextResponse.json({ error: "You do not have access to this profile." }, { status: 403 });
    }

    const data = await getExercises();
    if (!profileId) {
      const profiles = await resolveProfilesForSessionUser(session);
      const allowed = new Set(profiles.map((profile) => profile.id));
      return NextResponse.json(
        data.filter((row) => {
          const id = (row as { childProfileId?: string; child_profile_id?: string }).childProfileId
            ?? (row as { child_profile_id?: string }).child_profile_id;
          return typeof id === "string" ? allowed.has(id) : false;
        })
      );
    }

    return NextResponse.json(
      data.filter((row) => {
        const id = (row as { childProfileId?: string; child_profile_id?: string }).childProfileId
          ?? (row as { child_profile_id?: string }).child_profile_id;
        return id === profileId;
      })
    );
  } catch {
    return NextResponse.json({ error: "Failed to load exercises" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

    const body = await request.json();
    if (!body.title || !body.goal || !Array.isArray(body.steps) || body.steps.length === 0) {
      return NextResponse.json({ error: "Title, goal, and steps are required." }, { status: 400 });
    }

    const childProfileId = typeof body.childProfileId === "string" ? body.childProfileId : null;
    if (!childProfileId) {
      return NextResponse.json({ error: "Profile is required." }, { status: 400 });
    }
    if (!(await userCanAccessProfile(session, childProfileId))) {
      return NextResponse.json({ error: "You do not have access to this profile." }, { status: 403 });
    }

    const exercise = createLocalExercise({
      childProfileId,
      title: body.title,
      category: body.category ?? "life_skill",
      goal: body.goal,
      steps: body.steps,
      promptLevel: body.promptLevel ?? "Least-to-most",
      timerMinutes: Number(body.timerMinutes) || 10,
      difficulty: body.difficulty ?? "moderate",
      frequency: body.frequency ?? "daily",
      rewardIdea: body.rewardIdea ?? "Preferred activity",
    });
    return NextResponse.json(exercise, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create exercise" },
      { status: 500 }
    );
  }
}
