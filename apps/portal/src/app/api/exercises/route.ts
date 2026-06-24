import { NextResponse } from "next/server";
import { createLocalExercise, getExercises } from "@family-support/data";

export async function GET() {
  try {
    const data = await getExercises();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to load exercises" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title || !body.goal || !Array.isArray(body.steps) || body.steps.length === 0) {
      return NextResponse.json({ error: "Title, goal, and steps are required." }, { status: 400 });
    }
    const exercise = createLocalExercise({
      childProfileId: body.childProfileId ?? "cp1",
      title: body.title,
      category: body.category ?? "life_skill",
      goal: body.goal,
      steps: body.steps,
      promptLevel: body.promptLevel ?? "Least-to-most",
      timerMinutes: Number(body.timerMinutes) || 10,
      difficulty: body.difficulty ?? "moderate",
      frequency: body.frequency ?? "daily",
      rewardIdea: body.rewardIdea ?? "Preferred activity",
    });
    return NextResponse.json(exercise, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create exercise" },
      { status: 500 }
    );
  }
}
