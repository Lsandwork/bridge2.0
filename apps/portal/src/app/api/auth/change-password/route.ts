import { NextResponse } from "next/server";
import { changeDemoUserPassword, logUserActivity } from "@family-support/data";
import { getSession, homePathForRole, setSessionCookie } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }

    const body = (await request.json()) as {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    };

    const currentPassword = body.currentPassword ?? "";
    const newPassword = body.newPassword ?? "";
    const confirmPassword = body.confirmPassword ?? "";

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: "All password fields are required." }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "New passwords do not match." }, { status: 400 });
    }

    const user = changeDemoUserPassword(session.email, currentPassword, newPassword);
    logUserActivity(user.id, user.email, "password_change");
    const response = NextResponse.json({
      user,
      redirectTo: homePathForRole(user.role),
    });
    setSessionCookie(response, user);
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update password." },
      { status: 400 }
    );
  }
}
