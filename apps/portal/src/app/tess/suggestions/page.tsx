"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EmptyBlock, LoadingBlock } from "@/components/StateBlock";

type Suggestion = {
  id: string;
  suggestionType: string;
  title: string;
  reason: string;
  status: string;
  riskLevel: string;
  childProfileId?: string;
  suggestedPayload: Record<string, unknown>;
  createdAt: string;
};

export default function TessSuggestionsPage() {
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/tess/suggestions${statusFilter ? `?status=${statusFilter}` : ""}`)
      .then((r) => r.json())
      .then((data) => {
        setSuggestions(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (id: string, action: "approve" | "reject" | "archive") => {
    setActionLoading(id);
    setError(null);
    try {
      const res = await fetch("/api/tess/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <main className="mx-auto max-w-5xl p-6">
      <Link href="/tess" className="mb-4 flex items-center gap-1 text-sm font-bold text-[var(--brand)]">
        <ArrowLeft className="h-4 w-4" /> Back to Tess
      </Link>
      <h1 className="text-2xl font-extrabold">Tess Suggestions Review</h1>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        Approve, edit, reject, or archive AI suggestions before they appear in your child&apos;s app.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {["pending", "approved", "rejected", "archived"].map((s) => (
          <button
            key={s}
            type="button"
            className={`rounded-full px-4 py-1.5 text-xs font-bold capitalize ${
              statusFilter === s ? "bg-[var(--brand)] text-white" : "border border-[var(--border)] bg-white"
            }`}
            onClick={() => setStatusFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? <LoadingBlock label="Loading suggestions…" /> : null}
      {error ? <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      {!loading && suggestions.length === 0 ? (
        <EmptyBlock title="No suggestions yet" description={`No ${statusFilter} Tess suggestions.`} />
      ) : null}

      <div className="mt-6 space-y-4">
        {suggestions.map((s) => (
          <article key={s.id} className="tess-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="rounded-full bg-[var(--brand-light)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--brand-dark)]">
                  {s.suggestionType.replace(/_/g, " ")}
                </span>
                <h2 className="mt-2 text-lg font-bold">{s.title}</h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{s.reason}</p>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-xs font-bold ${
                  s.riskLevel === "high" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                }`}
              >
                {s.riskLevel} risk
              </span>
            </div>
            <pre className="mt-3 max-h-40 overflow-auto rounded-lg bg-[var(--surface-muted)] p-3 text-xs">
              {JSON.stringify(s.suggestedPayload, null, 2)}
            </pre>
            {s.status === "pending" ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn-primary px-4 py-2 text-sm"
                  disabled={actionLoading === s.id}
                  onClick={() => act(s.id, "approve")}
                >
                  {actionLoading === s.id ? "Saving…" : "Approve"}
                </button>
                <button
                  type="button"
                  className="rounded-xl border px-4 py-2 text-sm font-bold"
                  disabled={actionLoading === s.id}
                  onClick={() => act(s.id, "reject")}
                >
                  Reject
                </button>
                <button
                  type="button"
                  className="rounded-xl border px-4 py-2 text-sm font-bold text-[var(--text-tertiary)]"
                  disabled={actionLoading === s.id}
                  onClick={() => act(s.id, "archive")}
                >
                  Archive
                </button>
              </div>
            ) : (
              <p className="mt-3 text-xs font-bold uppercase text-[var(--text-tertiary)]">Status: {s.status}</p>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}
