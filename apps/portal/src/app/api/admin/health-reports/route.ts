import { NextResponse } from "next/server";
import { listHealthReports } from "@family-support/data";
import { requireAdminSession } from "@/lib/auth/require-admin";

export async function GET(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  return NextResponse.json(
    listHealthReports({
      includeDemo: searchParams.get("includeDemo") === "true",
      status: (searchParams.get("status") as never) ?? undefined,
    })
  );
}
