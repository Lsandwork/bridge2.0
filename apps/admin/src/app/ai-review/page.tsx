"use client";

import { useEffect, useState } from "react";

type Suggestion = { id: string; type: string; details: string; status: string; createdAt: string };

export default function AdminAiReviewPage() {
  const [items, setItems] = useState<Suggestion[]>([]);

  useEffect(() => {
    fetch("/api/admin?section=ai")
      .then((res) => res.json())
      .then(setItems);
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-4 md:p-8">
      <section className="card p-6">
        <h2 className="text-2xl font-semibold">AI Review Logs</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Audit all AI-generated suggestions. Content must never diagnose or claim to cure autism.
        </p>
      </section>
      <section className="space-y-3">
        {items.map((item) => (
          <article key={item.id} className="card p-5">
            <div className="flex justify-between gap-3">
              <p className="font-semibold">{item.type}</p>
              <span className="text-xs uppercase text-slate-500">{item.status}</span>
            </div>
            <p className="mt-1 text-sm">{item.details}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
