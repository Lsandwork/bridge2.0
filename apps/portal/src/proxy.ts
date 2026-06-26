import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  homePathForRole,
  parseSessionCookie,
  SESSION_COOKIE,
} from "@/lib/auth/session-cookie";

function isAdminRole(role: string | undefined) {
  return role === "admin" || role === "super_admin";
}

const ADMIN_ROUTE_MAP: Record<string, string> = {
  "/pricing": "/admin/pricing",
  "/dashboard": "/admin",
  "/settings": "/admin/settings",
  "/messages": "/admin/messages",
  "/safety-alerts": "/admin/safety-alerts",
  "/profiles": "/admin/users",
  "/library": "/admin/credits",
  "/library/coverage": "/admin/pricing",
  "/reports": "/admin/activity",
};

const PUBLIC_EXACT = new Set(["/", "/login", "/change-password", "/pricing", "/onboarding", "/onboarding/account"]);

const PUBLIC_PREFIXES = ["/library"];

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/profiles",
  "/messages",
  "/safety-alerts",
  "/admin",
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

  if (session && isAdminRole(session.role) && !pathname.startsWith("/admin")) {
    const mapped = ADMIN_ROUTE_MAP[pathname];
    if (mapped) {
      return NextResponse.redirect(new URL(mapped, request.url));
    }
    if (isProtected(pathname)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

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
