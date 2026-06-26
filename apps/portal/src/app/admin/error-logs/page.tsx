"use client";

import { AdminEmptyState, AdminErrorState, AdminLoadingState } from "@/components/admin/AdminUi";
import { adminAction, useAdminFetch } from "@/hooks/useAdminFetch";

type ErrorLog = {
  id: string;
  severity: string;
  status: string;
  service: string;
  message: string;
  route: string | null;
  environment: string;
  createdAt: string;
};

export default function AdminErrorLogsPage() {
  const { data, loading, error, reload } = useAdminFetch<ErrorLog[]>(
    "/api/admin/diagnostics?section=errors&limit=50"
  );

  if (loading) return <AdminLoadingState />;
  if (error) return <AdminErrorState message={error} onRetry={reload} />;

  const items = data ?? [];
  const severityColor: Record<string, string> = {
    critical: "bg-rose-100 text-rose-800",
    high: "bg-orange-100 text-orange-800",
    medium: "bg-amber-100 text-amber-800",
    low: "bg-slate-100 text-slate-700",
    info: "bg-blue-100 text-blue-800",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Error Logs</h1>
        <p className="text-slate-600">Production issues by severity. Secrets and tokens are never displayed.</p>
      </div>
      {items.length === 0 ? (
        <AdminEmptyState title="No error logs" description="System errors will be captured here for admin investigation." />
      ) : (
        <div className="space-y-3">
          {items.map((e) => (
            <article key={e.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${severityColor[e.severity] ?? ""}`}>
                  {e.severity}
                </span>
                <span className="text-xs text-slate-500">{e.service}</span>
                <span className="text-xs text-slate-400">{e.environment}</span>
                <span className="text-xs text-slate-400">{new Date(e.createdAt).toLocaleString()}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{e.status}</span>
              </div>
              <p className="mt-2 text-sm">{e.message}</p>
              {e.route ? <p className="mt-1 text-xs text-slate-500">Route: {e.route}</p> : null}
              {e.status === "open" ? (
                <button
                  type="button"
                  className="mt-3 text-sm font-semibold text-indigo-600 hover:underline"
                  onClick={async () => {
                    await adminAction({ action: "resolve-error", errorId: e.id, status: "resolved" });
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
