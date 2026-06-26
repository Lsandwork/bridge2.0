import { NextResponse } from "next/server";
import { getNotificationPreferences, saveNotificationPreferences } from "@family-support/data";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const preferences = await getNotificationPreferences(session.id);
  return NextResponse.json({ preferences });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = (await request.json()) as {
    setupReminders?: boolean;
    careTeamActivity?: boolean;
    weeklySummary?: boolean;
    goalRoutineReminders?: boolean;
    safetyAlerts?: boolean;
  };

  const current = await getNotificationPreferences(session.id);
  const preferences = {
    setupReminders: body.setupReminders ?? current.setupReminders,
    careTeamActivity: body.careTeamActivity ?? current.careTeamActivity,
    weeklySummary: body.weeklySummary ?? current.weeklySummary,
    goalRoutineReminders: body.goalRoutineReminders ?? current.goalRoutineReminders,
    safetyAlerts: body.safetyAlerts ?? current.safetyAlerts,
  };

  const saved = await saveNotificationPreferences(session.id, preferences);
  if (!saved) {
    return NextResponse.json({ error: "Could not save preferences." }, { status: 500 });
  }
  return NextResponse.json({ preferences });
}
