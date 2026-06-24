import { NextResponse } from "next/server";
import { logUserActivity } from "@family-support/data";
import { clearAdminSessionCookie, getAdminSession } from "@/lib/auth/session";

export async function POST() {
  const session = await getAdminSession();
  const response = NextResponse.json({ ok: true });
  if (session) {
    logUserActivity(session.id, session.email, "admin_logout");
  }
  clearAdminSessionCookie(response);
  return response;
}
