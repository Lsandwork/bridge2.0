import { NextResponse } from "next/server";
import { getAiSuggestions, reviewAiSuggestion } from "@family-support/data";

export async function GET() {
  try {
    const data = await getAiSuggestions();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to load AI suggestions" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    if (!body.id || !["approved", "rejected"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid review payload." }, { status: 400 });
    }
    const updated = await reviewAiSuggestion(body.id, body.status);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to review suggestion" },
      { status: 500 }
    );
  }
}
