import type { AppRole } from "@family-support/core";
import type { NextResponse } from "next/server";

export const SESSION_COOKIE = "bridge_session";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: AppRole;
  mustChangePassword: boolean;
};

export function homePathForRole(role: AppRole): string {
  if (role === "child_user") return "/my-space";
  if (role === "caregiver_therapist_teacher") return "/therapist";
  return "/dashboard";
}

export function parseSessionCookie(value: string | undefined): SessionUser | null {
  if (!value) return null;
  try {
    return JSON.parse(decodeURIComponent(value)) as SessionUser;
  } catch {
    return null;
  }
}

export function getSessionCookieDomain(siteUrl = process.env.NEXT_PUBLIC_SITE_URL): string | undefined {
  if (!siteUrl) return undefined;
  try {
    const hostname = new URL(siteUrl).hostname.toLowerCase().replace(/^www\./, "");
    if (
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".vercel.app") ||
      !hostname.includes(".")
    ) {
      return undefined;
    }
    return `.${hostname}`;
  } catch {
    return undefined;
  }
}

export function setSessionCookie(response: NextResponse, user: SessionUser) {
  response.cookies.set(SESSION_COOKIE, encodeURIComponent(JSON.stringify(user)), {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    domain: getSessionCookieDomain(),
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    domain: getSessionCookieDomain(),
    maxAge: 0,
  });
}
