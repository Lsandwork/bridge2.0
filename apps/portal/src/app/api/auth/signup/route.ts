import { NextResponse } from "next/server";
import {
  createUserSetup,
  homePathForAuthUser,
  logUserActivity,
  supabaseSignUp,
} from "@family-support/data";
import { bridgeAuthUserToSessionUser, setAuthSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
      accountType?: "parent" | "therapist";
    };

    const name = body.name?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    const password = body.password ?? "";
    const accountType = body.accountType;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
    }
    if (accountType !== "parent" && accountType !== "therapist") {
      return NextResponse.json({ error: "Choose Parent or Therapist account type." }, { status: 400 });
    }

    const role = accountType === "therapist" ? "caregiver_therapist_teacher" : "parent_guardian";
    const { user, tokens } = await supabaseSignUp({
      email,
      password,
      name,
      role,
    });
    createUserSetup(user.id, accountType);
    logUserActivity(user.id, user.email, "signup");

    const sessionUser = bridgeAuthUserToSessionUser(user);
    const response = NextResponse.json({
      user: sessionUser,
      redirectTo: homePathForAuthUser(sessionUser),
    });
    setAuthSession(response, sessionUser, tokens);
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sign up failed." },
      { status: 400 }
    );
  }
}
