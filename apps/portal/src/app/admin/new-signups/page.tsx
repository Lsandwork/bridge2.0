"use client";

import { AdminEmptyState, AdminErrorState, AdminLoadingState } from "@/components/admin/AdminUi";
import { useAdminFetch } from "@/hooks/useAdminFetch";

type SignupRow = {
  userId: string | null;
  email: string | null;
  name: string;
  role: string;
  signedUpAt: string;
  onboardingComplete: boolean;
  setupComplete: boolean;
  isDemo: boolean;
};

export default function AdminNewSignupsPage() {
  const { data, loading, error, reload } = useAdminFetch<SignupRow[]>("/api/admin/users?view=signups");

  if (loading) return <AdminLoadingState />;
  if (error) return <AdminErrorState message={error} onRetry={reload} />;

  const rows = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New Signups</h1>
        <p className="text-slate-600">Track onboarding progress and users who need follow-up.</p>
      </div>
      {rows.length === 0 ? (
        <AdminEmptyState title="No signups recorded yet" description="New user registrations will appear here with setup status." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Signed up</th>
                <th className="px-4 py-3">Onboarding</th>
                <th className="px-4 py-3">Quick Setup</th>
                <th className="px-4 py-3">Type</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`${r.email}-${r.signedUpAt}`} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3">{r.email}</td>
                  <td className="px-4 py-3">{r.role}</td>
                  <td className="px-4 py-3">{new Date(r.signedUpAt).toLocaleString()}</td>
                  <td className="px-4 py-3">{r.onboardingComplete ? "Complete" : "Incomplete"}</td>
                  <td className="px-4 py-3">{r.setupComplete ? "Complete" : "Needs follow-up"}</td>
                  <td className="px-4 py-3">{r.isDemo ? "Demo" : "Real"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
