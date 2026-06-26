import { AdminSectionPage } from "@/components/admin/AdminSectionPage";

export default function AdminDemoAccountsPage() {
  return (
    <AdminSectionPage
      title="Demo Accounts"
      description="Isolated presentation accounts for investors — never mixed with production users."
      section="demo-accounts"
      render={(data) => {
        const users = (data as Array<{ email: string; name: string; role: string; bridgeGroups?: Array<{ displayName: string }> }>) ?? [];
        return (
          <div className="rounded-2xl border border-violet-200 bg-violet-50/50 p-6 dark:border-violet-900 dark:bg-violet-950/20">
            <p className="text-sm text-violet-800 dark:text-violet-200">
              Demo Mode — passwords: <code className="rounded bg-white px-1">password123</code> for investor accounts.
            </p>
            <div className="mt-4 space-y-3">
              {users.map((u) => (
                <div key={u.email} className="rounded-xl bg-white p-4 dark:bg-slate-900">
                  <p className="font-semibold">{u.name}</p>
                  <p className="text-sm text-slate-600">{u.email} · {u.role}</p>
                  <p className="text-xs text-slate-500">{u.bridgeGroups?.map((g) => g.displayName).join(", ")}</p>
                </div>
              ))}
            </div>
          </div>
        );
      }}
    />
  );
}
