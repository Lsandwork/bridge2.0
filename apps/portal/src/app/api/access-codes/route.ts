import { NextResponse } from "next/server";
import {
  createChildLoginAccount,
  createPersistedAccessCode,
  createPersistedChildProfile,
  generateAccessCode,
  getAccessCodeForProfile,
  getPersistedAccessCodeForProfile,
  linkUserToProfile,
  markSetupComplete,
  markPersistedSetupComplete,
  redeemPersistedAccessCode,
  redeemAccessCode,
} from "@family-support/data";
import { getSession } from "@/lib/auth/session";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Your session expired. Please sign in again.", code: "SESSION_EXPIRED" },
      { status: 401 }
    );
  }

  const profileId = new URL(request.url).searchParams.get("profileId");
  if (!profileId) {
    return NextResponse.json({ error: "profileId is required." }, { status: 400 });
  }

  const code = session.isDemo
    ? getAccessCodeForProfile(profileId)
    : await getPersistedAccessCodeForProfile(profileId);
  return NextResponse.json({ profileId, code });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Your session expired. Please sign in again.", code: "SESSION_EXPIRED" },
      { status: 401 }
    );
  }

  try {
    const body = (await request.json()) as {
      action?: string;
      code?: string;
      name?: string;
      ageGroup?: "child" | "teen" | "adult";
      supportNotes?: string;
      parentName?: string;
      parentEmail?: string;
      childLoginEmail?: string;
      childLoginPassword?: string;
      childLoginName?: string;
      profileId?: string;
    };

    if (body.action === "redeem") {
      const relationship =
        session.role === "caregiver_therapist_teacher"
          ? "therapist"
          : session.role === "parent_guardian"
            ? "parent"
            : null;
      if (!relationship) {
        return NextResponse.json({ error: "Only parents and therapists can redeem codes." }, { status: 403 });
      }
      if (!body.code) return NextResponse.json({ error: "Access code is required." }, { status: 400 });
      const profileId = session.isDemo
        ? redeemAccessCode(body.code, session.id, relationship)
        : await redeemPersistedAccessCode(body.code, session.id, relationship);
      if (session.isDemo) markSetupComplete(session.id);
      else await markPersistedSetupComplete(session.id);
      const code = session.isDemo
        ? getAccessCodeForProfile(profileId)
        : await getPersistedAccessCodeForProfile(profileId);
      return NextResponse.json({ profileId, code });
    }

    if (body.action === "create-profile") {
      if (!body.name || !body.ageGroup) {
        return NextResponse.json({ error: "Name and age group are required." }, { status: 400 });
      }

      const profile = await createPersistedChildProfile(session.id, session.role, {
        profileName: body.name,
        ageGroup: body.ageGroup,
        supportNotes: body.supportNotes ?? "",
        setupRole: session.role === "caregiver_therapist_teacher" ? "professional" : "family",
      });

      const code = session.isDemo
        ? generateAccessCode(profile.id, session.id)
        : await createPersistedAccessCode(profile.id, session.id);

      if (body.childLoginEmail && body.childLoginPassword && body.childLoginName) {
        const childUser = createChildLoginAccount({
          email: body.childLoginEmail,
          password: body.childLoginPassword,
          name: body.childLoginName,
          profileId: profile.id,
        });
        linkUserToProfile(childUser.id, profile.id, "self");
      }

      if (session.isDemo) markSetupComplete(session.id);
      else await markPersistedSetupComplete(session.id);

      return NextResponse.json({
        profile,
        accessCode: code,
        message: "Profile created. Share the access code with caregivers or your therapist.",
      });
    }

    if (body.action === "create-client") {
      if (session.role !== "caregiver_therapist_teacher") {
        return NextResponse.json({ error: "Only therapists can add clients this way." }, { status: 403 });
      }
      if (!body.name || !body.ageGroup) {
        return NextResponse.json({ error: "Client name and age group are required." }, { status: 400 });
      }

      const notes = [
        body.supportNotes ?? "",
        body.parentName ? `Parent/Caregiver: ${body.parentName}` : "",
        body.parentEmail ? `Parent email: ${body.parentEmail}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      const profile = await createPersistedChildProfile(session.id, session.role, {
        profileName: body.name,
        ageGroup: body.ageGroup,
        supportNotes: notes,
        setupRole: "professional",
      });

      linkUserToProfile(session.id, profile.id, "therapist");
      const code = generateAccessCode(profile.id, session.id);
      if (session.isDemo) markSetupComplete(session.id);
      else await markPersistedSetupComplete(session.id);

      return NextResponse.json({
        profile,
        accessCode: code,
        parentEmail: body.parentEmail ?? null,
        message: "Client added. Share the access code with the parent to link their account.",
      });
    }

    if (body.action === "add-child-login") {
      if (!body.profileId || !body.childLoginEmail || !body.childLoginPassword || !body.childLoginName) {
        return NextResponse.json({ error: "Profile ID, name, email, and password are required." }, { status: 400 });
      }
      const childUser = createChildLoginAccount({
        email: body.childLoginEmail,
        password: body.childLoginPassword,
        name: body.childLoginName,
        profileId: body.profileId,
      });
      linkUserToProfile(childUser.id, body.profileId, "self");
      return NextResponse.json({ ok: true, childUserId: childUser.id });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Request failed." },
      { status: 400 }
    );
  }
}
