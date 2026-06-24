import { NextResponse } from "next/server";
import { getTherapistDashboard } from "@family-support/data";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "caregiver_therapist_teacher" && session.role !== "admin" && session.role !== "super_admin") {
    return NextResponse.json({ error: "Therapist access only." }, { status: 403 });
  }

  return NextResponse.json(getTherapistDashboard());
}
