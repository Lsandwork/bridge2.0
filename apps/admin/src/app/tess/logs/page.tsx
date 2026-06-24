"use client";

import { useEffect, useState } from "react";
import { LoadingBlock } from "@/components/StateBlock";
import { TESS_DISCLAIMER } from "@family-support/core";

type Stats = {
  totalConversations: number;
  totalMessages: number;
  activeUsers: number;
  tokenUsage?: number;
  totalTokens?: number;
  estimatedCost: number;
  failedRequests: number;
  avgLatencyMs: number;
  provider: string;
  model: string;
  pendingSuggestions: number;
  approvalRate: number;
  rejectionRate: number;
};

export default function AdminTessLogsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/tess?section=stats").then((r) => r.json()),
      fetch("/api/admin/tess?section=logs").then((r) => r.json()),
    ]).then(([s, l]) => {
      setStats(s);
      setLogs(Array.isArray(l) ? l : []);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingBlock label="Loading Tess AI logs…" />;

  return (
    <main className="mx-auto max-w-7xl p-6">
      <h1 className="text-2xl font-bold">Tess AI Logs</h1>
      <p className="mt-1 text-sm text-slate-600">{TESS_DISCLAIMER.slice(0, 120)}…</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Conversations", stats?.totalConversations ?? 0],
          ["Messages", stats?.totalMessages ?? 0],
          ["Active users", stats?.activeUsers ?? 0],
          ["Token usage", stats?.tokenUsage ?? stats?.totalTokens ?? 0],
          ["Est. cost", `$${(stats?.estimatedCost ?? 0).toFixed(4)}`],
          ["Failed requests", stats?.failedRequests ?? 0],
          ["Avg latency", `${stats?.avgLatencyMs ?? 0}ms`],
          ["Provider", `${stats?.provider ?? "—"} / ${stats?.model ?? "—"}`],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-xl border bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs uppercase text-slate-500">{label}</p>
            <p className="mt-1 text-xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-8 text-lg font-semibold">Recent usage</h2>
      <div className="mt-3 overflow-x-auto rounded-xl border dark:border-slate-700">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              {["Provider", "Model", "Type", "Tokens in", "Tokens out", "Latency", "Success"].map((h) => (
                <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(logs as { provider?: string; model?: string; requestType?: string; tokensInput?: number; tokensOutput?: number; latencyMs?: number; success?: boolean }[])
              .slice(0, 20)
              .map((log, i) => (
                <tr key={i} className="border-t dark:border-slate-700">
                  <td className="px-3 py-2">{log.provider}</td>
                  <td className="px-3 py-2">{log.model}</td>
                  <td className="px-3 py-2">{log.requestType}</td>
                  <td className="px-3 py-2">{log.tokensInput}</td>
                  <td className="px-3 py-2">{log.tokensOutput}</td>
                  <td className="px-3 py-2">{log.latencyMs}ms</td>
                  <td className="px-3 py-2">{log.success ? "Yes" : "No"}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
