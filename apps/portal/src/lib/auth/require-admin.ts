import { NextResponse } from "next/server";
import { isAdminRole } from "@family-support/data";
import { getSession, type SessionUser } from "./session";

export async function requireAdminSession(): Promise<
  { session: SessionUser; error: null } | { session: null; error: NextResponse }
> {
  const session = await getSession();
  if (!session || !isAdminRole(session.role)) {
    return {
      session: null,
      error: NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 }),
    };
  }
  return { session, error: null };
}

export function isSuperAdmin(role: string): boolean {
  return role === "super_admin";
}
