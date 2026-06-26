"use client";

import { useState } from "react";
import { KpiCard, AdminEmptyState, AdminErrorState, AdminLoadingState } from "@/components/admin/AdminUi";
import { useAdminFetch } from "@/hooks/useAdminFetch";

type Overview = {
  environment: string;
  generatedAt: string;
  systemStatus: "healthy" | "warning" | "critical";
  kpis: {
    totalUsers: number;
    newUsersToday: number;
    newUsersThisWeek: number;
    activeUsersToday: number;
    activeUsersThisWeek: number;
    newProfilesCreated: number;
    pendingApprovals: number;
    quickSetupIncomplete: number;
    paymentsToday: number;
    paymentsThisMonth: number;
    failedPayments: number;
    openSupportRequests: number;
    urgentSafetyAlerts: number;
    possibleEmergencies: number;
    platformHealthScore: number;
  };
  recentActivity: Array<{ eventType: string; email: string | null; detail: string | null; createdAt: string }>;
  criticalAlerts: Array<{
    id: string;
    userName: string;
    severity: string;
    concernCategory: string;
    status: string;
    aiSummary: string | null;
  }>;
  admin: { name: string; email: string; role: string };
};

type Brief = { brief: string; disclaimer: string; bullets: string[] };

export default function AdminOverviewPage() {
  const [includeDemo, setIncludeDemo] = useState(false);
  const { data, loading, error, reload } = useAdminFetch<Overview>(
    `/api/admin/overview?includeDemo=${includeDemo}`,
    [includeDemo]
  );
  const { data: brief } = useAdminFetch<Brief>("/api/admin/ai-brief");

  if (loading) return <AdminLoadingState />;
  if (error || !data) return <AdminErrorState message={error ?? "Could not load overview"} onRetry={reload} />;

  const k = data.kpis;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Command Center Overview</h1>
          <p className="mt-1 text-slate-600">
            {data.admin.name} · {data.admin.email} · {data.environment} · Updated{" "}
            {new Date(data.generatedAt).toLocaleString()}
          </p>
        </div>
        <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={includeDemo}
            onChange={(e) => setIncludeDemo(e.target.checked)}
          />
          Include demo/test data
        </label>
      </div>

      {brief ? (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">AI-assisted daily brief</p>
          <p className="mt-2 text-sm leading-relaxed text-indigo-950">{brief.brief}</p>
          <p className="mt-3 text-xs text-indigo-800">{brief.disclaimer}</p>
        </div>
      ) : null}

      {data.criticalAlerts.length > 0 ? (
        <section className="rounded-2xl border-2 border-rose-300 bg-rose-50 p-5">
          <h2 className="text-lg font-bold text-rose-900">Critical safety items — review immediately</h2>
          <ul className="mt-3 space-y-3">
            {data.criticalAlerts.map((a) => (
              <li key={a.id} className="rounded-xl border border-rose-200 bg-white p-4 text-sm">
                <p className="font-semibold text-rose-900">
                  {a.userName} · {a.severity} · {a.concernCategory.replace(/_/g, " ")}
                </p>
                <p className="mt-1 text-slate-600">{a.aiSummary ?? "No summary yet."}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total users" value={k.totalUsers} hint="Real production users by default" />
        <KpiCard label="New today" value={k.newUsersToday} tone={k.newUsersToday > 0 ? "success" : "default"} />
        <KpiCard label="New this week" value={k.newUsersThisWeek} />
        <KpiCard label="Active today" value={k.activeUsersToday} />
        <KpiCard label="Active this week" value={k.activeUsersThisWeek} />
        <KpiCard label="Profiles created (7d)" value={k.newProfilesCreated} />
        <KpiCard label="Quick Setup incomplete" value={k.quickSetupIncomplete} tone={k.quickSetupIncomplete > 0 ? "warning" : "default"} />
        <KpiCard label="Open support requests" value={k.openSupportRequests} />
        <KpiCard
          label="Urgent safety alerts"
          value={k.urgentSafetyAlerts}
          tone={k.urgentSafetyAlerts > 0 ? "danger" : "default"}
        />
        <KpiCard
          label="Possible emergencies"
          value={k.possibleEmergencies}
          tone={k.possibleEmergencies > 0 ? "danger" : "default"}
        />
        <KpiCard label="Payments today" value={k.paymentsToday} />
        <KpiCard label="Payments (30d)" value={k.paymentsThisMonth} />
        <KpiCard label="Platform health" value={`${k.platformHealthScore}/100`} tone={k.platformHealthScore < 70 ? "warning" : "success"} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Recent platform activity</h2>
          {data.recentActivity.length === 0 ? (
            <AdminEmptyState title="No activity yet" description="User logins and admin actions will appear here." />
          ) : (
            <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto text-sm">
              {data.recentActivity.map((e, i) => (
                <li key={`${e.createdAt}-${i}`} className="flex justify-between gap-3 border-b border-slate-100 py-2">
                  <span>
                    <span className="font-medium">{e.eventType.replace(/_/g, " ")}</span>
                    {e.email ? ` · ${e.email}` : ""}
                    {e.detail ? ` — ${e.detail}` : ""}
                  </span>
                  <span className="shrink-0 text-xs text-slate-500">
                    {new Date(e.createdAt).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">System summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt>Environment</dt><dd className="font-medium capitalize">{data.environment}</dd></div>
            <div className="flex justify-between"><dt>System status</dt><dd className="font-medium capitalize">{data.systemStatus}</dd></div>
            <div className="flex justify-between"><dt>Failed payments</dt><dd>{k.failedPayments}</dd></div>
            <div className="flex justify-between"><dt>Pending approvals</dt><dd>{k.pendingApprovals}</dd></div>
          </dl>
          <p className="mt-4 text-xs text-slate-500">
            Safety and health items require human review. AI summaries assist triage only — not clinical or legal decisions.
          </p>
        </div>
      </section>
    </div>
  );
}
