import { AdminSectionPage } from "@/components/admin/AdminSectionPage";

export default function AdminActivityPage() {
  return (
    <AdminSectionPage
      title="User Activity"
      description="Login, messaging, Nuvio interactions, credits, and admin actions."
      section="activity"
      render={(data) => {
        const events = (data as Array<{ eventType: string; email: string | null; detail: string | null; createdAt: string }>) ?? [];
        return (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Detail</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e, i) => (
                  <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-2 text-xs">{new Date(e.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-2">{e.email ?? "—"}</td>
                    <td className="px-4 py-2">{e.eventType}</td>
                    <td className="px-4 py-2 text-slate-500">{e.detail ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }}
    />
  );
}
