"use client";

import { TessVoiceMode } from "@/components/tess/TessVoiceMode";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useProfile } from "@/components/ProfileProvider";

export default function MySpaceTessVoicePage() {
  const { activeProfile } = useProfile();
  const profileId = activeProfile?.id ?? "cp1";

  return (
    <div className="ms-page ms-page-pad-bottom mx-auto flex max-w-lg min-h-[min(70dvh,32rem)] flex-col px-2 pb-4 pt-2 md:px-4">
      <Link href="/my-space/tess" className="mb-2 flex min-h-[2.75rem] items-center gap-1 px-2 text-sm font-bold text-[var(--ms-accent)]">
        <ArrowLeft className="h-4 w-4" /> Tess
      </Link>
      <div className="mx-4 flex flex-1 flex-col overflow-hidden rounded-2xl border-2 border-[var(--ms-accent-soft)] bg-[var(--ms-card)]">
        <TessVoiceMode
          childProfileId={profileId}
          mode="voice"
          compact
          onSwitchToText={() => {
            window.location.href = "/my-space/tess/chat";
          }}
        />
      </div>
    </div>
  );
}
