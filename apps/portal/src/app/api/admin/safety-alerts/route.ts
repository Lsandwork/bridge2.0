import { NextResponse } from "next/server";
import { getAdminSafetyCenter } from "@family-support/data";
import { requireAdminSession } from "@/lib/auth/require-admin";

export async function GET(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const includeDemo = new URL(request.url).searchParams.get("includeDemo") === "true";
  return NextResponse.json(getAdminSafetyCenter({ includeDemo }));
}
