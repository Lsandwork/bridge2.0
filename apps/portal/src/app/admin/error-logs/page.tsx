import { AdminSectionPage } from "@/components/admin/AdminSectionPage";

export default function AdminErrorLogsPage() {
  return (
    <AdminSectionPage
      title="Error Logs"
      description="System issues by severity — secrets are never shown."
      section="error-logs"
      render={(data) => {
        const payload = data as { items?: Array<{ id: string; severity: string; status: string; service: string; message: string; createdAt: string }> };
        const items = payload?.items ?? [];
        const severityColor: Record<string, string> = {
          critical: "bg-rose-100 text-rose-800",
          high: "bg-orange-100 text-orange-800",
          medium: "bg-amber-100 text-amber-800",
          low: "bg-slate-100 text-slate-700",
          info: "bg-blue-100 text-blue-800",
        };
        return (
          <div className="space-y-3">
            {items.map((e) => (
              <div key={e.id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${severityColor[e.severity] ?? ""}`}>{e.severity}</span>
                  <span className="text-xs text-slate-500">{e.service}</span>
                  <span className="text-xs text-slate-400">{new Date(e.createdAt).toLocaleString()}</span>
                </div>
                <p className="mt-2 text-sm">{e.message}</p>
              </div>
            ))}
          </div>
        );
      }}
    />
  );
}
