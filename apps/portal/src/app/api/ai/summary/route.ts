import { NextRequest, NextResponse } from "next/server";
import { geminiWeeklySummary } from "@/lib/gemini";
import {
  createLocalReport,
  getDashboardSnapshot,
  resolveChildProfilesForSession,
  userCanAccessProfile,
} from "@family-support/data";
import { getSession } from "@/lib/auth/session";

function publicAiError(error: unknown): string {
  const msg = error instanceof Error ? error.message : "Summary generation failed";
  if (/GEMINI|OPENAI|API_KEY|\.env|GoogleGenerativeAI/i.test(msg)) {
    return "Nuvio is temporarily unavailable. Please try again later.";
  }
  return msg;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const { profileId, save = false } = await req.json();
    if (!profileId || !(await userCanAccessProfile(session, profileId))) {
      return NextResponse.json({ error: "Profile not found." }, { status: 403 });
    }

    const profiles = await resolveChildProfilesForSession(session);
    const profile = profiles.find((p) => p.id === profileId);
    const snapshot = await getDashboardSnapshot(profileId, {
      childName: profile?.name,
      allowEmpty: true,
      authUserId: session.id,
    });

    const text = await geminiWeeklySummary({
      childName: profile?.name ?? "Child",
      tasksCompleted: Math.round((snapshot.tasksCompletedPct / 100) * 7),
      tasksTotal: 7,
      routinesCompleted: Math.round((snapshot.routinesCompletedPct / 100) * 7),
      routinesTotal: 7,
      checkIns: snapshot.checkInsCount,
      topEmotions: snapshot.emotionBreakdown.map((e) => ({ label: e.label, count: e.count })),
      recentNotes: profile?.supportNotes,
    });

    let reportId: string | undefined;
    if (save) {
      const report = createLocalReport({
        childProfileId: profileId,
        title: `Nuvio Weekly Summary — ${profile?.name ?? "Child"}`,
        body: text,
        periodStart: new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10),
        periodEnd: new Date().toISOString().slice(0, 10),
      });
      reportId = report.id;
    }

    return NextResponse.json({ text, reportId });
  } catch (error) {
    return NextResponse.json(
      { error: publicAiError(error) },
      { status: 500 }
    );
  }
}
