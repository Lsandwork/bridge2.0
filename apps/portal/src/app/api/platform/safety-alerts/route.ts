import { NextResponse } from "next/server";
import { listSafetyAlertsForUser, updateSafetyAlertStatus } from "@family-support/data";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.role === "child_user") {
    return NextResponse.json({ alerts: [] });
  }

  const alerts = listSafetyAlertsForUser(session.id, { includeDemo: true });
  return NextResponse.json({ alerts });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.role === "child_user") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const alert = updateSafetyAlertStatus(body.alertId, body.status, session.id, body.note);
  if (!alert) return NextResponse.json({ error: "Alert not found" }, { status: 404 });
  return NextResponse.json({ ok: true, alert });
}
