"use client";

import { useEffect, useState } from "react";

type Overview = {
  stats: { totalUsers: number; activeUsers: number; openSafetyAlerts: number; unreadErrors: number };
  bridge: { totalGroups: number; activeGroups: number; demoGroups: number; totalMembers: number };
  diagnostics: { supabase: { connection: string }; ai: { provider: string } };
};

export default function AdminOverviewPage() {
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    fetch("/api/platform/admin?section=overview")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  if (!data) {
    return <p className="text-slate-500">Loading overview…</p>;
  }

  const cards = [
    { label: "Total users", value: data.stats.totalUsers, tone: "bg-indigo-50 text-indigo-700" },
    { label: "Bridge groups", value: data.bridge.activeGroups, tone: "bg-emerald-50 text-emerald-700" },
    { label: "Open safety alerts", value: data.stats.openSafetyAlerts, tone: "bg-rose-50 text-rose-700" },
    { label: "Open errors", value: data.stats.unreadErrors, tone: "bg-amber-50 text-amber-700" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Overview</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Nuvio Bridge platform health, users, and care-team coordination.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900`}>
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className={`mt-2 text-3xl font-bold ${c.tone.split(" ")[1]}`}>{c.value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-semibold text-slate-900 dark:text-white">Bridge Groups</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt>Total groups</dt><dd>{data.bridge.totalGroups}</dd></div>
            <div className="flex justify-between"><dt>Active members</dt><dd>{data.bridge.totalMembers}</dd></div>
            <div className="flex justify-between"><dt>Demo groups</dt><dd>{data.bridge.demoGroups}</dd></div>
          </dl>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-semibold text-slate-900 dark:text-white">System status</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt>Database</dt><dd className="capitalize">{data.diagnostics.supabase.connection.replace("_", " ")}</dd></div>
            <div className="flex justify-between"><dt>AI provider</dt><dd className="capitalize">{data.diagnostics.ai.provider}</dd></div>
          </dl>
        </div>
      </div>
    </div>
  );
}
