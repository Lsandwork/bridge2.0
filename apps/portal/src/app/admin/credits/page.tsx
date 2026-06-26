import { AdminSectionPage } from "@/components/admin/AdminSectionPage";

export default function AdminCreditsPage() {
  return (
    <AdminSectionPage
      title="Credits / Library / Courses"
      description="Grant credits and manage library access from User Accounts or here."
      section="users"
      render={(data) => {
        const users = (data as Array<{ name: string; email: string; credits: number }>) ?? [];
        return (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-600">Use User Accounts to set credits, unlock library items, and grant course access.</p>
            <ul className="mt-4 space-y-2 text-sm">
              {users.slice(0, 10).map((u) => (
                <li key={u.email} className="flex justify-between border-b border-slate-100 py-2 dark:border-slate-800">
                  <span>{u.name} ({u.email})</span>
                  <span className="font-medium">{u.credits ?? 0} credits</span>
                </li>
              ))}
            </ul>
          </div>
        );
      }}
    />
  );
}
