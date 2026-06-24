"use client";

import { useEffect, useState } from "react";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/StateBlock";
import { useLanguage } from "@/components/LanguageProvider";

type Task = { id: string; childProfileId: string; title: string; status: string; points: number; dueAt: string };

const TASK_STATUS_KEYS: Record<string, string> = {
  completed: "parent.routines.status.completed",
  skipped: "parent.routines.status.skipped",
  pending: "parent.routines.status.pending",
};

export default function TasksPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [profiles, setProfiles] = useState<{ id: string; name: string }[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    Promise.all([
      fetch("/api/routines").then((r) => r.json()),
      fetch("/api/profiles").then((r) => r.json()),
    ])
      .then(([data, profs]) => {
        setTasks(data.tasks ?? []);
        setProfiles(Array.isArray(profs) ? profs : []);
      })
      .catch((e) => setError(e instanceof Error ? e.message : t("common.failedToLoad")))
      .finally(() => setLoading(false));
  }, [t]);

  const completeTask = async (taskId: string) => {
    const res = await fetch("/api/bridge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "complete-task", taskId }),
    });
    const updated = await res.json();
    if (res.ok) {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: "completed" } : t)));
    }
  };

  const filtered = filter === "all" ? tasks : tasks.filter((t) => t.childProfileId === filter);
  const profileName = (id: string) => profiles.find((p) => p.id === id)?.name ?? id;

  if (loading) return <LoadingBlock label={t("parent.tasks.loading")} />;
  if (error) return <ErrorBlock message={error} />;

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold">{t("parent.tasks.title")}</h2>
          <p className="text-sm text-[var(--text-secondary)]">{t("parent.tasks.subtitle")}</p>
        </div>
        <select className="rounded-xl border px-3 py-2 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">{t("parent.tasks.filterAll")}</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyBlock message={t("parent.tasks.empty")} />
      ) : (
        <div className="mt-6 space-y-3">
          {filtered.map((task) => (
            <article key={task.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-xs font-semibold uppercase text-[var(--text-tertiary)]">{profileName(task.childProfileId)}</p>
                <p className="text-lg font-bold">{task.title}</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {t("parent.tasks.points", { points: String(task.points) })} · {t("parent.tasks.due", { date: task.dueAt.slice(0, 10) })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    task.status === "completed"
                      ? "bg-emerald-100 text-emerald-800"
                      : task.status === "skipped"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-[var(--brand-light)] text-[var(--brand-dark)]"
                  }`}
                >
                  {TASK_STATUS_KEYS[task.status] ? t(TASK_STATUS_KEYS[task.status]) : task.status}
                </span>
                {task.status === "pending" ? (
                  <button type="button" className="btn-primary px-4 py-2 text-sm" onClick={() => completeTask(task.id)}>
                    {t("parent.tasks.complete")}
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
