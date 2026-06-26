import { AdminSectionPage } from "@/components/admin/AdminSectionPage";
import { AdminEmptyState } from "@/components/admin/AdminUi";

export default function AdminBridgeGroupsPage() {
  return (
    <AdminSectionPage
      title="Bridge Groups"
      description="Private support circles around each child, teen, or adult user."
      section="bridge-groups"
      render={(data) => {
        const payload = data as { groups?: Array<{ id: string; displayName: string; status: string; isDemo: boolean }> };
        const groups = payload?.groups ?? [];
        if (groups.length === 0) {
          return (
            <AdminEmptyState
              title="No Bridge Groups yet"
              description="Real Bridge Groups will appear here once users invite caregivers, therapists, case managers, or support team members."
            />
          );
        }
        return (
          <div className="space-y-3">
            {groups.map((g) => (
              <div key={g.id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{g.displayName}</p>
                    <p className="text-xs text-slate-500">{g.id}</p>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">{g.status}</span>
                    {g.isDemo ? <span className="rounded-full bg-violet-100 px-2 py-1 text-violet-700">Demo</span> : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      }}
    />
  );
}
