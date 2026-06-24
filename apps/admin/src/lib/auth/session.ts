import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  type AdminSessionUser,
  clearAdminSessionCookie,
  parseAdminSessionCookie,
  setAdminSessionCookie,
} from "@/lib/auth/session-cookie";

export {
  ADMIN_SESSION_COOKIE,
  type AdminSessionUser,
  clearAdminSessionCookie,
  isAdminRole,
  parseAdminSessionCookie,
  setAdminSessionCookie,
} from "@/lib/auth/session-cookie";

export async function getAdminSession(): Promise<AdminSessionUser | null> {
  const cookie = (await cookies()).get(ADMIN_SESSION_COOKIE);
  return parseAdminSessionCookie(cookie?.value);
}
