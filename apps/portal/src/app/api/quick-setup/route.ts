import { NextResponse } from "next/server";
import { getQuickSetupStatus, recordQuickSetupEvent, userCanAccessProfile, type QuickSetupEventType } from "@family-support/data";
import { getSession } from "@/lib/auth/session";

const allowedActions = new Set([
  "quick_setup_incomplete",
  "quick_setup_skipped",
  "quick_setup_remind_later",
  "quick_setup_started",
  "quick_setup_completed",
]);

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get("profileId");
  if (profileId && !(await userCanAccessProfile(session, profileId))) {
    return NextResponse.json({ error: "You do not have access to this profile." }, { status: 403 });
  }

  const status = await getQuickSetupStatus(session.id, profileId);
  return NextResponse.json({ status });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if (session.isDemo) return NextResponse.json({ ok: true, demo: true });

  const body = (await request.json()) as {
    action?: string;
    profileId?: string;
    childName?: string;
    reason?: string;
    checklist?: Record<string, boolean>;
  };

  if (!body.action || !allowedActions.has(body.action)) {
    return NextResponse.json({ error: "Unknown quick setup action." }, { status: 400 });
  }

  if (body.profileId && !(await userCanAccessProfile(session, body.profileId))) {
    return NextResponse.json({ error: "You do not have access to this profile." }, { status: 403 });
  }

  await recordQuickSetupEvent({
    userId: session.id,
    email: session.email,
    role: session.role,
    eventType: body.action as QuickSetupEventType,
    detail: body.reason ?? body.action.replaceAll("_", " "),
    profileId: body.profileId ?? null,
    childName: body.childName ?? null,
    metadata: {
      checklist: body.checklist ?? {},
      source: "dashboard_quick_setup",
    },
  });

  return NextResponse.json({ ok: true });
}
