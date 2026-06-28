"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { NuvioPetCommandCenter } from "@/components/pets/NuvioPetCommandCenter";
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
      if (input) input.focus();
    }, 500);
    return () => clearTimeout(timer);
  }, [initialPrompt, startTalk]);

  return (
    <NuvioPetCommandCenter
      profileId={profileId}
      profiles={profiles}
      onProfileChange={setProfileId}
      initialPrompt={initialPrompt}
      startTalk={startTalk}
    />
  );
}

export default function TessChatPage() {
  return (
    <Suspense fallback={<LoadingBlock label="Loading Nuvio chat…" />}>
      <TessChatPageInner />
    </Suspense>
  );
}
