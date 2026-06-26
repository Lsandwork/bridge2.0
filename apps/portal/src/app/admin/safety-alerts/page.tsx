import { AdminSectionPage } from "@/components/admin/AdminSectionPage";

export default function AdminSafetyAlertsPage() {
  return (
    <AdminSectionPage
      title="Safety Alerts"
      description="Life-safety concerns detected through Nuvio conversations — respond with care."
      section="safety-alerts"
      render={(data) => {
        const alerts = (data as Array<{
          id: string;
          userName: string;
          bridgeGroupName: string | null;
          concernCategory: string;
          severity: string;
          status: string;
          triggeringExcerpt: string;
          createdAt: string;
          isDemo: boolean;
        }>) ?? [];
        return (
          <div className="space-y-3">
            {alerts.map((a) => (
              <div key={a.id} className="rounded-xl border-l-4 border-rose-500 bg-white p-4 shadow-sm dark:bg-slate-900">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-800">{a.severity}</span>
                  <span className="text-sm font-semibold">{a.userName}</span>
                  <span className="text-xs text-slate-500">{a.bridgeGroupName}</span>
                  {a.isDemo ? <span className="text-xs text-violet-600">Demo</span> : null}
                </div>
                <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{a.triggeringExcerpt}</p>
                <p className="mt-1 text-xs text-slate-500">{a.concernCategory.replace(/_/g, " ")} · {a.status}</p>
              </div>
            ))}
            {alerts.length === 0 ? <p className="text-slate-500">No safety alerts.</p> : null}
          </div>
        );
      }}
    />
  );
}
