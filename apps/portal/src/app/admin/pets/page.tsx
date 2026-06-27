import { AdminSectionPage } from "@/components/admin/AdminSectionPage";

export default function AdminPetsPage() {
  return (
    <AdminSectionPage
      title="Companion Pets"
      description="Nuvio Companion Pet health, persistence, catalog, XP events, and reminder infrastructure."
      section="pets"
      render={(data) => {
        const d = data as {
          tablesAvailable?: boolean;
          pets?: number;
          items?: number;
          events?: number;
          source?: string;
          xpApi?: string;
          catalog?: Array<{
            id: string;
            name: string;
            itemType: string;
            theme: string | null;
            unlockLevel: number;
            isActive: boolean;
          }>;
          recentEvents?: Array<{
            id: string;
            userId: string;
            childProfileId: string | null;
            eventType: string;
            xpAwarded: number;
            createdAt: string;
          }>;
        };
        const checks = [
          { label: "Supabase pet tables", value: d.tablesAvailable ? "Available" : "Needs migration", good: Boolean(d.tablesAvailable) },
          { label: "XP award API", value: d.xpApi ?? "unknown", good: d.xpApi === "available" },
          { label: "Pet catalog items", value: String(d.items ?? 0), good: (d.items ?? 0) > 0 },
          { label: "Persistence source", value: d.source ?? "unknown", good: d.source === "supabase" },
        ];

        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Pets created</p>
                <p className="mt-2 text-3xl font-black">{d.pets ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Catalog items</p>
                <p className="mt-2 text-3xl font-black">{d.items ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">XP events</p>
                <p className="mt-2 text-3xl font-black">{d.events ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Source</p>
                <p className="mt-2 text-2xl font-black capitalize">{d.source ?? "unknown"}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="font-semibold">Operational readiness</h2>
              <div className="mt-4 divide-y divide-slate-100">
                {checks.map((check) => (
                  <div key={check.label} className="flex items-center justify-between py-3 text-sm">
                    <span className="font-medium">{check.label}</span>
                    <span className={check.good ? "font-bold text-emerald-600" : "font-bold text-amber-600"}>
                      {check.value}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-4 rounded-xl bg-indigo-50 p-4 text-sm text-indigo-900">
                Companion Pets are supportive engagement tools only. They must not be represented as diagnosis,
                treatment, crisis response, emergency support, or a substitute for clinical care.
              </p>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold">Pet item catalog</h2>
                    <p className="text-sm text-slate-500">Admins can manage items through the protected `/api/pets` admin actions.</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    {d.catalog?.length ?? 0} items
                  </span>
                </div>
                <div className="mt-4 overflow-hidden rounded-xl border border-slate-100">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-3 py-2">Item</th>
                        <th className="px-3 py-2">Type</th>
                        <th className="px-3 py-2">Level</th>
                        <th className="px-3 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(d.catalog ?? []).map((item) => (
                        <tr key={item.id}>
                          <td className="px-3 py-2">
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-xs text-slate-500">{item.id}</p>
                          </td>
                          <td className="px-3 py-2 capitalize">{item.itemType.replace(/_/g, " ")}</td>
                          <td className="px-3 py-2">{item.unlockLevel}</td>
                          <td className="px-3 py-2">
                            <span className={item.isActive ? "font-bold text-emerald-600" : "font-bold text-slate-400"}>
                              {item.isActive ? "Active" : "Off"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold">Recent XP events</h2>
                    <p className="text-sm text-slate-500">Used for diagnostics and abuse/farming review.</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    {d.recentEvents?.length ?? 0} shown
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  {(d.recentEvents ?? []).length ? (
                    d.recentEvents?.map((event) => (
                      <div key={event.id} className="rounded-xl border border-slate-100 p-3 text-sm">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold capitalize">{event.eventType.replace(/_/g, " ")}</p>
                          <span className="font-bold text-indigo-600">+{event.xpAwarded} XP</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {event.userId} {event.childProfileId ? `· profile ${event.childProfileId}` : ""} ·{" "}
                          {new Date(event.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No pet XP events yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      }}
    />
  );
}
