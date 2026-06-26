import Link from "next/link";

const sections = [
  { href: "/admin/users", title: "User Accounts", detail: "Roles, passwords, suspension, credits" },
  { href: "/admin/pricing", title: "Pricing & Coverage", detail: "Family and payer plan prices shown on the public site" },
  { href: "/admin/credits", title: "Credits / Library", detail: "Library unlocks and course access per user" },
  { href: "/admin/payments", title: "Payment Processors", detail: "Stripe, PayPal, Square configuration status" },
  { href: "/admin/safety-alerts", title: "Safety Alerts", detail: "Review and resolve platform safety events" },
  { href: "/admin/messages", title: "Messages", detail: "Bridge group conversations across care teams" },
  { href: "/admin/bridge-groups", title: "Bridge Groups", detail: "Care circles, access codes, and membership" },
  { href: "/admin/activity", title: "User Activity", detail: "Sign-ins, admin actions, and audit trail" },
  { href: "/admin/error-logs", title: "Error Logs", detail: "Production errors and resolution notes" },
  { href: "/admin/diagnostics", title: "Diagnostics", detail: "Supabase, AI, and integration health" },
  { href: "/admin/demo-accounts", title: "Demo Accounts", detail: "Investor and presentation demo users" },
];

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Settings</h1>
        <p className="text-slate-600">
          Admin accounts manage the platform from the sections below. Environment secrets (API keys, SMTP) stay in
          Vercel and Supabase — not in this UI.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-indigo-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <h2 className="font-semibold text-slate-900 dark:text-white">{section.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{section.detail}</p>
          </Link>
        ))}
      </div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/50">
        <p className="font-medium text-slate-900 dark:text-white">Infrastructure</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Auth: Supabase Auth with role-based access</li>
          <li>AI: Nuvio / Tess routes (configure in Vercel env)</li>
          <li>Payments: Stripe, PayPal, Square via env vars</li>
          <li>Email: SMTP or Resend for notifications</li>
        </ul>
      </div>
    </div>
  );
}
