"use client";

import { useEffect, useState } from "react";

type Subscription = { id: string; org: string; plan: string; status: string; renewsAt: string };

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);

  useEffect(() => {
    fetch("/api/admin?section=subscriptions")
      .then((res) => res.json())
      .then(setSubs);
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-4 md:p-8">
      <section className="card p-6">
        <h2 className="text-2xl font-semibold">Subscriptions (Stripe-ready)</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Track plan tiers, trial status, and renewal dates per organization.
        </p>
      </section>
      <section className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="p-3 text-left">Organization</th>
              <th className="p-3 text-left">Plan</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Renews</th>
            </tr>
          </thead>
          <tbody>
            {subs.map((sub) => (
              <tr key={sub.id} className="border-t border-slate-200">
                <td className="p-3">{sub.org}</td>
                <td className="p-3">{sub.plan}</td>
                <td className="p-3 capitalize">{sub.status}</td>
                <td className="p-3">{sub.renewsAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
