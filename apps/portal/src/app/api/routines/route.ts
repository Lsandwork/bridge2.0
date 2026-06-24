import { NextResponse } from "next/server";
import { getGoals, getRewards, getRoutines, getTasks } from "@family-support/data";

export async function GET() {
  try {
    const [routines, tasks, goals, rewards] = await Promise.all([
      getRoutines(),
      getTasks(),
      getGoals(),
      getRewards(),
    ]);
    return NextResponse.json({ routines, tasks, goals, rewards });
  } catch {
    return NextResponse.json({ error: "Failed to load routines data" }, { status: 500 });
  }
}
