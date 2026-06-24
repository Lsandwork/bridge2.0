import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  type SessionUser,
  clearSessionCookie,
  homePathForRole,
  parseSessionCookie,
  setSessionCookie,
} from "@/lib/auth/session-cookie";

export {
  SESSION_COOKIE,
  type SessionUser,
  clearSessionCookie,
  homePathForRole,
  parseSessionCookie,
  setSessionCookie,
};

export async function getSession(): Promise<SessionUser | null> {
  const cookie = (await cookies()).get(SESSION_COOKIE);
  return parseSessionCookie(cookie?.value);
}
