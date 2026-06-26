"use client";

import { AdminEmptyState, AdminErrorState, AdminLoadingState } from "@/components/admin/AdminUi";
import { useAdminFetch } from "@/hooks/useAdminFetch";

type SupportRequest = {
  id: string;
  requesterName: string;
  requesterRole: string;
  requesterEmail: string;
  requestType: string;
  priority: string;
  status: string;
  subject: string;
  message: string;
  createdAt: string;
};

export default function AdminRequestsPage() {
  const { data, loading, error, reload } = useAdminFetch<SupportRequest[]>("/api/admin/requests");

  if (loading) return <AdminLoadingState />;
  if (error) return <AdminErrorState message={error} onRetry={reload} />;

  const rows = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Requests Center</h1>
        <p className="text-slate-600">Access, documentation, billing, and care-team requests from platform users.</p>
      </div>
      {rows.length === 0 ? (
        <AdminEmptyState title="No open requests" description="Parent, caregiver, therapist, and school requests will appear here." />
      ) : (
        <div className="space-y-4">
          {rows.map((r) => (
            <article key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <h2 className="font-semibold">{r.subject}</h2>
                  <p className="text-xs text-slate-500">
                    {r.requesterName} ({r.requesterRole}) · {r.requesterEmail}
                  </p>
                </div>
                <div className="flex gap-2 text-xs font-semibold uppercase">
                  <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-900">{r.priority}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-1">{r.status}</span>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-700">{r.message}</p>
              <p className="mt-2 text-xs text-slate-500">
                {r.requestType.replace(/_/g, " ")} · {new Date(r.createdAt).toLocaleString()}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
