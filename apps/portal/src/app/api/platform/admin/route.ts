import { NextResponse } from "next/server";
import { getAdminSection, isAdminRole } from "@family-support/data";
import { getSession } from "@/lib/auth/session";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || !isAdminRole(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section") ?? "overview";
  const data = getAdminSection(section, searchParams);
  if (data === null) {
    return NextResponse.json({ error: "Unknown section" }, { status: 400 });
  }
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !isAdminRole(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { action } = body as { action?: string };

  try {
    const {
      adminTriggerPasswordReset,
      adminSetCredits,
      reassignUserRole,
      setUserStatus,
      createBridgeAccessCode,
      revokeBridgeAccessCode,
      removeBridgeGroupMember,
      updateErrorLog,
      updateSafetyAlertStatus,
    } = await import("@family-support/data");

    switch (action) {
      case "reset-password":
        return NextResponse.json(
          adminTriggerPasswordReset(body.userId, session.email)
        );
      case "set-credits":
        return NextResponse.json({
          ok: true,
          account: adminSetCredits(body.userId, body.balance, session.email, body.note),
        });
      case "reassign-role":
        return NextResponse.json({
          ok: true,
          user: reassignUserRole(body.userId, body.role, session.email),
        });
      case "set-status":
        return NextResponse.json({
          ok: true,
          user: setUserStatus(body.userId, body.status, session.email),
        });
      case "create-access-code":
        return NextResponse.json({
          ok: true,
          code: createBridgeAccessCode({
            bridgeGroupId: body.bridgeGroupId,
            memberRole: body.memberRole,
            createdBy: session.id,
            expiresInDays: body.expiresInDays,
          }),
        });
      case "revoke-access-code":
        return NextResponse.json({ ok: true, code: revokeBridgeAccessCode(body.codeId) });
      case "remove-bridge-member":
        return NextResponse.json({
          ok: removeBridgeGroupMember(body.bridgeGroupId, body.userId),
        });
      case "resolve-error":
        return NextResponse.json({
          ok: true,
          entry: updateErrorLog(body.errorId, { status: body.status, notes: body.notes }),
        });
      case "update-safety-alert":
        return NextResponse.json({
          ok: true,
          alert: updateSafetyAlertStatus(body.alertId, body.status, session.id, body.note),
        });
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Action failed" },
      { status: 400 }
    );
  }
}
