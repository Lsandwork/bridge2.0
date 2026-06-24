"use client";

import { useEffect, useState } from "react";
import { ErrorBlock, LoadingBlock } from "@/components/StateBlock";

type Task = { id: string; title: string; status: string };
type CheckIn = { id: string; type: string; value: string; notes?: string };
type Goal = { id: string; title: string; current: number; target: number };

export default function ProgressPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    fetch("/api/progress")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setTasks(data.tasks);
        setCheckIns(data.checkIns);
        setGoals(data.goals);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load progress"))
      .finally(() => setLoading(false));
  }, []);

  const exportPdf = () => {
    const report = [
      "Family Support Weekly Progress Report",
      "",
      `Completed tasks: ${tasks.filter((t) => t.status === "completed").length}`,
      `Skipped tasks: ${tasks.filter((t) => t.status === "skipped").length}`,
      `Emotion check-ins: ${checkIns.filter((c) => c.type === "emotion").length}`,
      `Sensory logs: ${checkIns.filter((c) => c.type === "sensory").length}`,
      "",
      "Goals:",
      ...goals.map((g) => `- ${g.title}: ${g.current}/${g.target}`),
    ].join("\n");
    const blob = new Blob([report], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "family-support-progress.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  if (loading) return <LoadingBlock label="Loading progress insights..." />;
  if (error) return <ErrorBlock message={error} />;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-4 md:p-8">
      <section className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-stone-900">Progress & Insights</h2>
            <p className="mt-2 text-sm text-stone-600">
              View emotion check-ins, sensory logs, task trends, and goal progress.
            </p>
          </div>
          <button className="rounded-lg bg-brand px-4 py-2 text-sm text-white" onClick={exportPdf}>
            Export report
          </button>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="card p-6">
          <h3 className="text-lg font-bold text-stone-900">Task trends</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {tasks.map((task) => (
              <li key={task.id} className="flex justify-between rounded-lg border border-slate-200 p-3">
                <span>{task.title}</span>
                <span className="capitalize">{task.status}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="card p-6">
          <h3 className="text-lg font-bold text-stone-900">Check-ins</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {checkIns.map((checkIn) => (
              <li key={checkIn.id} className="rounded-lg border border-slate-200 p-3">
                <p className="font-medium capitalize">{checkIn.type}: {checkIn.value}</p>
                {checkIn.notes ? <p className="text-stone-500">{checkIn.notes}</p> : null}
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
