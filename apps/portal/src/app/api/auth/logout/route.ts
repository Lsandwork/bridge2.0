import { NextResponse } from "next/server";
import { logUserActivity, notifySpectrumAuthEvent } from "@family-support/data";
import { clearSessionCookie, getSession } from "@/lib/auth/session";

export async function POST() {
  const session = await getSession();
  const response = NextResponse.json({ ok: true });
  if (session) {
    logUserActivity(session.id, session.email, "logout");
    if (session.role === "child_user") {
      notifySpectrumAuthEvent(session, "logout");
    }
  }
  clearSessionCookie(response);
  return response;
}
