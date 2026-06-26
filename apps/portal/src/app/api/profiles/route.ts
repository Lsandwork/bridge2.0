import { NextResponse } from "next/server";
import {
  createPersistedChildProfile,
  resolveChildProfilesForSession,
} from "@family-support/data";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const data = await resolveChildProfilesForSession(session);
    return NextResponse.json(
      data.map((p) => ({ id: p.id, name: p.name, ageGroup: p.ageGroup }))
    );
  } catch {
    return NextResponse.json({ error: "Failed to load profiles" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const body = await request.json();
    if (!body.name || !body.ageGroup) {
      return NextResponse.json({ error: "Name and age group are required." }, { status: 400 });
    }

    const profile = await createPersistedChildProfile(session.id, session.role, {
      profileName: body.name,
      ageGroup: body.ageGroup,
      supportNotes: body.supportNotes ?? "",
      setupRole: session.role === "caregiver_therapist_teacher" ? "professional" : "family",
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create profile" },
      { status: 500 }
    );
  }
}
