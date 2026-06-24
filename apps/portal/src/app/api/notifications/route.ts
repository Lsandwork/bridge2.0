import { NextResponse } from "next/server";
import {
  getNotificationsForUser,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@family-support/data";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  if (session.role === "child_user") {
    return NextResponse.json({ notifications: [], unread: 0 });
  }

  return NextResponse.json({
    notifications: getNotificationsForUser(session.id),
    unread: getUnreadNotificationCount(session.id),
  });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = (await request.json()) as { id?: string; all?: boolean };

  if (body.all) {
    const count = markAllNotificationsRead(session.id);
    return NextResponse.json({ ok: true, marked: count });
  }

  if (body.id) {
    const ok = markNotificationRead(body.id, session.id);
    return NextResponse.json({ ok });
  }

  return NextResponse.json({ error: "id or all required." }, { status: 400 });
}
