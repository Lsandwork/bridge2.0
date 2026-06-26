"use client";

import { AdminEmptyState, AdminErrorState, AdminLoadingState } from "@/components/admin/AdminUi";
import { useAdminFetch } from "@/hooks/useAdminFetch";

export default function AdminAuditPage() {
  const { data, loading, error, reload } = useAdminFetch<Array<{
    eventType: string;
    email: string | null;
    detail: string | null;
    createdAt: string;
  }>>("/api/admin/diagnostics?section=activity&eventType=admin_action&limit=100");

  if (loading) return <AdminLoadingState />;
  if (error) return <AdminErrorState message={error} onRetry={reload} />;

  const rows = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Trail</h1>
        <p className="text-slate-600">Super Admin view of privileged admin actions across the platform.</p>
      </div>
      {rows.length === 0 ? (
        <AdminEmptyState title="No admin actions logged yet" description="Password resets, role changes, and safety resolutions will appear here." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Actor / target</th>
                <th className="px-4 py-3">Detail</th>
                <th className="px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={`${r.createdAt}-${i}`} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{r.eventType.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3">{r.email ?? "—"}</td>
                  <td className="px-4 py-3">{r.detail ?? "—"}</td>
                  <td className="px-4 py-3">{new Date(r.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
