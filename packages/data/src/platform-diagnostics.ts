import type { PaymentProcessorStatus } from "@family-support/core";
import { hasSupabaseAuth, hasSupabaseUrl } from "./supabase-server";
import { listDemoAuthUsers } from "./auth-store";
import { getAdminBridgeOverview } from "./bridge-store";
import { getErrorCountsBySeverity } from "./error-log-store";
import { getPlatformActivity } from "./safety-alert-store";
import { DEMO_ACCOUNT_EMAILS } from "./demo-accounts";

function envPresent(key: string): boolean {
  return Boolean(process.env[key]?.trim());
}

export function getPaymentProcessorStatuses(): PaymentProcessorStatus[] {
  const stripeSecret = envPresent("STRIPE_SECRET_KEY");
  const stripePublic = envPresent("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
  const stripeWebhook = envPresent("STRIPE_WEBHOOK_SECRET");

  const paypalId = envPresent("PAYPAL_CLIENT_ID");
  const paypalSecret = envPresent("PAYPAL_CLIENT_SECRET");

  const squareToken = envPresent("SQUARE_ACCESS_TOKEN");
  const squareLocation = envPresent("SQUARE_LOCATION_ID");

  return [
    {
      id: "stripe",
      label: "Stripe",
      configured: stripeSecret && stripePublic,
      environment: stripeSecret ? (process.env.STRIPE_SECRET_KEY?.includes("test") ? "test" : "live") : "unknown",
      publicKeyPresent: stripePublic,
      secretKeyPresent: stripeSecret,
      webhookConfigured: stripeWebhook,
      webhookHealthy: stripeWebhook ? null : null,
      lastWebhookAt: null,
      lastPaymentError: null,
      enabled: stripeSecret && stripePublic,
      notes: stripeSecret ? "Stripe keys detected." : "Add STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.",
    },
    {
      id: "paypal",
      label: "PayPal",
      configured: paypalId && paypalSecret,
      environment: (process.env.PAYPAL_ENV as "test" | "live") ?? "unknown",
      publicKeyPresent: paypalId,
      secretKeyPresent: paypalSecret,
      webhookConfigured: false,
      webhookHealthy: null,
      lastWebhookAt: null,
      lastPaymentError: null,
      enabled: paypalId && paypalSecret,
      notes: paypalId ? "PayPal credentials detected." : "Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.",
    },
    {
      id: "square",
      label: "Square",
      configured: squareToken && squareLocation,
      environment: (process.env.SQUARE_ENV as "test" | "live") ?? "unknown",
      publicKeyPresent: false,
      secretKeyPresent: squareToken,
      webhookConfigured: false,
      webhookHealthy: null,
      lastWebhookAt: null,
      lastPaymentError: null,
      enabled: squareToken && squareLocation,
      notes: squareToken ? "Square token detected." : "Add SQUARE_ACCESS_TOKEN and SQUARE_LOCATION_ID.",
    },
    {
      id: "venmo",
      label: "Venmo (via PayPal)",
      configured: paypalId && paypalSecret,
      environment: (process.env.PAYPAL_ENV as "test" | "live") ?? "unknown",
      publicKeyPresent: paypalId,
      secretKeyPresent: paypalSecret,
      webhookConfigured: false,
      webhookHealthy: null,
      lastWebhookAt: null,
      lastPaymentError: null,
      enabled: false,
      notes: "Venmo is typically enabled through PayPal/Braintree. Direct Venmo processing not configured.",
    },
  ];
}

export function getPlatformDiagnostics() {
  const bridge = getAdminBridgeOverview();
  const users = listDemoAuthUsers();
  const activity = getPlatformActivity({ limit: 10 });
  const errorCounts = getErrorCountsBySeverity();

  const envChecks = [
    { key: "NEXT_PUBLIC_SUPABASE_URL", label: "Supabase URL" },
    { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", label: "Supabase Anon Key" },
    { key: "SUPABASE_SERVICE_ROLE_KEY", label: "Supabase Service Role" },
    { key: "NEXT_PUBLIC_SITE_URL", label: "Site URL" },
    { key: "GEMINI_API_KEY", label: "Gemini API Key" },
    { key: "OPENAI_API_KEY", label: "OpenAI API Key" },
    { key: "VIDEO_SESSION_SECRET", label: "Video Session Secret" },
    { key: "YOUTUBE_API_KEY", label: "YouTube API Key" },
    { key: "STRIPE_SECRET_KEY", label: "Stripe Secret" },
    { key: "PAYPAL_CLIENT_SECRET", label: "PayPal Secret" },
  ].map((e) => ({
    key: e.key,
    label: e.label,
    status: envPresent(e.key) ? ("configured" as const) : ("missing" as const),
  }));

  return {
    generatedAt: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? "development",
    vercel: envPresent("VERCEL") ? "detected" : "not_detected",
    supabase: {
      url: hasSupabaseUrl ? "configured" : "missing",
      auth: hasSupabaseAuth ? "configured" : "missing",
      connection: hasSupabaseUrl ? "ready" : "demo_mode",
    },
    ai: {
      provider: process.env.AI_PROVIDER ?? "gemini",
      gemini: envPresent("GEMINI_API_KEY") ? "configured" : "missing",
      openai: envPresent("OPENAI_API_KEY") ? "configured" : "missing",
      voice: envPresent("OPENAI_API_KEY") ? "configured" : "not_configured",
      stt: envPresent("OPENAI_API_KEY") ? "configured" : "not_configured",
    },
    email: envPresent("SMTP_HOST") || envPresent("RESEND_API_KEY") ? "configured" : "not_configured",
    envChecks,
    counts: {
      users: users.length,
      bridgeGroups: bridge.totalGroups,
      activeBridgeGroups: bridge.activeGroups,
      messages: activity.filter((a) => a.eventType === "message_sent").length,
      safetyAlerts: activity.filter((a) => a.eventType === "safety_alert_created").length,
      openErrors: Object.values(errorCounts).reduce((a, b) => a + b, 0),
    },
    errorCounts,
    demoIsolation: {
      demoAccountEmails: [...DEMO_ACCOUNT_EMAILS],
      status: "isolated",
      legacyDemoIds: ["cp1", "cp2", "u-parent", "u-child", "u-therapist"],
    },
    paymentProcessors: getPaymentProcessorStatuses(),
    recentActivity: activity,
    build: {
      nodeEnv: process.env.NODE_ENV ?? "development",
      vercelGitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
      vercelEnv: process.env.VERCEL_ENV ?? null,
    },
  };
}

export function getAdminPlatformOverview() {
  const bridge = getAdminBridgeOverview();
  const diagnostics = getPlatformDiagnostics();
  return {
    bridge,
    diagnostics,
    stats: {
      totalUsers: listDemoAuthUsers().length,
      activeUsers: listDemoAuthUsers().length,
      openSafetyAlerts: diagnostics.counts.safetyAlerts,
      unreadErrors: diagnostics.counts.openErrors,
    },
  };
}
