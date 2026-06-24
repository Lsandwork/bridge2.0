import { NextResponse } from "next/server";
import {
  adminAddLibraryCredits,
  adminGrantCourseAccess,
  adminRevokeCourseAccess,
  adminSetAccessPlan,
  adminResetUserPassword,
  adminSetUserPassword,
  getAdminAnalytics,
  getAdminDiagnostics,
  getAdminStats,
  getAiSuggestions,
  getCourseAccessForUser,
  getLibraryCourses,
  getParentLibrary,
  getRecentUserActivity,
  getSiteIssues,
  getSubscriptions,
  getSupportTickets,
  getUsers,
  listDemoAuthUsers,
  logUserActivity,
  getVideoActivity,
  resolveSiteIssue,
  type AccessPlan,
  type CourseAccessTier,
} from "@family-support/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section") ?? "stats";
  const userId = searchParams.get("userId") ?? undefined;

  try {
    switch (section) {
      case "stats":
        return NextResponse.json(await getAdminStats());
      case "users":
        return NextResponse.json(await getUsers());
      case "library":
        return NextResponse.json(await getParentLibrary());
      case "ai":
        return NextResponse.json(await getAiSuggestions());
      case "subscriptions":
        return NextResponse.json(await getSubscriptions());
      case "support":
        return NextResponse.json(await getSupportTickets());
      case "diagnostics":
        return NextResponse.json(getAdminDiagnostics());
      case "analytics":
        return NextResponse.json(getAdminAnalytics());
      case "site-issues":
        return NextResponse.json(getSiteIssues(true));
      case "courses":
        return NextResponse.json(getLibraryCourses());
      case "course-access": {
        const uid = searchParams.get("userId");
        if (!uid) return NextResponse.json({ error: "userId required" }, { status: 400 });
        return NextResponse.json(getCourseAccessForUser(uid));
      }
      case "auth-users":
        return NextResponse.json(listDemoAuthUsers());
      case "video-activity":
        return NextResponse.json({ activity: getVideoActivity(150) });
      case "activity":
        return NextResponse.json(getRecentUserActivity(100, userId));
      default:
        return NextResponse.json({ error: "Unknown section" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Failed to load admin data" }, { status: 500 });
  }
}

type AdminActionBody = {
  action?: string;
  userId?: string;
  password?: string;
  mustChangePassword?: boolean;
  amount?: number;
  note?: string;
  plan?: AccessPlan;
  courseSlug?: string;
  courseTier?: CourseAccessTier;
  issueId?: string;
  actorEmail?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AdminActionBody;
    const { action, userId } = body;

    if (!action) {
      return NextResponse.json({ error: "action is required." }, { status: 400 });
    }

    const actor = body.actorEmail ?? "admin";

    switch (action) {
      case "resolve-issue": {
        if (!body.issueId) {
          return NextResponse.json({ error: "issueId is required." }, { status: 400 });
        }
        const issue = resolveSiteIssue(body.issueId);
        if (!issue) return NextResponse.json({ error: "Issue not found." }, { status: 404 });
        logUserActivity("u-admin", actor, "admin_resolve_issue", body.issueId);
        return NextResponse.json({ ok: true, issue });
      }
      default:
        break;
    }

    if (!userId) {
      return NextResponse.json({ error: "userId is required for this action." }, { status: 400 });
    }

    switch (action) {
      case "grant-course": {
        if (!body.courseSlug || !body.courseTier) {
          return NextResponse.json({ error: "courseSlug and courseTier are required." }, { status: 400 });
        }
        const grant = adminGrantCourseAccess(userId, body.courseSlug, body.courseTier, { grantedBy: actor });
        return NextResponse.json({ ok: true, grant });
      }
      case "revoke-course": {
        if (!body.courseSlug) {
          return NextResponse.json({ error: "courseSlug is required." }, { status: 400 });
        }
        const grants = adminRevokeCourseAccess(userId, body.courseSlug);
        return NextResponse.json({ ok: true, grants });
      }
      case "reset-password": {
        const result = adminResetUserPassword(userId);
        logUserActivity(userId, result.user.email, "admin_reset_password", `Reset by ${actor}`);
        return NextResponse.json({
          ok: true,
          tempPassword: result.tempPassword,
          user: result.user,
        });
      }
      case "set-password": {
        if (!body.password) {
          return NextResponse.json({ error: "password is required." }, { status: 400 });
        }
        const user = adminSetUserPassword(userId, body.password, body.mustChangePassword ?? false);
        logUserActivity(userId, user.email, "admin_set_password", `Updated by ${actor}`);
        return NextResponse.json({ ok: true, user });
      }
      case "add-credits": {
        const amount = body.amount ?? 0;
        const account = adminAddLibraryCredits(userId, amount, body.note ?? `Added by ${actor}`);
        return NextResponse.json({ ok: true, account });
      }
      case "set-access": {
        const plan = body.plan;
        if (!plan || !["free", "monthly", "annual"].includes(plan)) {
          return NextResponse.json({ error: "plan must be free, monthly, or annual." }, { status: 400 });
        }
        const account = adminSetAccessPlan(userId, plan);
        return NextResponse.json({ ok: true, account });
      }
      default:
        return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Action failed." },
      { status: 400 }
    );
  }
}
