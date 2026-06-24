"use client";

import { useCallback, useEffect, useState } from "react";
import type { TherapistDashboardSnapshot } from "@family-support/data";
import { LoadingBlock } from "@/components/StateBlock";
import { TherapistModal } from "@/components/therapist/TherapistModal";
import { useLanguage } from "@/components/LanguageProvider";

export default function TherapistMessagesPage() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<TherapistDashboardSnapshot["messages"]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/therapist/dashboard");
    const d = await res.json();
    setMessages(d.messages ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openMessage = async (id: string) => {
    setSelectedId(id);
    const msg = messages.find((m) => m.id === id);
    if (msg?.unread) {
      await fetch("/api/therapist/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark-message-read", messageId: id }),
      });
      await load();
    }
  };

  const sendReply = async () => {
    if (!selectedId || !replyText.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/therapist/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reply-message", messageId: selectedId, replyText }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setReplyText("");
      await load();
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingBlock label={t("therapist.messages.loading")} />;

  const selected = messages.find((m) => m.id === selectedId) ?? null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">{t("therapist.messages.title")}</h1>
        <p className="mt-1 text-sm text-slate-400">{t("therapist.messages.subtitle")}</p>
      </div>

      <div className="space-y-2">
        {messages.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => openMessage(m.id)}
            className={`th-card block w-full p-4 text-left transition hover:border-teal-500/40 ${
              m.unread ? "border-teal-500/30" : ""
            } ${selectedId === m.id ? "ring-2 ring-teal-500/50" : ""}`}
          >
            <div className="flex items-center justify-between">
              <p className="font-bold">{m.from}</p>
              <div className="flex gap-2">
                {m.urgent ? (
                  <span className="text-[10px] font-bold uppercase text-red-400">{t("therapist.common.urgent")}</span>
                ) : null}
                {m.unread ? (
                  <span className="text-[10px] font-bold uppercase text-teal-400">{t("therapist.common.unread")}</span>
                ) : null}
              </div>
            </div>
            <p className="text-xs text-slate-500">{m.role}</p>
            <p className="mt-2 text-sm text-slate-300">{m.preview}</p>
            <p className="mt-1 text-[10px] text-slate-500">{new Date(m.timestamp).toLocaleString()}</p>
          </button>
        ))}
      </div>

      {selected ? (
        <TherapistModal
          open
          title={t("therapist.messages.modalTitle", { name: selected.from })}
          onClose={() => setSelectedId(null)}
          wide
        >
          <p className="text-xs text-slate-500">
            {selected.role} · {new Date(selected.timestamp).toLocaleString()}
          </p>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-200">{selected.body}</p>

          {selected.replies.length > 0 ? (
            <div className="mt-6 space-y-3 border-t border-white/10 pt-4">
              <p className="text-xs font-bold uppercase text-slate-500">{t("therapist.messages.thread")}</p>
              {selected.replies.map((r, i) => (
                <div key={i} className="rounded-lg bg-black/25 p-3">
                  <p className="text-xs font-bold text-teal-400">{r.from}</p>
                  <p className="mt-1 text-sm text-slate-300">{r.text}</p>
                  <p className="mt-1 text-[10px] text-slate-500">{new Date(r.at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-6 border-t border-white/10 pt-4">
            <label htmlFor="reply" className="text-xs font-bold uppercase text-slate-500">
              {t("therapist.messages.reply")}
            </label>
            <textarea
              id="reply"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={t("therapist.messages.replyPlaceholder")}
              rows={4}
              className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
            />
            <button
              type="button"
              disabled={sending || !replyText.trim()}
              onClick={sendReply}
              className="mt-3 rounded-lg bg-teal-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              {sending ? t("therapist.common.sending") : t("therapist.messages.sendReply")}
            </button>
          </div>
        </TherapistModal>
      ) : null}
    </div>
  );
}
