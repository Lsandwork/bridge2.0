"use client";

import { useEffect, useState } from "react";

type Conversation = {
  id: string;
  bridgeGroupName: string;
  subject: string | null;
  lastMessageAt: string;
  unreadCount: number;
};

type Message = {
  id: string;
  senderName: string;
  senderRole: string;
  body: string;
  createdAt: string;
};

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [bridgeGroupId, setBridgeGroupId] = useState("bg-demo-jasper");

  const loadConversations = async () => {
    const res = await fetch("/api/platform/messages");
    const data = await res.json();
    setConversations(data.conversations ?? []);
  };

  const loadMessages = async (conversationId: string) => {
    const res = await fetch(`/api/platform/messages?view=messages&conversationId=${conversationId}`);
    const data = await res.json();
    setMessages(data.messages ?? []);
    await fetch("/api/platform/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark-read", conversationId }),
    });
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selected) loadMessages(selected);
  }, [selected]);

  const send = async () => {
    if (!body.trim()) return;
    const conv = conversations.find((c) => c.id === selected);
    await fetch("/api/platform/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: selected ?? undefined,
        bridgeGroupId: conv ? undefined : bridgeGroupId,
        body,
      }),
    });
    setBody("");
    await loadConversations();
    if (selected) await loadMessages(selected);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Messages</h1>
        <p className="text-slate-600">Secure messages with your Bridge Group care team.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 p-3 font-medium dark:border-slate-800">Conversations</div>
          <ul className="max-h-[28rem] overflow-y-auto">
            {conversations.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setSelected(c.id)}
                  className={`w-full px-4 py-3 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 ${
                    selected === c.id ? "bg-indigo-50 dark:bg-indigo-950/30" : ""
                  }`}
                >
                  <p className="font-medium">{c.subject ?? c.bridgeGroupName}</p>
                  <p className="text-xs text-slate-500">{c.bridgeGroupName}</p>
                  {c.unreadCount > 0 ? (
                    <span className="mt-1 inline-block rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-white">
                      {c.unreadCount}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
            {conversations.length === 0 ? (
              <li className="p-4 text-sm text-slate-500">No conversations yet. Send a message to start.</li>
            ) : null}
          </ul>
        </div>
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-[28rem] flex-col">
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m) => (
                <div key={m.id} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                  <p className="text-xs font-semibold text-slate-500">
                    {m.senderName} · {m.senderRole.replace(/_/g, " ")}
                  </p>
                  <p className="mt-1 text-sm">{m.body}</p>
                </div>
              ))}
              {!selected && messages.length === 0 ? (
                <p className="text-sm text-slate-500">Select a conversation or compose a new message below.</p>
              ) : null}
            </div>
            <div className="border-t border-slate-100 p-3 dark:border-slate-800">
              <textarea
                className="w-full rounded-lg border border-slate-300 p-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                rows={3}
                placeholder="Write a message to your care team…"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
              <button
                type="button"
                onClick={send}
                className="mt-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
