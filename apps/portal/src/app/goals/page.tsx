"use client";

import { useEffect, useState } from "react";
import { EmptyBlock, LoadingBlock } from "@/components/StateBlock";
import { useLanguage } from "@/components/LanguageProvider";

type Goal = { id: string; childProfileId: string; title: string; current: number; target: number };

export default function GoalsPage() {
  const { t } = useLanguage();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [profiles, setProfiles] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", childProfileId: "cp1", target: 5 });

  useEffect(() => {
    Promise.all([
      fetch("/api/routines").then((r) => r.json()),
      fetch("/api/profiles").then((r) => r.json()),
    ]).then(([data, profs]) => {
      setGoals(data.goals ?? []);
      setProfiles(Array.isArray(profs) ? profs : []);
      setLoading(false);
    });
  }, []);

  const addGoal = async () => {
    if (!form.title.trim()) return;
    const res = await fetch("/api/bridge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create-goal", ...form, current: 0 }),
    });
    const goal = await res.json();
    if (res.ok) {
      setGoals((prev) => [...prev, goal]);
      setForm((f) => ({ ...f, title: "" }));
    }
  };

  const bumpProgress = async (id: string, current: number, target: number) => {
    const next = Math.min(current + 1, target);
    const res = await fetch("/api/bridge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update-goal", id, current: next }),
    });
    if (res.ok) setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, current: next } : g)));
  };

  if (loading) return <LoadingBlock label={t("parent.goals.loading")} />;

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h2 className="text-2xl font-extrabold">{t("parent.goals.title")}</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">{t("parent.goals.subtitle")}</p>

      <section className="card mt-6 p-5">
        <h3 className="font-bold">{t("parent.goals.addGoal")}</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <input
            className="rounded-xl border px-3 py-2 md:col-span-2"
            placeholder={t("parent.goals.titlePlaceholder")}
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <select className="rounded-xl border px-3 py-2" value={form.childProfileId} onChange={(e) => setForm((f) => ({ ...f, childProfileId: e.target.value }))}>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button type="button" className="btn-primary py-2" onClick={addGoal}>{t("parent.goals.submit")}</button>
        </div>
      </section>

      {goals.length === 0 ? (
        <EmptyBlock message={t("parent.goals.empty")} />
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {goals.map((goal) => {
            const pct = Math.round((goal.current / goal.target) * 100);
            return (
              <article key={goal.id} className="card p-5">
                <p className="text-xs font-semibold uppercase text-[var(--text-tertiary)]">
                  {profiles.find((p) => p.id === goal.childProfileId)?.name}
                </p>
                <h3 className="mt-1 font-bold">{goal.title}</h3>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-[var(--brand-light)]">
                  <div className="h-full rounded-full bg-[var(--brand)]" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span>{t("parent.goals.progress", { current: String(goal.current), target: String(goal.target) })}</span>
                  <button
                    type="button"
                    className="text-sm font-bold text-[var(--brand)]"
                    onClick={() => bumpProgress(goal.id, goal.current, goal.target)}
                    disabled={goal.current >= goal.target}
                  >
                    {t("parent.goals.bumpProgress")}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
