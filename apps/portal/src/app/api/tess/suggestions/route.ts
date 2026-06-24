import { NextRequest, NextResponse } from "next/server";
import {
  approveTessSuggestion,
  archiveTessSuggestion,
  createTessSuggestion,
  getTessSuggestions,
  rejectTessSuggestion,
} from "@family-support/data";
import { getTessSession } from "@/lib/tess/session";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status") ?? undefined;
  const childProfileId = req.nextUrl.searchParams.get("childProfileId") ?? undefined;
  const suggestions = getTessSuggestions({
    childProfileId,
    status: status as "pending" | undefined,
  });
  return NextResponse.json(suggestions);
}

export async function POST(req: NextRequest) {
  const session = getTessSession(req.headers);
  const body = await req.json();
  const { action } = body;

  if (action === "create") {
    const s = createTessSuggestion({
      childProfileId: body.childProfileId,
      createdByUserId: session.userId,
      conversationId: body.conversationId,
      suggestionType: body.suggestionType,
      title: body.title,
      reason: body.reason ?? "",
      suggestedPayload: body.suggestedPayload,
      riskLevel: body.riskLevel ?? "low",
    });
    return NextResponse.json(s);
  }

  if (action === "approve") {
    const s = approveTessSuggestion(body.id, session.userId, body.editedPayload);
    if (!s) return NextResponse.json({ error: "Not found or not pending" }, { status: 404 });
    return NextResponse.json(s);
  }

  if (action === "reject") {
    const s = rejectTessSuggestion(body.id, session.userId);
    if (!s) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(s);
  }

  if (action === "archive") {
    const s = archiveTessSuggestion(body.id, session.userId);
    if (!s) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(s);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
