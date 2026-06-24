import { NextRequest, NextResponse } from "next/server";
import { geminiWeeklySummary } from "@/lib/gemini";
import { createLocalReport, getDashboardSnapshot, getChildProfiles } from "@family-support/data";

function publicAiError(error: unknown): string {
  const msg = error instanceof Error ? error.message : "Summary generation failed";
  if (/GEMINI|OPENAI|API_KEY|\.env|GoogleGenerativeAI/i.test(msg)) {
    return "Tess AI is temporarily unavailable. Please try again later.";
  }
  return msg;
}

export async function POST(req: NextRequest) {
  try {
    const { profileId = "cp1", save = false } = await req.json();
    const snapshot = await getDashboardSnapshot(profileId);
    const profiles = await getChildProfiles();
    const profile = profiles.find((p) => p.id === profileId);

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
        title: `Tess AI Weekly Summary — ${profile?.name ?? "Child"}`,
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
