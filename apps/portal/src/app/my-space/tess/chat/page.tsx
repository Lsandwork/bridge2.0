"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CHILD_QUICK_BUTTONS } from "@family-support/core";
import { TessScreen } from "@/components/tess/TessScreen";
import { useProfile } from "@/components/ProfileProvider";
import { LoadingBlock } from "@/components/StateBlock";
import type { TessViewMode } from "@/components/tess/tessTypes";

function ChatInner() {
  const params = useSearchParams();
  const { activeProfile } = useProfile();
  const profileId = activeProfile?.id ?? "cp1";
  const initialPrompt = params.get("prompt");
  const startTalk = params.get("talk") === "1";
  const viewParam = params.get("view");
  const initialViewMode: TessViewMode | undefined =
    viewParam === "chat" ? "chat" : viewParam === "fullscreen" ? "fullscreen" : undefined;

  useEffect(() => {
    if (!initialPrompt || startTalk) return;
    const timer = window.setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>(".tess-chat input, .tess-fullscreen__type-field");
      if (input) {
        input.value = initialPrompt;
        input.form?.requestSubmit();
      }
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [initialPrompt, startTalk]);

  return (
    <div className="ms-page ms-page-pad-bottom mx-auto flex max-w-lg flex-col px-2 pb-4 pt-2 md:px-4">
      <Link href="/my-space/tess" className="mb-2 flex min-h-[2.75rem] items-center gap-1 px-2 text-sm font-bold text-[var(--ms-accent)]">
        <ArrowLeft className="h-4 w-4" /> Tess
      </Link>
      <div className="mx-2 flex min-h-[min(75dvh,36rem)] flex-1 flex-col overflow-hidden rounded-2xl border-2 border-[var(--ms-accent-soft)] bg-[var(--ms-card)] md:mx-4">
        <TessScreen
          childProfileId={profileId}
          userName={activeProfile?.name ?? "friend"}
          quickActions={CHILD_QUICK_BUTTONS}
          mode="text"
          defaultInputMode={startTalk ? "talk" : "talk"}
          initialViewMode={initialViewMode}
          placeholder="Type here…"
        />
      </div>
    </div>
  );
}

export default function MySpaceTessChatPage() {
  return (
    <Suspense fallback={<LoadingBlock label="Loading Tess…" />}>
      <ChatInner />
    </Suspense>
  );
}
