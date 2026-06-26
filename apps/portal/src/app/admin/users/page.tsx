"use client";

import { useEffect, useState } from "react";

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  credits: number;
  bridgeGroups: Array<{ id: string; displayName: string; isDemo: boolean }>;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams({ section: "users" });
    if (email) params.set("email", email);
    if (role) params.set("role", role);
    const res = await fetch(`/api/platform/admin?${params}`);
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const action = async (action: string, userId: string, extra?: Record<string, unknown>) => {
    await fetch("/api/platform/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, userId, ...extra }),
    });
    await load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Accounts</h1>
        <p className="text-slate-600">Search, manage roles, reset passwords, and suspend accounts.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <input
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Search email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <select className="rounded-lg border border-slate-300 px-3 py-2 text-sm" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          <option value="parent_guardian">Parent/Caregiver</option>
          <option value="caregiver_therapist_teacher">Therapist/Case Manager</option>
          <option value="child_user">Child/Teen/Adult</option>
          <option value="admin">Admin</option>
        </select>
        <button type="button" onClick={load} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white">
          Search
        </button>
      </div>
      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Credits</th>
                <th className="px-4 py-3">Bridge Groups</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">{u.role}</td>
                  <td className="px-4 py-3 capitalize">{u.status}</td>
                  <td className="px-4 py-3">{u.credits}</td>
                  <td className="px-4 py-3">{u.bridgeGroups?.map((g) => g.displayName).join(", ") || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="text-indigo-600 hover:underline" onClick={() => action("reset-password", u.id)}>
                        Reset password
                      </button>
                      <button type="button" className="text-amber-600 hover:underline" onClick={() => action("set-credits", u.id, { balance: (u.credits ?? 0) + 5 })}>
                        +5 credits
                      </button>
                      <button type="button" className="text-rose-600 hover:underline" onClick={() => action("set-status", u.id, { status: "suspended" })}>
                        Suspend
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
