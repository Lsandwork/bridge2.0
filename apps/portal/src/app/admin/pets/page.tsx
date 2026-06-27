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
          </div>
        );
      }}
    />
  );
}
