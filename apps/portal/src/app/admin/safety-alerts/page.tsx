"use client";

import { AdminEmptyState, AdminErrorState, AdminLoadingState } from "@/components/admin/AdminUi";
import { adminAction, useAdminFetch } from "@/hooks/useAdminFetch";

type SafetyAlert = {
  id: string;
  userName: string;
  bridgeGroupName: string | null;
  concernCategory: string;
  severity: string;
  status: string;
  triggeringExcerpt: string;
  aiSummary: string | null;
  recommendedSteps: string | null;
  emergencyRecommended: boolean;
  source: string;
  createdAt: string;
  isDemo: boolean;
};

export default function AdminSafetyAlertsPage() {
  const { data, loading, error, reload } = useAdminFetch<SafetyAlert[]>("/api/admin/safety-alerts");

  if (loading) return <AdminLoadingState />;
  if (error) return <AdminErrorState message={error} onRetry={reload} />;

  const alerts = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-rose-900">Safety & Emergency Center</h1>
        <p className="text-slate-600">
          Urgent safety concerns from Nuvio chat, messages, and caregiver escalations. Human review required — AI
          assists with summarization only.
        </p>
      </div>
      {alerts.length === 0 ? (
        <AdminEmptyState title="No safety alerts" description="Critical and high-severity alerts will appear at the top of the command center." />
      ) : (
        <div className="space-y-4">
          {alerts.map((a) => (
            <article
              key={a.id}
              className={`rounded-2xl border bg-white p-5 ${
                a.severity === "critical" || a.emergencyRecommended
                  ? "border-rose-400 shadow-rose-100 shadow-md"
                  : "border-slate-200"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold uppercase text-rose-800">
                  {a.severity}
                </span>
                <span className="font-semibold">{a.userName}</span>
                {a.bridgeGroupName ? <span className="text-xs text-slate-500">{a.bridgeGroupName}</span> : null}
                {a.isDemo ? <span className="text-xs text-violet-600">Demo</span> : null}
                {a.emergencyRecommended ? (
                  <span className="rounded-full bg-rose-600 px-2 py-0.5 text-xs font-bold text-white">Emergency review</span>
                ) : null}
              </div>
              <p className="mt-3 text-sm text-slate-800">{a.triggeringExcerpt}</p>
              {a.aiSummary ? (
                <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                  <span className="font-semibold">AI-assisted summary: </span>
                  {a.aiSummary}
                </p>
              ) : null}
              {a.recommendedSteps ? (
                <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-indigo-50 p-3 text-xs text-indigo-900">
                  {a.recommendedSteps}
                </pre>
              ) : null}
              <p className="mt-2 text-xs text-slate-500">
                {a.concernCategory.replace(/_/g, " ")} · {a.status} · {a.source} ·{" "}
                {new Date(a.createdAt).toLocaleString()}
              </p>
              {a.status !== "resolved" ? (
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="text-sm font-semibold text-indigo-600 hover:underline"
                    onClick={async () => {
                      await adminAction({ action: "update-safety-alert", alertId: a.id, status: "acknowledged" });
                      reload();
                    }}
                  >
                    Acknowledge
                  </button>
                  <button
                    type="button"
                    className="text-sm font-semibold text-amber-700 hover:underline"
                    onClick={async () => {
                      await adminAction({ action: "update-safety-alert", alertId: a.id, status: "in_progress" });
                      reload();
                    }}
                  >
                    Mark reviewing
                  </button>
                  <button
                    type="button"
                    className="text-sm font-semibold text-emerald-700 hover:underline"
                    onClick={async () => {
                      await adminAction({ action: "update-safety-alert", alertId: a.id, status: "resolved" });
                      reload();
                    }}
                  >
                    Resolve
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
