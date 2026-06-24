import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, parseAdminSessionCookie } from "@/lib/auth/session-cookie";

const PUBLIC = new Set(["/login"]);

function isApiAuth(pathname: string) {
  return pathname.startsWith("/api/auth/");
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isApiAuth(pathname) || PUBLIC.has(pathname)) {
    return NextResponse.next();
  }

  const session = parseAdminSessionCookie(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Admin sign-in required." }, { status: 401 });
    }
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
