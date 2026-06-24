"use client";

import { useEffect, useState } from "react";
import { LoadingBlock } from "@/components/StateBlock";

type Flag = {
  id: string;
  flagType: string;
  riskLevel: string;
  description: string;
  status: string;
  childProfileId?: string;
  createdAt: string;
};

export default function AdminTessSafetyPage() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch("/api/admin/tess?section=safety-flags")
      .then((r) => r.json())
      .then((data) => {
        setFlags(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const resolve = async (id: string, escalate = false) => {
    await fetch("/api/admin/tess", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "resolve-flag", id, adminNotes: "Reviewed", escalate }),
    });
    load();
  };

  if (loading) return <LoadingBlock label="Loading safety flags…" />;

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-bold">Tess Safety Flags</h1>
      {flags.length === 0 ? (
        <p className="mt-6 text-slate-600">No safety flags yet.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {flags.map((f) => (
            <article key={f.id} className="rounded-xl border bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-800">{f.riskLevel}</span>
                  <h2 className="mt-1 font-semibold">{f.flagType}</h2>
                  <p className="text-sm text-slate-600">{f.description}</p>
                  <p className="mt-1 text-xs text-slate-400">{new Date(f.createdAt).toLocaleString()} · {f.status}</p>
                </div>
                {f.status === "open" ? (
                  <div className="flex gap-2">
                    <button type="button" className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white" onClick={() => resolve(f.id)}>
                      Resolve
                    </button>
                    <button type="button" className="rounded-lg border px-3 py-1.5 text-sm" onClick={() => resolve(f.id, true)}>
                      Escalate
                    </button>
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
