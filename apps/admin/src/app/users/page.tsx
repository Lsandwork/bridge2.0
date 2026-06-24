"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  libraryCredits: number;
  accessPlan: string;
  accessActive: boolean;
  lastActiveAt: string | null;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin?section=diagnostics")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setUsers(data.users ?? []);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load users"));
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-4 md:p-8">
      <section className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Users & Roles</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              All accounts from the auth database with library access and activity status.
            </p>
          </div>
          <Link
            href="/diagnostics"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Open full diagnostics →
          </Link>
        </div>
      </section>
      {error ? <section className="card p-6 text-red-700">{error}</section> : null}
      <section className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Plan</th>
              <th className="p-3 text-left">Credits</th>
              <th className="p-3 text-left">Access</th>
              <th className="p-3 text-left">Last active</th>
              <th className="p-3 text-left" />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-slate-200 dark:border-slate-700">
                <td className="p-3 font-medium">{user.name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3 capitalize">{user.role.replace(/_/g, " ")}</td>
                <td className="p-3 capitalize">{user.accessPlan}</td>
                <td className="p-3">{user.libraryCredits}</td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      user.accessActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {user.accessActive ? "Active" : "Free"}
                  </span>
                </td>
                <td className="p-3 text-xs text-slate-500">
                  {user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleString() : "—"}
                </td>
                <td className="p-3">
                  <Link href={`/diagnostics?user=${user.id}`} className="text-xs font-semibold text-blue-600 hover:underline">
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
