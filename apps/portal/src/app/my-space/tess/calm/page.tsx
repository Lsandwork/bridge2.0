"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useProfile } from "@/components/ProfileProvider";

const CALM_OPTIONS = [
  { id: "quiet", label: "Quiet", prompt: "I want quiet" },
  { id: "space", label: "Space", prompt: "I need space" },
  { id: "movement", label: "Movement", prompt: "I want movement" },
  { id: "help", label: "Help", prompt: "I need help" },
  { id: "water", label: "Water", prompt: "I need water" },
  { id: "no-talking", label: "No talking", prompt: "I need no talking right now" },
  { id: "pressure", label: "Deep pressure", prompt: "I want deep pressure" },
  { id: "unknown", label: "I do not know", prompt: "I do not know what I need. Can you help me choose?" },
];

export default function MySpaceTessCalmPage() {
  const { activeProfile } = useProfile();
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const choose = async (prompt: string) => {
    if (!activeProfile?.id) return;
    setLoading(true);
    setResponse(null);
    const res = await fetch("/api/tess/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: prompt,
        childProfileId: activeProfile.id,
        mode: "calm",
      }),
    });
    const data = await res.json();
    setResponse(data.message?.content ?? "Tess is here. You can pick another option or take a break.");
    setLoading(false);
  };

  return (
    <div className="ms-page ms-page-pad-bottom mx-auto max-w-lg px-4 py-6">
      <Link href="/my-space/tess" className="mb-4 flex items-center gap-1 text-sm font-bold text-[var(--ms-accent)]">
        <ArrowLeft className="h-4 w-4" /> Tess
      </Link>

      <h1 className="text-xl font-extrabold">What do you need right now?</h1>
      <p className="mt-1 text-sm text-[var(--ms-muted)]">Pick one. You can say no. You can take a break.</p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {CALM_OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            disabled={loading}
            className="rounded-2xl border-2 border-[var(--ms-accent-soft)] bg-[var(--ms-card)] p-5 text-center text-sm font-extrabold"
            onClick={() => choose(o.prompt)}
          >
            {o.label}
          </button>
        ))}
      </div>

      {loading ? <p className="mt-6 text-center text-sm font-bold text-[var(--ms-muted)]">Tess is thinking…</p> : null}
      {response ? (
        <div className="mt-6 rounded-2xl bg-[var(--ms-accent-soft)] p-4 text-sm leading-relaxed">{response}</div>
      ) : null}

      <Link href="/my-space/tess/chat?prompt=I%20need%20a%20break" className="mt-6 block text-center text-sm font-bold text-[var(--ms-accent)]">
        I need a break
      </Link>
    </div>
  );
}
