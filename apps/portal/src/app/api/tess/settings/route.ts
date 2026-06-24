import { NextRequest, NextResponse } from "next/server";
import { getTessSettings, updateTessSettings } from "@family-support/data";
import { getTessSession } from "@/lib/tess/session";

export async function GET(req: NextRequest) {
  const session = getTessSession(req.headers);
  const childProfileId = req.nextUrl.searchParams.get("childProfileId") ?? session.childProfileId;
  const settings = getTessSettings({ childProfileId: childProfileId ?? undefined, userId: session.userId });
  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  const session = getTessSession(req.headers);
  const body = await req.json();
  const childProfileId = body.childProfileId ?? session.childProfileId;
  const settings = updateTessSettings(
    { userId: session.userId, childProfileId },
    body
  );
  return NextResponse.json(settings);
}
