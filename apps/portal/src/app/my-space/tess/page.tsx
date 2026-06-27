"use client";

import Link from "next/link";
import { useProfile } from "@/components/ProfileProvider";
import { TessIcon } from "@/components/tess/TessIcon";
import { CHILD_QUICK_BUTTONS, TESS_DISCLAIMER } from "@family-support/core";

const QUICK_ACTIONS = [
  { href: "/my-space/tess/builder", label: "Build a sentence", emoji: "📝" },
  { href: "/my-space/tess/routine", label: "Start my routine", emoji: "📋" },
  { href: "/my-space/tess/chat?prompt=What%20is%20next%20on%20my%20schedule", label: "What is next?", emoji: "⏭️" },
  { href: "/my-space/tess/calm", label: "Calm-down help", emoji: "🌿" },
  { href: "/my-space/tess/chat?prompt=Tell%20my%20parent", label: "Tell my parent", emoji: "👨‍👩‍👧" },
  { href: "/my-space/tess/practice", label: "Practice a skill", emoji: "⭐" },
];

export default function MySpaceTessHomePage() {
  const { activeProfile, lowStimulation, setLowStimulation, simpleLanguage, setSimpleLanguage } = useProfile();

  return (
    <div className="ms-page ms-page-pad-bottom mx-auto max-w-lg px-4 py-6">
      <div className="flex items-center gap-3">
        <div className="tess-avatar">
          <TessIcon size={44} decorative />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-[var(--ms-text)]">Hi{activeProfile ? `, ${activeProfile.name}` : ""}!</h1>
          <p className="text-sm text-[var(--ms-muted)]">Nuvio is here to help.</p>
        </div>
      </div>

      <p className="mt-4 rounded-2xl bg-[var(--ms-accent-soft)] p-3 text-[11px] leading-relaxed text-[var(--ms-muted)]">
        {TESS_DISCLAIMER.slice(0, 180)}…
      </p>

      <div className="mt-6 space-y-3">
        <Link href="/my-space/tess/chat?talk=1" className="tess-btn-large block w-full bg-[var(--ms-accent)] text-white">
          Talk to Nuvio
        </Link>
        <Link href="/my-space/tess/chat" className="tess-btn-large block w-full border-2 border-[var(--ms-accent)] text-[var(--ms-accent)]">
          Type to Nuvio
        </Link>
        <Link
          href="/my-space/tess/chat?prompt=I%20need%20help"
          className="tess-btn-large block w-full bg-amber-100 text-amber-900"
        >
          I need help
        </Link>
        <Link
          href="/my-space/tess/chat?prompt=I%20need%20a%20break"
          className="tess-btn-large block w-full bg-sky-100 text-sky-900"
        >
          I need a break
        </Link>
        <Link href="/my-space/tess/calm" className="tess-btn-large block w-full bg-violet-100 text-violet-900">
          I feel…
        </Link>
      </div>

      <h2 className="mt-8 text-sm font-extrabold uppercase tracking-wide text-[var(--ms-muted)]">Quick actions</h2>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {QUICK_ACTIONS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="rounded-2xl border-2 border-[var(--ms-accent-soft)] bg-[var(--ms-card)] p-4 text-center"
          >
            <span className="text-2xl">{a.emoji}</span>
            <p className="mt-1 text-xs font-extrabold">{a.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-xs font-bold text-[var(--ms-muted)]">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={lowStimulation} onChange={(e) => setLowStimulation(e.target.checked)} />
          Calm mode
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={simpleLanguage} onChange={(e) => setSimpleLanguage(e.target.checked)} />
          Simple words
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {CHILD_QUICK_BUTTONS.slice(0, 8).map((b) => (
          <Link
            key={b.id}
            href={`/my-space/tess/chat?prompt=${encodeURIComponent(b.prompt)}`}
            className="rounded-full bg-[var(--ms-accent-soft)] px-3 py-1.5 text-[11px] font-extrabold"
          >
            {b.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
