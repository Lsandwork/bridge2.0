import { NextRequest, NextResponse } from "next/server";
import {
  getTessAdminStats,
  getTessProviderConfig,
  getTessSafetyFlags,
  getTessUsageLogs,
  resolveTessSafetyFlag,
  updateTessProviderConfig,
  getTessPromptVersions,
} from "@family-support/data";

export async function GET(req: NextRequest) {
  const section = req.nextUrl.searchParams.get("section") ?? "stats";
  if (section === "stats") return NextResponse.json(getTessAdminStats());
  if (section === "logs") return NextResponse.json(getTessUsageLogs());
  if (section === "safety-flags") return NextResponse.json(getTessSafetyFlags());
  if (section === "provider") return NextResponse.json(getTessProviderConfig());
  if (section === "prompts") return NextResponse.json(getTessPromptVersions());
  return NextResponse.json({ error: "Unknown section" }, { status: 400 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  if (body.action === "resolve-flag") {
    return NextResponse.json(
      resolveTessSafetyFlag(body.id, "admin-1", body.adminNotes, body.escalate)
    );
  }
  if (body.action === "update-provider") {
    return NextResponse.json(updateTessProviderConfig(body.config));
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
