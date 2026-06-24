"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EmptyBlock, LoadingBlock } from "@/components/StateBlock";

type Conversation = {
  id: string;
  title?: string;
  mode: string;
  role: string;
  summary?: string;
  safetyStatus: string;
  isFlagged: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function TessHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: string; content: string; createdAt: string }[]>([]);

  useEffect(() => {
    fetch("/api/tess/conversations")
      .then((r) => r.json())
      .then((data) => {
        setConversations(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  const openConversation = (id: string) => {
    setSelected(id);
    fetch(`/api/tess/conversations?id=${id}`)
      .then((r) => r.json())
      .then((data) => setMessages(data.messages ?? []));
  };

  return (
    <main className="mx-auto max-w-5xl p-6">
      <Link href="/tess" className="mb-4 flex items-center gap-1 text-sm font-bold text-[var(--brand)]">
        <ArrowLeft className="h-4 w-4" /> Back to Tess
      </Link>
      <h1 className="text-2xl font-extrabold">Conversation History</h1>

      {loading ? <LoadingBlock label="Loading conversations…" /> : null}

      {!loading && conversations.length === 0 ? (
        <EmptyBlock title="No conversations yet" description="Tess conversations will appear here." />
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          {conversations.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`tess-card w-full p-4 text-left ${selected === c.id ? "ring-2 ring-[var(--brand)]" : ""}`}
              onClick={() => openConversation(c.id)}
            >
              <p className="font-bold">{c.title ?? "Conversation"}</p>
              <p className="text-xs text-[var(--text-tertiary)]">
                {c.mode} · {new Date(c.createdAt).toLocaleDateString()}
                {c.isFlagged ? " · Flagged" : ""}
              </p>
              {c.summary ? <p className="mt-1 text-sm text-[var(--text-secondary)]">{c.summary}</p> : null}
            </button>
          ))}
        </div>
        <div className="tess-card min-h-[300px] p-4">
          {selected ? (
            <div className="space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`rounded-xl px-3 py-2 text-sm ${
                    m.role === "user" ? "ml-8 bg-[var(--brand-light)]" : "mr-8 bg-[var(--surface-muted)]"
                  }`}
                >
                  {m.content}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-[var(--text-tertiary)]">Select a conversation to view messages.</p>
          )}
        </div>
      </div>
    </main>
  );
}
