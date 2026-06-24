import { NextRequest, NextResponse } from "next/server";
import {
  completeLocalTask,
  createLocalCheckIn,
  createLocalGoal,
  createLocalRoutine,
  createLocalCareTeamMember,
  createLocalReport,
  getCareTeam,
  getReports,
  getSocialStories,
  updateLocalGoalProgress,
  useCommunicationCard,
} from "@family-support/data";

export async function GET(req: NextRequest) {
  const section = req.nextUrl.searchParams.get("section");
  const profileId = req.nextUrl.searchParams.get("profileId") ?? undefined;

  if (section === "care-team") return NextResponse.json(await getCareTeam());
  if (section === "reports") return NextResponse.json(await getReports(profileId));
  if (section === "social-stories") return NextResponse.json(await getSocialStories(profileId));
  return NextResponse.json({ error: "Unknown section" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "complete-task":
        return NextResponse.json(completeLocalTask(body.taskId));
      case "check-in":
        return NextResponse.json(createLocalCheckIn(body));
      case "create-goal":
        return NextResponse.json(createLocalGoal(body));
      case "update-goal":
        return NextResponse.json(updateLocalGoalProgress(body.id, body.current));
      case "create-routine":
        return NextResponse.json(createLocalRoutine(body));
      case "add-care-team":
        return NextResponse.json(createLocalCareTeamMember(body));
      case "create-report":
        return NextResponse.json(createLocalReport(body));
      case "use-card":
        return NextResponse.json(useCommunicationCard(body.cardId));
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Request failed" },
      { status: 500 }
    );
  }
}
