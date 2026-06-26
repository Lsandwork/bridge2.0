export default function AdminMessagesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Messages</h1>
      <p className="text-slate-600">
        Admin message oversight is available when safety or compliance permissions allow. Use User Accounts to view Bridge Group membership.
      </p>
      <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900">
        Message threads are scoped to Bridge Groups. Admins with observer access can coordinate through the same messaging system at{" "}
        <a href="/messages" className="text-indigo-600 hover:underline">/messages</a>.
      </p>
    </div>
  );
}
