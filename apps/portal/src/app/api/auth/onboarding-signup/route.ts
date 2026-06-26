import { NextResponse } from "next/server";
import {
  createUserSetup,
  homePathForAuthUser,
  logUserActivity,
  supabaseSignUp,
} from "@family-support/data";
import { bridgeAuthUserToSessionUser, setAuthSession } from "@/lib/auth/session";

type OnboardingSignupBody = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  accountType?: "parent" | "therapist";
  setupRole?: "self" | "family" | "professional";
  pathwayId?: string;
  safetyAcceptedAt?: string;
  profileName?: string;
  ageGroup?: "child" | "teen" | "adult";
  supportNotes?: string;
  termsAccepted?: boolean;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as OnboardingSignupBody;

    const name = body.name?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    const password = body.password ?? "";
    const confirmPassword = body.confirmPassword ?? "";
    const setupRole = body.setupRole ?? "family";
    const accountType =
      body.accountType ?? (setupRole === "professional" ? "therapist" : "parent");

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
    }
    if (!body.termsAccepted) {
      return NextResponse.json({ error: "You must accept the terms to continue." }, { status: 400 });
    }
    if (accountType !== "parent" && accountType !== "therapist") {
      return NextResponse.json({ error: "Invalid account type." }, { status: 400 });
    }

    const role = accountType === "therapist" ? "caregiver_therapist_teacher" : "parent_guardian";
    const shouldCreateProfile =
      accountType === "parent" && (setupRole === "family" || setupRole === "self");
    const profileName = (body.profileName ?? (setupRole === "self" ? name : "")).trim();
    const ageGroup = body.ageGroup ?? (setupRole === "self" ? "adult" : "child");

    if (shouldCreateProfile && !profileName) {
      return NextResponse.json(
        { error: "Enter the name of the child, teen, or adult you are supporting." },
        { status: 400 }
      );
    }

    const { user, tokens } = await supabaseSignUp({
      email,
      password,
      name,
      role,
      intake: {
        pathwayId: body.pathwayId ?? "autism",
        setupRole,
        safetyAcceptedAt: body.safetyAcceptedAt ?? new Date().toISOString(),
        termsAcceptedAt: new Date().toISOString(),
      },
      childProfile: shouldCreateProfile
        ? {
            profileName,
            ageGroup,
            supportNotes: body.supportNotes?.trim() ?? "",
            setupRole,
          }
        : undefined,
    });

    createUserSetup(user.id, accountType);
    logUserActivity(user.id, user.email, "signup");

    const sessionUser = bridgeAuthUserToSessionUser(user);
    const response = NextResponse.json({
      user: sessionUser,
      redirectTo: shouldCreateProfile ? "/dashboard" : homePathForAuthUser(sessionUser),
    });
    setAuthSession(response, sessionUser, tokens);
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Account creation failed." },
      { status: 400 }
    );
  }
}
