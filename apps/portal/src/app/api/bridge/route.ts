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
  userCanAccessProfile,
} from "@family-support/data";
import { getSession } from "@/lib/auth/session";
import { safeAwardPetXp } from "@/lib/pets/server-awards";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const section = req.nextUrl.searchParams.get("section");
  const profileId = req.nextUrl.searchParams.get("profileId") ?? undefined;
  if (profileId && !(await userCanAccessProfile(session, profileId))) {
    return NextResponse.json({ error: "You do not have access to this profile." }, { status: 403 });
  }

  if (section === "care-team") {
    if (!profileId) {
      return NextResponse.json({ error: "profileId is required." }, { status: 400 });
    }
    return NextResponse.json(await getCareTeam(profileId));
  }
  if (section === "reports") return NextResponse.json(await getReports(profileId));
  if (section === "social-stories") return NextResponse.json(await getSocialStories(profileId));
  return NextResponse.json({ error: "Unknown section" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

    const body = await req.json();
    const { action } = body;
    const requestedProfileId = typeof body.childProfileId === "string"
      ? body.childProfileId
      : typeof body.profileId === "string"
        ? body.profileId
        : null;

    if (requestedProfileId && !(await userCanAccessProfile(session, requestedProfileId))) {
      return NextResponse.json({ error: "You do not have access to this profile." }, { status: 403 });
    }

    switch (action) {
      case "complete-task": {
        const task = completeLocalTask(body.taskId);
        const petXp = task
          ? await safeAwardPetXp(session, task.childProfileId, "routine_complete", { source: "complete-task", taskId: body.taskId })
          : null;
        return NextResponse.json(task ? { ...task, petXp } : { task: null, petXp });
      }
      case "check-in": {
        const checkIn = createLocalCheckIn(body);
        const petXp = await safeAwardPetXp(session, checkIn.childProfileId, "mood_check_in", { source: "check-in", mood: body.mood });
        return NextResponse.json({ ...checkIn, petXp });
      }
      case "create-goal": {
        const goal = createLocalGoal(body);
        return NextResponse.json(goal);
      }
      case "update-goal": {
        const goal = updateLocalGoalProgress(body.id, body.current);
        const petXp = goal && Number(goal.current) >= Number(goal.target)
          ? await safeAwardPetXp(session, goal.childProfileId, "goal_complete", { source: "update-goal", goalId: goal.id })
          : null;
        return NextResponse.json(goal ? { ...goal, petXp } : { goal: null, petXp });
      }
      case "create-routine": {
        const routine = createLocalRoutine(body);
        return NextResponse.json(routine);
      }
      case "add-care-team":
        return NextResponse.json(createLocalCareTeamMember(body));
      case "create-report":
        return NextResponse.json(createLocalReport(body));
      case "use-card": {
        const card = useCommunicationCard(body.cardId);
        const petXp = requestedProfileId
          ? await safeAwardPetXp(session, requestedProfileId, "communication_card", { source: "use-card", cardId: body.cardId })
          : null;
        return NextResponse.json(card ? { ...card, petXp } : { card: null, petXp });
      }
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
