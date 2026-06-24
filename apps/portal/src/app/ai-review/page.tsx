"use client";

import { useEffect, useState } from "react";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/StateBlock";

type Suggestion = {
  id: string;
  type: string;
  details: string;
  status: string;
};

export default function AiReviewPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [queue, setQueue] = useState<Suggestion[]>([]);

  const load = () => {
    fetch("/api/ai-suggestions")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setQueue(data.filter((item: Suggestion) => item.status === "pending_review"));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load AI queue"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const review = async (id: string, status: "approved" | "rejected") => {
    const res = await fetch("/api/ai-suggestions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Review failed");
      return;
    }
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  if (loading) return <LoadingBlock label="Loading AI review queue..." />;
  if (error && queue.length === 0) return <ErrorBlock message={error} />;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-4 md:p-8">
      <section className="card p-6">
        <h2 className="text-2xl font-bold text-stone-900">AI Review Queue</h2>
        <p className="mt-2 text-sm text-stone-600">
          AI can suggest routines, social stories, exercises, and summaries. Nothing goes live until you approve it.
          AI never diagnoses or claims to cure autism.
        </p>
      </section>

      {queue.length === 0 ? (
        <EmptyBlock message="No pending AI suggestions. You're all caught up." />
      ) : (
        <section className="space-y-3">
          {queue.map((item) => (
            <article key={item.id} className="card p-5">
              <p className="font-bold text-stone-900">{item.type}</p>
              <p className="mt-1 text-sm text-stone-600">{item.details}</p>
              <div className="mt-3 flex gap-2">
                <button className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white" onClick={() => review(item.id, "approved")}>
                  Approve
                </button>
                <button className="rounded-md bg-rose-600 px-3 py-1.5 text-sm text-white" onClick={() => review(item.id, "rejected")}>
                  Reject
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
