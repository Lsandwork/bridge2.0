import { NextRequest, NextResponse } from "next/server";
import { createTessSafetyFlag } from "@family-support/data";
import { getTessSession } from "@/lib/tess/session";

export async function POST(req: NextRequest) {
  const session = getTessSession(req.headers);
  const body = await req.json();
  const flag = createTessSafetyFlag({
    conversationId: body.conversationId,
    messageId: body.messageId,
    userId: session.userId,
    childProfileId: body.childProfileId,
    flagType: body.flagType ?? "user_report",
    riskLevel: body.riskLevel ?? "medium",
    description: body.description ?? "User flagged conversation",
  });
  return NextResponse.json(flag);
}
