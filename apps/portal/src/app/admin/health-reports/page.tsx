"use client";

import { AdminEmptyState, AdminErrorState, AdminLoadingState } from "@/components/admin/AdminUi";
import { adminAction, useAdminFetch } from "@/hooks/useAdminFetch";

type HealthReport = {
  id: string;
  userName: string;
  concernType: string;
  severity: string;
  status: string;
  summary: string;
  aiSummary: string | null;
  recommendedFollowUp: string | null;
  submittedByName: string;
  createdAt: string;
};

export default function AdminHealthReportsPage() {
  const { data, loading, error, reload } = useAdminFetch<HealthReport[]>("/api/admin/health-reports");

  if (loading) return <AdminLoadingState />;
  if (error) return <AdminErrorState message={error} onRetry={reload} />;

  const rows = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Health Issues Center</h1>
        <p className="text-slate-600">
          Reported wellness concerns for admin review. These are not diagnoses — human follow-up is required.
        </p>
      </div>
      {rows.length === 0 ? (
        <AdminEmptyState title="No health reports yet" description="Caregiver and family reported concerns will appear here." />
      ) : (
        <div className="space-y-4">
          {rows.map((r) => (
            <article key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold">{r.userName} · {r.concernType.replace(/_/g, " ")}</h2>
                  <p className="text-xs text-slate-500">
                    Reported by {r.submittedByName} · {new Date(r.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2 text-xs font-semibold uppercase">
                  <span className="rounded-full bg-slate-100 px-2 py-1">{r.severity}</span>
                  <span className="rounded-full bg-indigo-100 px-2 py-1 text-indigo-800">{r.status}</span>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-700">{r.summary}</p>
              {r.aiSummary ? (
                <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                  <span className="font-semibold">AI-assisted summary: </span>
                  {r.aiSummary}
                </p>
              ) : null}
              {r.recommendedFollowUp ? (
                <p className="mt-2 text-sm text-indigo-800">
                  <span className="font-semibold">Recommended follow-up: </span>
                  {r.recommendedFollowUp}
                </p>
              ) : null}
              {r.status !== "resolved" ? (
                <button
                  type="button"
                  className="mt-4 text-sm font-semibold text-indigo-600 hover:underline"
                  onClick={async () => {
                    await adminAction({
                      action: "update-health-report",
                      reportId: r.id,
                      status: "resolved",
                    }).catch(() => undefined);
                    reload();
                  }}
                >
                  Mark resolved
                </button>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
