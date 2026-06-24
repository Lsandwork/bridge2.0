import { NextResponse } from "next/server";
import { getCheckIns, getGoals, getTasks } from "@family-support/data";

export async function GET() {
  try {
    const [tasks, checkIns, goals] = await Promise.all([getTasks(), getCheckIns(), getGoals()]);
    return NextResponse.json({ tasks, checkIns, goals });
  } catch {
    return NextResponse.json({ error: "Failed to load progress data" }, { status: 500 });
  }
}
