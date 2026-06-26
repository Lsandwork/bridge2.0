import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  changeDemoUserPassword,
  logUserActivity,
  supabaseChangePassword,
} from "@family-support/data";
import {
  SUPABASE_ACCESS_COOKIE,
  bridgeAuthUserToSessionUser,
  getSession,
  homePathForRole,
  setAuthSession,
} from "@/lib/auth/session";

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

    let user;
    if (session.isDemo) {
      user = changeDemoUserPassword(session.email, currentPassword, newPassword);
    } else {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get(SUPABASE_ACCESS_COOKIE)?.value;
      if (!accessToken) {
        return NextResponse.json({ error: "Session expired. Sign in again." }, { status: 401 });
      }
      await supabaseChangePassword({
        accessToken,
        authUserId: session.id,
        email: session.email,
        currentPassword,
        newPassword,
      });
      user = {
        ...session,
        mustChangePassword: false,
      };
    }

    logUserActivity(user.id, user.email, "password_change");
    const sessionUser = bridgeAuthUserToSessionUser({
      ...user,
      isDemo: session.isDemo ?? false,
    });
    const response = NextResponse.json({
      user: sessionUser,
      redirectTo: homePathForRole(user.role),
    });
    setAuthSession(response, sessionUser);
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update password." },
      { status: 400 }
    );
  }
}
