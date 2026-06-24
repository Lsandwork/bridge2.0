import { NextResponse } from "next/server";
import {
  createLocalChildProfile,
  getChildProfiles,
  resolveChildProfilesForSession,
} from "@family-support/data";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getSession();
    const data = await resolveChildProfilesForSession(
      session?.id,
      session?.role,
      getChildProfiles
    );
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to load profiles" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.ageGroup) {
      return NextResponse.json({ error: "Name and age group are required." }, { status: 400 });
    }
    const profile = createLocalChildProfile({
      name: body.name,
      ageGroup: body.ageGroup,
      mode: body.mode ?? body.ageGroup,
      supportNotes: body.supportNotes ?? "",
    });
    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create profile" },
      { status: 500 }
    );
  }
}
