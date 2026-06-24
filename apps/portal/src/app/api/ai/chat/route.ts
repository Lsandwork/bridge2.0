import { NextRequest, NextResponse } from "next/server";
import { geminiChat, geminiQuickAction } from "@/lib/gemini";
import { createLocalAiSuggestion, getChildProfiles } from "@family-support/data";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, action, profileId, prompt } = body as {
      message?: string;
      action?: "routine" | "social-story" | "exercise" | "reward" | "summary";
      profileId?: string;
      prompt?: string;
    };

    const profiles = await getChildProfiles();
    const profile = profiles.find((p) => p.id === (profileId ?? "cp1"));
    const context = profile
      ? { childName: profile.name, ageGroup: profile.ageGroup, supportNotes: profile.supportNotes }
      : undefined;

    let text: string;
    if (action && prompt) {
      text = await geminiQuickAction(action, prompt, context);
    } else if (message) {
      text = await geminiChat(message, context);
    } else {
      return NextResponse.json({ error: "message or action+prompt required" }, { status: 400 });
    }

    const suggestion = createLocalAiSuggestion({
      childProfileId: profileId ?? "cp1",
      type: action ? `AI ${action}` : "AI assistant",
      details: text,
    });

    return NextResponse.json({ text, suggestionId: suggestion.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI request failed" },
      { status: 500 }
    );
  }
}
