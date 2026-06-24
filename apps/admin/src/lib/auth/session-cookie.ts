import type { AppRole } from "@family-support/core";
import type { NextResponse } from "next/server";

export const ADMIN_SESSION_COOKIE = "bridge_admin_session";

export type AdminSessionUser = {
  id: string;
  email: string;
  name: string;
  role: AppRole;
};

export function isAdminRole(role: AppRole) {
  return role === "admin" || role === "super_admin";
}

export function parseAdminSessionCookie(value: string | undefined): AdminSessionUser | null {
  if (!value) return null;
  try {
    const user = JSON.parse(decodeURIComponent(value)) as AdminSessionUser;
    return isAdminRole(user.role) ? user : null;
  } catch {
    return null;
  }
}

export function setAdminSessionCookie(response: NextResponse, user: AdminSessionUser) {
  response.cookies.set(ADMIN_SESSION_COOKIE, encodeURIComponent(JSON.stringify(user)), {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set(ADMIN_SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}
