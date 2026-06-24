"use client";

import { useEffect, useState } from "react";
import { LoadingBlock } from "@/components/StateBlock";

type Prompt = {
  id: string;
  name: string;
  roleScope: string;
  version: number;
  isActive: boolean;
  systemPrompt: string;
};

export default function AdminTessPromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/tess?section=prompts")
      .then((r) => r.json())
      .then((data) => {
        setPrompts(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingBlock label="Loading prompts…" />;

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-bold">Tess Prompt Manager</h1>
      <p className="mt-1 text-sm text-slate-600">Manage role-scoped system prompts and safety instructions.</p>

      <div className="mt-6 space-y-4">
        {prompts.map((p) => (
          <article key={p.id} className="rounded-xl border bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">{p.name}</h2>
                <p className="text-xs text-slate-500">
                  {p.roleScope} · v{p.version} {p.isActive ? "· Active" : ""}
                </p>
              </div>
            </div>
            <pre className="mt-3 max-h-32 overflow-auto rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-800">
              {p.systemPrompt.slice(0, 400)}…
            </pre>
          </article>
        ))}
      </div>
    </main>
  );
}
