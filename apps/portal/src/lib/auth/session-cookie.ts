import type { AppRole } from "@family-support/core";
import type { NextResponse } from "next/server";
import type { BridgeAuthUser } from "@family-support/data";

export const SESSION_COOKIE = "bridge_session";
export const SUPABASE_ACCESS_COOKIE = "bridge_sb_access";
export const SUPABASE_REFRESH_COOKIE = "bridge_sb_refresh";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: AppRole;
  mustChangePassword: boolean;
  isDemo?: boolean;
  onboardingComplete?: boolean;
};

export function bridgeAuthUserToSessionUser(user: BridgeAuthUser): SessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
    isDemo: user.isDemo,
    onboardingComplete: user.onboardingComplete,
  };
}

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

function cookieBase() {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    domain: getSessionCookieDomain(),
  };
}

export function setSessionCookie(response: NextResponse, user: SessionUser) {
  response.cookies.set(SESSION_COOKIE, encodeURIComponent(JSON.stringify(user)), {
    ...cookieBase(),
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function setSupabaseAuthCookies(
  response: NextResponse,
  tokens: { accessToken: string; refreshToken: string; expiresIn: number }
) {
  response.cookies.set(SUPABASE_ACCESS_COOKIE, tokens.accessToken, {
    ...cookieBase(),
    maxAge: tokens.expiresIn,
  });
  response.cookies.set(SUPABASE_REFRESH_COOKIE, tokens.refreshToken, {
    ...cookieBase(),
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", { ...cookieBase(), maxAge: 0 });
  response.cookies.set(SUPABASE_ACCESS_COOKIE, "", { ...cookieBase(), maxAge: 0 });
  response.cookies.set(SUPABASE_REFRESH_COOKIE, "", { ...cookieBase(), maxAge: 0 });
}

export function setAuthSession(
  response: NextResponse,
  user: SessionUser,
  tokens?: { accessToken: string; refreshToken: string; expiresIn: number }
) {
  if (user.isDemo) {
    setSessionCookie(response, user);
    return;
  }
  if (tokens?.accessToken) {
    setSupabaseAuthCookies(response, tokens);
  }
  setSessionCookie(
    response,
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      isDemo: false,
      onboardingComplete: user.onboardingComplete,
    }
  );
}
