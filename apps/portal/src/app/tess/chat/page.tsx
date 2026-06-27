"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PARENT_QUICK_PROMPTS } from "@family-support/core";
import { TessChat } from "@/components/tess/TessChat";
import { LoadingBlock } from "@/components/StateBlock";

function TessChatPageInner() {
  const params = useSearchParams();
  const [profileId, setProfileId] = useState(params.get("profile") ?? "");
  const [profiles, setProfiles] = useState<{ id: string; name: string }[]>([]);
  const initialPrompt = params.get("prompt");
  const startTalk = params.get("talk") === "1";

  useEffect(() => {
    fetch("/api/profiles").then((r) => r.json()).then((data) => {
      const list = Array.isArray(data) ? data : [];
      setProfiles(list);
      setProfileId((current) => current || list[0]?.id || "");
    });
  }, []);

  useEffect(() => {
    if (!initialPrompt || startTalk) return;
    const timer = setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>(".tess-chat input");
      if (input) {
        input.value = initialPrompt;
        input.form?.requestSubmit();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [initialPrompt, startTalk]);

  return (
    <main className="mx-auto flex h-[calc(100vh-5rem)] max-w-4xl flex-col p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <Link href="/tess" className="flex items-center gap-1 text-sm font-bold text-[var(--brand)]">
          <ArrowLeft className="h-4 w-4" /> Nuvio
        </Link>
        <select
          className="rounded-xl border px-3 py-2 text-sm"
          value={profileId}
          onChange={(e) => setProfileId(e.target.value)}
        >
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      <div className="tess-card flex flex-1 flex-col overflow-hidden">
        <TessChat
          childProfileId={profileId}
          quickActions={PARENT_QUICK_PROMPTS}
          header="Nuvio — Parent Assistant"
          mode="parent_assistant"
          defaultInputMode={startTalk ? "talk" : "text"}
          placeholder="Ask Nuvio about routines, social stories, exercises, or progress…"
        />
      </div>
    </main>
  );
}

export default function TessChatPage() {
  return (
    <Suspense fallback={<LoadingBlock label="Loading Nuvio chat…" />}>
      <TessChatPageInner />
    </Suspense>
  );
}
