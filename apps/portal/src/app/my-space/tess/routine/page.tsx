"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useProfile } from "@/components/ProfileProvider";
import { LoadingBlock } from "@/components/StateBlock";

type Routine = {
  id: string;
  title: string;
  steps: { title: string; supportTip?: string }[];
};

export default function MySpaceTessRoutinePage() {
  const { activeProfile } = useProfile();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [active, setActive] = useState<Routine | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [helpReply, setHelpReply] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/routines?childProfileId=${activeProfile?.id ?? "cp1"}`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setRoutines(list);
        if (list[0]) setActive(list[0]);
        setLoading(false);
      });
  }, [activeProfile?.id]);

  const askTess = async (prompt: string) => {
    setHelpReply(null);
    const res = await fetch("/api/tess/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: prompt,
        childProfileId: activeProfile?.id ?? "cp1",
        mode: "routine_helper",
      }),
    });
    const data = await res.json();
    setHelpReply(data.message?.content ?? "You can take a break anytime.");
  };

  if (loading) return <LoadingBlock label="Loading routines…" />;

  const step = active?.steps[stepIndex];

  return (
    <div className="ms-page ms-page-pad-bottom mx-auto max-w-lg px-4 py-6">
      <Link href="/my-space/tess" className="mb-4 flex items-center gap-1 text-sm font-bold text-[var(--ms-accent)]">
        <ArrowLeft className="h-4 w-4" /> Tess
      </Link>

      <h1 className="text-xl font-extrabold">Routine helper</h1>

      {routines.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--ms-muted)]">No routines yet. Ask a parent to add one.</p>
      ) : (
        <>
          <select
            className="mt-4 w-full rounded-xl border-2 px-3 py-2 text-sm font-bold"
            value={active?.id ?? ""}
            onChange={(e) => {
              const r = routines.find((x) => x.id === e.target.value) ?? null;
              setActive(r);
              setStepIndex(0);
            }}
          >
            {routines.map((r) => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </select>

          {active && step ? (
            <div className="mt-6 rounded-2xl border-2 border-[var(--ms-accent)] bg-[var(--ms-card)] p-6">
              <p className="text-xs font-bold uppercase text-[var(--ms-muted)]">
                Step {stepIndex + 1} of {active.steps.length}
              </p>
              <p className="mt-2 text-lg font-extrabold">{step.title}</p>
              {step.supportTip ? <p className="mt-2 text-sm text-[var(--ms-muted)]">{step.supportTip}</p> : null}
            </div>
          ) : null}

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" className="tess-btn-large bg-[var(--ms-accent-soft)] text-sm" onClick={() => askTess("What step am I on in my routine?")}>
              What step am I on?
            </button>
            <button type="button" className="tess-btn-large bg-[var(--ms-accent-soft)] text-sm" onClick={() => step && askTess(`Help me with this step: ${step.title}`)}>
              Help with this step
            </button>
            <button type="button" className="tess-btn-large bg-[var(--ms-accent-soft)] text-sm" onClick={() => step && askTess(`Make this step easier: ${step.title}`)}>
              Make easier
            </button>
            <button type="button" className="tess-btn-large bg-amber-100 text-sm" onClick={() => askTess("I need a break from my routine")}>
              I need a break
            </button>
            <button
              type="button"
              className="tess-btn-large bg-green-100 text-sm"
              onClick={() => {
                if (active && stepIndex < active.steps.length - 1) setStepIndex((i) => i + 1);
              }}
            >
              I finished
            </button>
            <button type="button" className="tess-btn-large bg-[var(--ms-card)] text-sm" onClick={() => setStepIndex((i) => i + 1)}>
              Skip for now
            </button>
          </div>

          {helpReply ? <div className="mt-4 rounded-xl bg-[var(--ms-accent-soft)] p-4 text-sm">{helpReply}</div> : null}
        </>
      )}
    </div>
  );
}
