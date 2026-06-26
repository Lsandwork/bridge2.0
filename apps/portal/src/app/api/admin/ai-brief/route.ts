import { NextResponse } from "next/server";
import { getAdminAiBrief } from "@family-support/data";
import { requireAdminSession } from "@/lib/auth/require-admin";

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;
  return NextResponse.json(await getAdminAiBrief());
}
