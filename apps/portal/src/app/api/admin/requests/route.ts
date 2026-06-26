import { NextResponse } from "next/server";
import { listSupportRequests } from "@family-support/data";
import { requireAdminSession } from "@/lib/auth/require-admin";

export async function GET(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  return NextResponse.json(
    listSupportRequests({
      includeDemo: searchParams.get("includeDemo") === "true",
      status: (searchParams.get("status") as never) ?? undefined,
      priority: (searchParams.get("priority") as never) ?? undefined,
    })
  );
}
