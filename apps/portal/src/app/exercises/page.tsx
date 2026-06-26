"use client";

import { useEffect, useState } from "react";
import { exerciseTemplateSchema } from "@family-support/core";
import Link from "next/link";
import { EmptyBlock, LoadingBlock } from "@/components/StateBlock";
import { useLanguage } from "@/components/LanguageProvider";

type Exercise = {
  id: string;
  title: string;
  category: string;
  goal: string;
  steps: string[];
  difficulty: string;
  frequency: string;
  rewardIdea: string;
  promptLevel: string;
  timerMinutes: number;
};

const TEMPLATE_KEYS = [
  { value: "life_skill", key: "exercises.template.life_skill" },
  { value: "hygiene_skill", key: "exercises.template.hygiene_skill" },
  { value: "communication", key: "exercises.template.communication" },
  { value: "emotional_regulation", key: "exercises.template.emotional_regulation" },
  { value: "sensory", key: "exercises.template.sensory" },
  { value: "school_skill", key: "exercises.template.school_skill" },
] as const;

export default function ExercisesPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [profiles, setProfiles] = useState<{ id: string; name: string; ageGroup: string }[]>([]);
  const [form, setForm] = useState({
    title: "Making a Simple Snack",
    category: "life_skill",
    goal: "Independently prepare a simple snack with visual supports.",
    steps: "Gather ingredients\nWash hands\nSpread on plate\nClean up",
    promptLevel: "Gestural",
    timerMinutes: 15,
    difficulty: "easy",
    frequency: "daily",
    rewardIdea: "Choose a favorite show after",
    childProfileId: "",
    ageLevel: "8-12",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/exercises").then((r) => r.json()),
      fetch("/api/profiles").then((r) => r.json()),
    ]).then(([ex, profs]) => {
      setExercises(Array.isArray(ex) ? ex : []);
      const list = Array.isArray(profs) ? profs : [];
      setProfiles(list);
      if (list[0]) {
        setForm((current) => ({ ...current, childProfileId: current.childProfileId || list[0].id }));
      }
      setLoading(false);
    });
  }, []);

  const saveExercise = async () => {
    setError(null);
    setSuccess(null);
    const parsed = exerciseTemplateSchema.safeParse({
      ...form,
      timerMinutes: Number(form.timerMinutes),
      visualsEnabled: true,
      steps: form.steps.split("\n").map((s) => s.trim()).filter(Boolean),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Validation failed");
      return;
    }
    const res = await fetch("/api/exercises", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, steps: parsed.data.steps }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to save");
      return;
    }
    setExercises((prev) => [...prev, data]);
    setSuccess("Exercise saved and ready to assign.");
  };

  if (loading) return <LoadingBlock label={t("exercises.loading")} />;

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold">{t("exercises.title")}</h2>
          <p className="text-sm text-[var(--text-secondary)]">{t("exercises.subtitle")}</p>
        </div>
        <Link href="/tess/chat" className="btn-primary px-4 py-2 text-sm">
          {t("exercises.create")}
        </Link>
      </div>

      <section className="card mt-6 p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-xs font-bold uppercase text-[var(--text-tertiary)]">Template</span>
            <select className="mt-1 w-full rounded-xl border px-3 py-2" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
              {TEMPLATE_KEYS.map((tpl) => (
                <option key={tpl.value} value={tpl.value}>{t(tpl.key)}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase text-[var(--text-tertiary)]">Age / Level</span>
            <input className="mt-1 w-full rounded-xl border px-3 py-2" value={form.ageLevel} onChange={(e) => setForm((p) => ({ ...p, ageLevel: e.target.value }))} />
          </label>
          <label className="block md:col-span-2">
            <span className="text-xs font-bold uppercase text-[var(--text-tertiary)]">Title</span>
            <input className="mt-1 w-full rounded-xl border px-3 py-2" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          </label>
          <label className="block md:col-span-2">
            <span className="text-xs font-bold uppercase text-[var(--text-tertiary)]">Goal</span>
            <input className="mt-1 w-full rounded-xl border px-3 py-2" value={form.goal} onChange={(e) => setForm((p) => ({ ...p, goal: e.target.value }))} />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase text-[var(--text-tertiary)]">Difficulty</span>
            <select className="mt-1 w-full rounded-xl border px-3 py-2" value={form.difficulty} onChange={(e) => setForm((p) => ({ ...p, difficulty: e.target.value }))}>
              <option value="easy">Easy</option>
              <option value="moderate">Moderate</option>
              <option value="advanced">Advanced</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase text-[var(--text-tertiary)]">Frequency</span>
            <select className="mt-1 w-full rounded-xl border px-3 py-2" value={form.frequency} onChange={(e) => setForm((p) => ({ ...p, frequency: e.target.value }))}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="custom">Custom</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase text-[var(--text-tertiary)]">Prompt level</span>
            <input className="mt-1 w-full rounded-xl border px-3 py-2" value={form.promptLevel} onChange={(e) => setForm((p) => ({ ...p, promptLevel: e.target.value }))} />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase text-[var(--text-tertiary)]">Timer (minutes)</span>
            <input type="number" className="mt-1 w-full rounded-xl border px-3 py-2" value={form.timerMinutes} onChange={(e) => setForm((p) => ({ ...p, timerMinutes: Number(e.target.value) }))} />
          </label>
          <label className="block md:col-span-2">
            <span className="text-xs font-bold uppercase text-[var(--text-tertiary)]">Reward idea</span>
            <input className="mt-1 w-full rounded-xl border px-3 py-2" value={form.rewardIdea} onChange={(e) => setForm((p) => ({ ...p, rewardIdea: e.target.value }))} />
          </label>
          <label className="block md:col-span-2">
            <span className="text-xs font-bold uppercase text-[var(--text-tertiary)]">Steps (one per line)</span>
            <textarea className="mt-1 w-full rounded-xl border px-3 py-2" rows={5} value={form.steps} onChange={(e) => setForm((p) => ({ ...p, steps: e.target.value }))} />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase text-[var(--text-tertiary)]">Assign to</span>
            <select className="mt-1 w-full rounded-xl border px-3 py-2" value={form.childProfileId} onChange={(e) => setForm((p) => ({ ...p, childProfileId: e.target.value }))}>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>
        </div>
        <button type="button" className="btn-primary mt-4 px-6 py-2.5" onClick={saveExercise}>
          Save exercise
        </button>
        {success ? <p className="mt-2 text-sm font-semibold text-emerald-700">{success}</p> : null}
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      </section>

      {exercises.length === 0 ? (
        <EmptyBlock message={t("exercises.empty")} />
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {exercises.map((ex) => (
            <article key={ex.id} className="card p-5">
              <h3 className="font-bold">{ex.title}</h3>
              <p className="text-xs text-[var(--text-tertiary)]">{ex.category} · {ex.difficulty} · {ex.frequency}</p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{ex.goal}</p>
              <ol className="mt-3 space-y-1">
                {ex.steps.map((step, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="font-bold text-[var(--brand)]">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
              {ex.rewardIdea ? <p className="mt-2 text-xs font-semibold text-[var(--brand)]">Reward: {ex.rewardIdea}</p> : null}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
