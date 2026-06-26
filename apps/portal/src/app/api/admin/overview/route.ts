import { NextResponse } from "next/server";
import { getAdminCommandOverview } from "@family-support/data";
import { requireAdminSession } from "@/lib/auth/require-admin";

export async function GET(request: Request) {
  const { session, error } = await requireAdminSession();
  if (error || !session) return error!;

  const { searchParams } = new URL(request.url);
  const includeDemo = searchParams.get("includeDemo") === "true";
  const overview = await getAdminCommandOverview({ includeDemo });

  return NextResponse.json({
    ...overview,
    admin: { name: session.name, email: session.email, role: session.role },
  });
}
