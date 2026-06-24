"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useProfile } from "@/components/ProfileProvider";
import { LoadingBlock } from "@/components/StateBlock";

type Exercise = {
  id: string;
  title: string;
  goal: string;
  steps: string[];
  timerMinutes: number;
};

export default function MySpaceTessPracticePage() {
  const { activeProfile } = useProfile();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [explain, setExplain] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    fetch(`/api/exercises?childProfileId=${activeProfile?.id ?? "cp1"}`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setExercises(list);
        setLoading(false);
      });
  }, [activeProfile?.id]);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setInterval(() => setTimer((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [timer]);

  const explainSkill = async (ex: Exercise) => {
    setSelected(ex);
    setStepIndex(0);
    const res = await fetch("/api/tess/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Explain this skill in simple steps: ${ex.title}. Goal: ${ex.goal}`,
        childProfileId: activeProfile?.id ?? "cp1",
        mode: "skill_practice",
      }),
    });
    const data = await res.json();
    setExplain(data.message?.content ?? ex.goal);
    setTimer(ex.timerMinutes * 60);
  };

  if (loading) return <LoadingBlock label="Loading exercises…" />;

  return (
    <div className="ms-page ms-page-pad-bottom mx-auto max-w-lg px-4 py-6">
      <Link href="/my-space/tess" className="mb-4 flex items-center gap-1 text-sm font-bold text-[var(--ms-accent)]">
        <ArrowLeft className="h-4 w-4" /> Tess
      </Link>

      <h1 className="text-xl font-extrabold">Skill practice</h1>

      {!selected ? (
        <div className="mt-4 space-y-2">
          {exercises.length === 0 ? (
            <p className="text-sm text-[var(--ms-muted)]">No exercises assigned yet.</p>
          ) : (
            exercises.map((ex) => (
              <button
                key={ex.id}
                type="button"
                className="w-full rounded-2xl border-2 border-[var(--ms-accent-soft)] bg-[var(--ms-card)] p-4 text-left"
                onClick={() => explainSkill(ex)}
              >
                <p className="font-extrabold">{ex.title}</p>
                <p className="text-xs text-[var(--ms-muted)]">{ex.goal}</p>
              </button>
            ))
          )}
        </div>
      ) : (
        <>
          <p className="mt-2 font-extrabold">{selected.title}</p>
          {explain ? <div className="mt-3 rounded-xl bg-[var(--ms-accent-soft)] p-4 text-sm">{explain}</div> : null}
          {selected.steps[stepIndex] ? (
            <div className="mt-4 rounded-2xl border-2 p-4">
              <p className="text-xs font-bold uppercase">Step {stepIndex + 1}</p>
              <p className="mt-1 font-bold">{selected.steps[stepIndex]}</p>
            </div>
          ) : null}
          {timer > 0 ? (
            <p className="mt-3 text-center text-2xl font-extrabold text-[var(--ms-accent)]">
              {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
            </p>
          ) : null}
          <div className="mt-4 flex gap-2">
            <button type="button" className="flex-1 rounded-xl bg-[var(--ms-accent)] py-3 text-sm font-bold text-white" onClick={() => setStepIndex((i) => i + 1)}>
              Next step
            </button>
            <button type="button" className="flex-1 rounded-xl border-2 py-3 text-sm font-bold" onClick={() => setSelected(null)}>
              Done
            </button>
          </div>
        </>
      )}
    </div>
  );
}
