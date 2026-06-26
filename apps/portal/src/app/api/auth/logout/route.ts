import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { logUserActivity, notifySpectrumAuthEvent, supabaseSignOut } from "@family-support/data";
import {
  clearSessionCookie,
  getSession,
  SUPABASE_ACCESS_COOKIE,
} from "@/lib/auth/session";

export async function POST() {
  const session = await getSession();
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(SUPABASE_ACCESS_COOKIE)?.value;

  const response = NextResponse.json({ ok: true });
  if (session) {
    logUserActivity(session.id, session.email, "logout");
    if (session.role === "child_user") {
      notifySpectrumAuthEvent(session, "logout");
    }
  }
  if (accessToken) {
    await supabaseSignOut(accessToken);
  }
  clearSessionCookie(response);
  return response;
}
