import { cookies } from "next/headers";
import {
  demoSessionUser,
  isDemoAuthUserId,
  resolveSupabaseSession,
} from "@family-support/data";
import {
  SESSION_COOKIE,
  SUPABASE_ACCESS_COOKIE,
  SUPABASE_REFRESH_COOKIE,
  bridgeAuthUserToSessionUser,
  type SessionUser,
  clearSessionCookie,
  homePathForRole,
  parseSessionCookie,
  setAuthSession,
  setSessionCookie,
  setSupabaseAuthCookies,
} from "@/lib/auth/session-cookie";

export {
  SESSION_COOKIE,
  SUPABASE_ACCESS_COOKIE,
  SUPABASE_REFRESH_COOKIE,
  bridgeAuthUserToSessionUser,
  type SessionUser,
  clearSessionCookie,
  homePathForRole,
  parseSessionCookie,
  setAuthSession,
  setSessionCookie,
  setSupabaseAuthCookies,
};

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(SUPABASE_ACCESS_COOKIE)?.value;
  const refreshToken = cookieStore.get(SUPABASE_REFRESH_COOKIE)?.value;

  if (accessToken) {
    const resolved = await resolveSupabaseSession(accessToken, refreshToken);
    if (resolved?.user) {
      return bridgeAuthUserToSessionUser(resolved.user);
    }
  }

  const legacy = parseSessionCookie(cookieStore.get(SESSION_COOKIE)?.value);
  if (legacy && isDemoAuthUserId(legacy.id)) {
    const demo = demoSessionUser(legacy.id);
    return demo ? bridgeAuthUserToSessionUser(demo) : legacy;
  }

  return null;
}
