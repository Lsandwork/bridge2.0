import type { AppRole } from "@family-support/core";
import { createSupabaseAdminClient } from "./supabase-server";

export type AnalyticsEventInput = {
  eventName: "page_view";
  path: string;
  role?: AppRole | null;
  userId?: string | null;
  referrerHost?: string | null;
  viewport?: "mobile" | "tablet" | "desktop" | "unknown";
};

export async function recordAnalyticsEvent(input: AnalyticsEventInput): Promise<void> {
  const admin = createSupabaseAdminClient();
  if (!admin) return;

  const path = input.path.startsWith("/") ? input.path.slice(0, 500) : "/";
  const referrerHost = input.referrerHost?.slice(0, 255) ?? null;

  const { error } = await admin.from("analytics_events").insert({
    event_name: input.eventName,
    path,
    user_id: input.userId ?? null,
    role: input.role ?? null,
    referrer_host: referrerHost,
    viewport: input.viewport ?? "unknown",
  });

  if (error) {
    // Analytics must never break the product experience.
    console.warn("Bridge analytics event was not recorded:", error.message);
  }
}
