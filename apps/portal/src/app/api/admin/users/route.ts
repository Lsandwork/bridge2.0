import { NextResponse } from "next/server";
import { getAdminNewSignups, searchAdminUsers } from "@family-support/data";
import { requireAdminSession } from "@/lib/auth/require-admin";

export async function GET(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view") ?? "signups";
  const includeDemo = searchParams.get("includeDemo") === "true";

  if (view === "all") {
    return NextResponse.json(
      searchAdminUsers({
        email: searchParams.get("email") ?? undefined,
        role: searchParams.get("role") ?? undefined,
        status: searchParams.get("status") ?? undefined,
      })
    );
  }

  return NextResponse.json(getAdminNewSignups({ includeDemo }));
}
