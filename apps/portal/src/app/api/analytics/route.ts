import { NextResponse } from "next/server";
import { recordAnalyticsEvent } from "@family-support/data";
import { getSession } from "@/lib/auth/session";

function safeReferrerHost(referrer: string | undefined): string | null {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname;
  } catch {
    return null;
  }
}

function viewportFromWidth(width: unknown) {
  if (typeof width !== "number" || !Number.isFinite(width)) return "unknown" as const;
  if (width < 640) return "mobile" as const;
  if (width < 1024) return "tablet" as const;
  return "desktop" as const;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      eventName?: string;
      path?: string;
      referrer?: string;
      width?: number;
    };

    if (body.eventName !== "page_view" || !body.path?.startsWith("/")) {
      return NextResponse.json({ ok: true });
    }

    const session = await getSession();
    await recordAnalyticsEvent({
      eventName: "page_view",
      path: body.path,
      userId: session?.id ?? null,
      role: session?.role ?? null,
      referrerHost: safeReferrerHost(body.referrer),
      viewport: viewportFromWidth(body.width),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
