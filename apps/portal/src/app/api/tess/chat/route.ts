import { NextRequest, NextResponse } from "next/server";
import {
  checkTessSafety,
  extractLocation,
  extractUserNeeds,
  isRecommendationRequest,
  TESS_CRISIS_RESPONSE,
  TESS_SAFETY_FALLBACK,
} from "@family-support/core";
import {
  addTessMessage,
  createTessConversation,
  createTessSafetyFlag,
  createTessSuggestion,
  getTessConversation,
  logTessUsage,
} from "@family-support/data";
import { getAIProvider } from "@/lib/ai";
import { buildTessChatContext, getTessSession } from "@/lib/tess/session";
import { buildRecommendationContextBlock, searchRecommendations } from "@/lib/tess/recommendations";

export async function POST(req: NextRequest) {
  const start = Date.now();
  try {
    const session = getTessSession(req.headers);
    const body = await req.json();
    const {
      message,
      conversationId,
      mode = "text",
      childProfileId = session.childProfileId,
      createSuggestion,
    } = body as {
      message: string;
      conversationId?: string;
      mode?: string;
      childProfileId?: string;
      createSuggestion?: { type: string; title: string; payload: Record<string, unknown> };
    };

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const safety = checkTessSafety(message);
    let conv = conversationId ? getTessConversation(conversationId) : null;
    if (!conv) {
      conv = createTessConversation({
        userId: session.userId,
        role: session.role,
        childProfileId,
        mode: mode as "text",
        title: message.slice(0, 60),
      });
    }

    addTessMessage({
      conversationId: conv.id,
      userId: session.userId,
      role: "user",
      content: message,
      tokensInput: 0,
      tokensOutput: 0,
      safetyStatus: safety.flagged ? safety.riskLevel : "safe",
      transcript: message,
    });

    if (safety.flagged && (safety.riskLevel === "urgent" || safety.riskLevel === "high")) {
      createTessSafetyFlag({
        conversationId: conv.id,
        userId: session.userId,
        childProfileId,
        flagType: safety.flagType ?? "safety",
        riskLevel: safety.riskLevel,
        description: safety.description ?? "Safety concern",
      });
      const crisisMsg = addTessMessage({
        conversationId: conv.id,
        role: "assistant",
        content: TESS_CRISIS_RESPONSE,
        tokensInput: 0,
        tokensOutput: 0,
        safetyStatus: safety.riskLevel,
      });
      return NextResponse.json({
        conversationId: conv.id,
        message: crisisMsg,
        safety,
        suggestedActions: [{ type: "emergency_card", label: "Open emergency card" }],
      });
    }

    const { systemPrompt, history } = buildTessChatContext(
      { ...session, childProfileId },
      conv.id,
      mode
    );

    let recommendationContext = "";
    let recommendationPayload: Awaited<ReturnType<typeof searchRecommendations>> | null = null;

    if (isRecommendationRequest(message)) {
      const location = extractLocation(message);
      const userNeeds = extractUserNeeds(message);
      recommendationPayload = await searchRecommendations({
        query: message,
        location,
        userNeeds,
      });
      recommendationContext = buildRecommendationContextBlock(recommendationPayload);
      if (!location && /\bnear me\b|\bnearby\b|\baround me\b/i.test(message)) {
        recommendationContext += `\n\nNote: User asked for "near me" but no location was provided. Ask which city or ZIP they are in, AND still provide the fallback search guidance so they are not left without help.`;
      }
    }

    const fullSystemPrompt = recommendationContext
      ? `${systemPrompt}\n\n---\n${recommendationContext}`
      : systemPrompt;

    const provider = getAIProvider();
    let result;
    try {
      result = await provider.chat({
        systemPrompt: fullSystemPrompt,
        messages: [...history, { role: "user", content: message }],
      });
    } catch (aiError) {
      logTessUsage({
        userId: session.userId,
        childProfileId,
        provider: provider.name,
        requestType: "chat",
        tokensInput: 0,
        tokensOutput: 0,
        estimatedCost: 0,
        latencyMs: Date.now() - start,
        success: false,
        errorMessage: aiError instanceof Error ? aiError.message : "AI failed",
      });
      const fallback = addTessMessage({
        conversationId: conv.id,
        role: "assistant",
        content: TESS_SAFETY_FALLBACK,
        tokensInput: 0,
        tokensOutput: 0,
        safetyStatus: "safe",
      });
      return NextResponse.json({
        conversationId: conv.id,
        message: fallback,
        error: aiError instanceof Error ? aiError.message : "AI unavailable",
        fallback: true,
      });
    }

    const assistantMsg = addTessMessage({
      conversationId: conv.id,
      role: "assistant",
      content: result.content,
      tokensInput: result.tokensInput,
      tokensOutput: result.tokensOutput,
      model: result.model,
      provider: result.provider,
      safetyStatus: "safe",
    });

    logTessUsage({
      userId: session.userId,
      childProfileId,
      provider: result.provider,
      model: result.model,
      requestType: "chat",
      tokensInput: result.tokensInput,
      tokensOutput: result.tokensOutput,
      estimatedCost: (result.tokensInput + result.tokensOutput) * 0.000002,
      latencyMs: Date.now() - start,
      success: true,
    });

    let suggestion = null;
    if (createSuggestion) {
      suggestion = createTessSuggestion({
        childProfileId,
        createdByUserId: session.userId,
        conversationId: conv.id,
        suggestionType: createSuggestion.type as "routine",
        title: createSuggestion.title,
        reason: "Created from Tess chat",
        suggestedPayload: createSuggestion.payload,
        riskLevel: "low",
      });
    }

    return NextResponse.json({
      conversationId: conv.id,
      message: assistantMsg,
      suggestion,
      provider: result.provider,
      model: result.model,
      recommendations: recommendationPayload?.items ?? undefined,
      recommendationMeta: recommendationPayload
        ? {
            sourcesUsed: recommendationPayload.sourcesUsed,
            searchedAt: recommendationPayload.searchedAt,
            isFallback: recommendationPayload.isFallback,
            locationUsed: recommendationPayload.locationUsed,
            queryUsed: recommendationPayload.queryUsed,
          }
        : undefined,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Chat failed" },
      { status: 500 }
    );
  }
}
