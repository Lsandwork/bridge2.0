"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/StateBlock";
import { useLanguage } from "@/components/LanguageProvider";

type Routine = { id: string; title: string; schedule: string; steps?: { title: string; supportTip?: string }[] };
type Task = { id: string; title: string; status: string };
type Goal = { id: string; title: string; current: number; target: number };

const TASK_STATUS_KEYS: Record<string, string> = {
  completed: "parent.routines.status.completed",
  skipped: "parent.routines.status.skipped",
  pending: "parent.routines.status.pending",
};

export default function RoutinesPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    fetch("/api/routines")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setRoutines(data.routines);
        setTasks(data.tasks);
        setGoals(data.goals);
      })
      .catch((e) => setError(e instanceof Error ? e.message : t("parent.routines.loadFailed")))
      .finally(() => setLoading(false));
  }, [t]);

  if (loading) return <LoadingBlock label={t("parent.routines.loading")} />;
  if (error) return <ErrorBlock message={error} />;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-4 md:p-8">
      <section className="card p-6">
        <h2 className="text-2xl font-bold text-stone-900">{t("parent.routines.title")}</h2>
        <p className="mt-2 text-sm text-stone-600">{t("parent.routines.subtitle")}</p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="card p-6">
          <h3 className="text-lg font-bold text-stone-900">{t("parent.routines.section.routines")}</h3>
          {routines.length === 0 ? (
            <p className="mt-2 text-sm text-stone-500">{t("parent.routines.routinesEmpty")}</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {routines.map((routine) => (
                <li key={routine.id} className="rounded-lg border border-slate-200 p-3">
                  <p className="font-medium">{routine.title}</p>
                  <p className="text-sm text-stone-500">{routine.schedule}</p>
                  {"steps" in routine && Array.isArray(routine.steps) ? (
                    <ol className="mt-2 list-decimal pl-5 text-sm">
                      {routine.steps.map((step: { title: string; supportTip?: string }, i: number) => (
                        <li key={i}>{step.title}{step.supportTip ? ` — ${step.supportTip}` : ""}</li>
                      ))}
                    </ol>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="card p-6">
          <h3 className="text-lg font-bold text-stone-900">{t("parent.routines.section.tasks")}</h3>
          {tasks.length === 0 ? (
            <p className="mt-2 text-sm text-stone-500">{t("parent.routines.tasksEmpty")}</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {tasks.map((task) => (
                <li key={task.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm">
                  <span>{task.title}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${
                    task.status === "completed"
                      ? "bg-emerald-100 text-emerald-800"
                      : task.status === "skipped"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-700"
                  }`}>
                    {t(TASK_STATUS_KEYS[task.status] ?? "parent.routines.status.pending")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="card p-6">
          <h3 className="text-lg font-bold text-stone-900">{t("parent.routines.section.goals")}</h3>
          {goals.length === 0 ? (
            <EmptyBlock message={t("parent.routines.goalsEmpty")} />
          ) : (
            goals.map((goal) => (
              <div key={goal.id} className="mt-3">
                <div className="flex justify-between text-sm">
                  <span>{goal.title}</span>
                  <span>{t("parent.goals.progress", { current: String(goal.current), target: String(goal.target) })}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-slate-200">
                  <div className="h-2 rounded-full bg-brand" style={{ width: `${Math.min(100, (goal.current / goal.target) * 100)}%` }} />
                </div>
              </div>
            ))
          )}
        </article>

        <article className="card p-6">
          <h3 className="text-lg font-bold text-stone-900">{t("parent.routines.section.rewards")}</h3>
          <p className="mt-2 text-sm text-stone-600">{t("parent.routines.rewardsDesc")}</p>
          <div className="mt-2 flex gap-3 text-sm">
            <Link href="/rewards" className="font-bold text-brand hover:underline">
              {t("parent.routines.rewardsLink")}
            </Link>
            <Link href="/my-space" className="font-bold text-brand hover:underline">
              {t("parent.routines.mySpaceLink")}
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
