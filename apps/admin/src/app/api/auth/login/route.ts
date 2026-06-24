import { NextResponse } from "next/server";
import { authenticateDemoUser, logUserActivity } from "@family-support/data";
import { isAdminRole, setAdminSessionCookie } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email?.trim() ?? "";
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = authenticateDemoUser(email, password);
    if (!user || !isAdminRole(user.role)) {
      return NextResponse.json({ error: "Admin access only." }, { status: 403 });
    }

    logUserActivity(user.id, user.email, "admin_login");

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      redirectTo: "/",
    });
    setAdminSessionCookie(response, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Login failed." },
      { status: 500 }
    );
  }
}
