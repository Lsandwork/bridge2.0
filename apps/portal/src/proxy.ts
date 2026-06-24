import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  homePathForRole,
  parseSessionCookie,
  SESSION_COOKIE,
} from "@/lib/auth/session-cookie";

const PUBLIC_EXACT = new Set(["/", "/login", "/change-password", "/pricing", "/onboarding"]);

const PUBLIC_PREFIXES = ["/library"];

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/profiles",
  "/routines",
  "/tasks",
  "/communication",
  "/goals",
  "/rewards",
  "/reports",
  "/tess",
  "/settings",
  "/care-team",
  "/exercises",
  "/social-stories",
  "/ai-assistant",
  "/my-space",
  "/progress",
  "/ai-review",
];

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isApiRoute(pathname: string) {
  return pathname.startsWith("/api/");
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isApiRoute(pathname)) {
    return NextResponse.next();
  }

  const session = parseSessionCookie(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === "/login" && session && !session.mustChangePassword) {
    return NextResponse.redirect(new URL(homePathForRole(session.role), request.url));
  }

  if (session?.mustChangePassword && pathname !== "/change-password" && pathname !== "/login") {
    return NextResponse.redirect(new URL("/change-password", request.url));
  }

  if (isProtected(pathname) && !session) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  if (session && pathname === "/change-password" && !session.mustChangePassword) {
    return NextResponse.redirect(new URL(homePathForRole(session.role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
