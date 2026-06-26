import { AdminSectionPage } from "@/components/admin/AdminSectionPage";

export default function AdminDiagnosticsPage() {
  return (
    <AdminSectionPage
      title="Diagnostics"
      description="Environment, integrations, and platform health — values never exposed."
      section="diagnostics"
      render={(data) => {
        const d = data as {
          envChecks?: Array<{ label: string; status: string }>;
          counts?: Record<string, number>;
          supabase?: { url: string; auth: string };
          ai?: Record<string, string>;
          email?: string;
          demoIsolation?: { status: string };
        };
        return (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="font-semibold">Environment variables</h2>
              <ul className="mt-4 space-y-2 text-sm">
                {(d.envChecks ?? []).map((e) => (
                  <li key={e.label} className="flex justify-between">
                    <span>{e.label}</span>
                    <span className={e.status === "configured" ? "text-emerald-600" : "text-rose-600"}>
                      {e.status === "configured" ? "Configured" : "Missing"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="font-semibold">Services</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><dt>Supabase URL</dt><dd className="capitalize">{d.supabase?.url}</dd></div>
                <div className="flex justify-between"><dt>Supabase Auth</dt><dd className="capitalize">{d.supabase?.auth}</dd></div>
                <div className="flex justify-between"><dt>Email</dt><dd className="capitalize">{d.email?.replace("_", " ")}</dd></div>
                <div className="flex justify-between"><dt>Demo isolation</dt><dd className="capitalize">{d.demoIsolation?.status}</dd></div>
              </dl>
            </div>
          </div>
        );
      }}
    />
  );
}
