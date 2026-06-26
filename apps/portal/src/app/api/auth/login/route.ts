import { NextResponse } from "next/server";
import {
  homePathForAuthUser,
  logUserActivity,
  notifySpectrumAuthEvent,
  supabaseSignIn,
} from "@family-support/data";
import { bridgeAuthUserToSessionUser, setAuthSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email?.trim() ?? "";
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const { user, tokens } = await supabaseSignIn(email, password);
    logUserActivity(user.id, user.email, "login");

    if (user.role === "child_user") {
      notifySpectrumAuthEvent(bridgeAuthUserToSessionUser(user), "login");
    }

    const sessionUser = bridgeAuthUserToSessionUser(user);
    const response = NextResponse.json({
      user: sessionUser,
      redirectTo: homePathForAuthUser(sessionUser),
    });
    setAuthSession(response, sessionUser, tokens.accessToken ? tokens : undefined);
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Login failed." },
      { status: error instanceof Error && error.message.includes("Invalid") ? 401 : 500 }
    );
  }
}
