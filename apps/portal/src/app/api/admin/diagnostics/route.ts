import { NextResponse } from "next/server";
import {
  getPaymentProcessorStatuses,
  getPlatformDiagnostics,
  listErrorLogs,
  getPlatformActivity,
  getProductionActivity,
  listProductionErrorLogs,
} from "@family-support/data";
import { requireAdminSession } from "@/lib/auth/require-admin";

export async function GET(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const section = new URL(request.url).searchParams.get("section") ?? "diagnostics";

  switch (section) {
    case "payments":
      return NextResponse.json({ processors: getPaymentProcessorStatuses() });
    case "errors":
      return NextResponse.json(
        (await listProductionErrorLogs({
          limit: Number(new URL(request.url).searchParams.get("limit") ?? 50),
        }))?.items ??
          listErrorLogs({
            limit: Number(new URL(request.url).searchParams.get("limit") ?? 50),
          }).items
      );
    case "activity":
      return NextResponse.json(
        (await getProductionActivity({
          limit: Number(new URL(request.url).searchParams.get("limit") ?? 100),
          email: new URL(request.url).searchParams.get("email") ?? undefined,
          eventType: new URL(request.url).searchParams.get("eventType") ?? undefined,
        })) ??
          getPlatformActivity({
            limit: Number(new URL(request.url).searchParams.get("limit") ?? 100),
            email: new URL(request.url).searchParams.get("email") ?? undefined,
            eventType: new URL(request.url).searchParams.get("eventType") ?? undefined,
          })
      );
    default:
      return NextResponse.json(getPlatformDiagnostics());
  }
}
