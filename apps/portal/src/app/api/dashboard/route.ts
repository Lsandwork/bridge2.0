import { NextRequest, NextResponse } from "next/server";
import { getDashboardSnapshot } from "@family-support/data";

export async function GET(req: NextRequest) {
  try {
    const profileId = req.nextUrl.searchParams.get("profileId") ?? "cp1";
    const data = await getDashboardSnapshot(profileId);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load dashboard" },
      { status: 500 }
    );
  }
}
