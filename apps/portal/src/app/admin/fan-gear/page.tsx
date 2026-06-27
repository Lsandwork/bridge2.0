import { AdminSectionPage } from "@/components/admin/AdminSectionPage";

export default function AdminFanGearPage() {
  return (
    <AdminSectionPage
      title="Fan Gear & Sports Partnerships"
      description="Bridge PETS cosmetic catalog, sports partnership placeholders, licensing guardrails, and unlock readiness."
      section="fan-gear"
      render={(data) => {
        const d = data as {
          source?: string;
          items?: number;
          partners?: number;
          officialLicensedItems?: number;
          licensingWarnings?: string[];
          collections?: Array<{ slug: string; name: string; itemIds: string[]; rarity: string }>;
        };
        const warningCount = d.licensingWarnings?.length ?? 0;
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Fan gear items</p>
                <p className="mt-2 text-3xl font-black">{d.items ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Partner rails</p>
                <p className="mt-2 text-3xl font-black">{d.partners ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Official items</p>
                <p className="mt-2 text-3xl font-black">{d.officialLicensedItems ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Source</p>
                <p className="mt-2 text-2xl font-black capitalize">{d.source ?? "unknown"}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
              <h2 className="font-bold">Licensing safety</h2>
              <p className="mt-2 text-sm">
                Production currently uses Bridge-owned generic placeholder gear. Do not enable real team, league,
                event, flag, rank, or trademarked marks until a written license is confirmed and recorded.
              </p>
              <p className="mt-3 text-sm font-bold">
                {warningCount > 0 ? `${warningCount} partner rails are not approved yet.` : "No licensing warnings reported."}
              </p>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="font-semibold text-slate-900">Style collections</h2>
                <div className="mt-4 divide-y divide-slate-100">
                  {(d.collections ?? []).map((collection) => (
                    <div key={collection.slug} className="py-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-bold text-slate-900">{collection.name}</p>
                          <p className="text-xs text-slate-500">{collection.slug}</p>
                        </div>
                        <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold uppercase text-violet-700">
                          {collection.rarity}
                        </span>
                      </div>
                      <p className="mt-2 text-slate-600">{collection.itemIds.length} connected item assets</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="font-semibold text-slate-900">Partner licensing warnings</h2>
                {warningCount === 0 ? (
                  <p className="mt-4 text-sm text-slate-500">No warnings returned.</p>
                ) : (
                  <ul className="mt-4 space-y-2 text-sm">
                    {(d.licensingWarnings ?? []).map((warning) => (
                      <li key={warning} className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 font-medium text-amber-900">
                        {warning}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        );
      }}
    />
  );
}
