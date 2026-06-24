import { NextResponse } from "next/server";
import { authenticateDemoUser, homePathForAuthUser, logUserActivity, notifySpectrumAuthEvent } from "@family-support/data";
import { setSessionCookie } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email?.trim() ?? "";
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = authenticateDemoUser(email, password);
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    logUserActivity(user.id, user.email, "login");

    if (user.role === "child_user") {
      notifySpectrumAuthEvent(user, "login");
    }

    const response = NextResponse.json({
      user,
      redirectTo: homePathForAuthUser(user),
    });
    setSessionCookie(response, user);
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Login failed." },
      { status: 500 }
    );
  }
}
