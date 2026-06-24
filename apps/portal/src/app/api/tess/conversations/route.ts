import { NextRequest, NextResponse } from "next/server";
import { getTessConversations, getTessMessages } from "@family-support/data";
import { getTessSession } from "@/lib/tess/session";

export async function GET(req: NextRequest) {
  const session = getTessSession(req.headers);
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const messages = getTessMessages(id);
    return NextResponse.json({ messages, userId: session.userId });
  }
  const childProfileId = req.nextUrl.searchParams.get("childProfileId") ?? session.childProfileId;
  const conversations = getTessConversations({ userId: session.userId, childProfileId: childProfileId ?? undefined });
  return NextResponse.json(conversations);
}

export async function POST(req: NextRequest) {
  const session = getTessSession(req.headers);
  const { conversationId } = await req.json();
  if (!conversationId) return NextResponse.json({ error: "conversationId required" }, { status: 400 });
  const messages = getTessMessages(conversationId);
  return NextResponse.json({ messages, userId: session.userId });
}
