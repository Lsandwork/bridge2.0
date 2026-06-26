import { NextResponse } from "next/server";
import {
  getConversationMessages,
  getMessageableMembers,
  getUnreadMessageCount,
  listConversationsForUser,
  markConversationRead,
  redeemBridgeAccessCode,
  sendBridgeMessage,
} from "@family-support/data";
import { getSession } from "@/lib/auth/session";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view") ?? "conversations";

  if (view === "unread-count") {
    return NextResponse.json({ count: getUnreadMessageCount(session.id) });
  }

  if (view === "messages") {
    const conversationId = searchParams.get("conversationId");
    if (!conversationId) return NextResponse.json({ error: "conversationId required" }, { status: 400 });
    return NextResponse.json({ messages: getConversationMessages(conversationId, session.id) });
  }

  if (view === "members") {
    const bridgeGroupId = searchParams.get("bridgeGroupId");
    if (!bridgeGroupId) return NextResponse.json({ error: "bridgeGroupId required" }, { status: 400 });
    return NextResponse.json({ members: getMessageableMembers(session.id, bridgeGroupId) });
  }

  const q = searchParams.get("q") ?? undefined;
  return NextResponse.json({ conversations: listConversationsForUser(session.id, q) });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { action } = body as { action?: string };

  if (action === "redeem-code") {
    const result = redeemBridgeAccessCode(body.code, session.id);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json(result);
  }

  if (action === "mark-read") {
    markConversationRead(body.conversationId, session.id);
    return NextResponse.json({ ok: true });
  }

  const result = sendBridgeMessage({
    conversationId: body.conversationId,
    bridgeGroupId: body.bridgeGroupId,
    senderId: session.id,
    recipientId: body.recipientId,
    body: body.body,
    urgency: body.urgency,
    subject: body.subject,
  });

  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result);
}
