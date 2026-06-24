"use client";

import { useEffect, useMemo, useState } from "react";
import type { TherapistDashboardSnapshot } from "@family-support/data";
import { LoadingBlock } from "@/components/StateBlock";
import { useLanguage } from "@/components/LanguageProvider";

type SortKey = "client" | "dueDate" | "progress";

export default function TherapistGoalsPage() {
  const { t } = useLanguage();
  const [goals, setGoals] = useState<TherapistDashboardSnapshot["goals"]>([]);
  const [clients, setClients] = useState<TherapistDashboardSnapshot["clients"]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortKey>("client");

  useEffect(() => {
    fetch("/api/therapist/dashboard")
      .then((r) => r.json())
      .then((d) => {
        setGoals(d.goals ?? []);
        setClients(d.clients ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const clientName = (clientId: string) =>
    clients.find((c) => c.id === clientId)?.demographics.name ?? t("therapist.common.unknownClient");

  const sortedClients = useMemo(
    () => [...clients].sort((a, b) => a.demographics.name.localeCompare(b.demographics.name)),
    [clients]
  );

  const visibleGoals = useMemo(() => {
    let list = selectedClientId === "all" ? [...goals] : goals.filter((g) => g.clientId === selectedClientId);

    list.sort((a, b) => {
      if (sortBy === "client") {
        const byClient = clientName(a.clientId).localeCompare(clientName(b.clientId));
        if (byClient !== 0) return byClient;
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (sortBy === "dueDate") return a.dueDate.localeCompare(b.dueDate);
      return b.currentProgress - a.currentProgress;
    });

    return list;
  }, [goals, clients, selectedClientId, sortBy, t]);

  const groupedByClient = useMemo(() => {
    if (selectedClientId !== "all") return null;
    const groups = new Map<string, TherapistDashboardSnapshot["goals"]>();
    for (const goal of visibleGoals) {
      const existing = groups.get(goal.clientId) ?? [];
      existing.push(goal);
      groups.set(goal.clientId, existing);
    }
    return [...groups.entries()].sort(([a], [b]) => clientName(a).localeCompare(clientName(b)));
  }, [visibleGoals, selectedClientId, clients, t]);

  if (loading) return <LoadingBlock label={t("therapist.goals.loading")} />;

  const selectedClient = selectedClientId !== "all" ? clients.find((c) => c.id === selectedClientId) : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">{t("therapist.goals.title")}</h1>
        <p className="mt-1 text-sm text-slate-400">{t("therapist.goals.subtitle")}</p>
      </div>

      <section className="th-card flex flex-wrap items-end gap-4 p-4">
        <div className="min-w-[10rem] flex-1">
          <label htmlFor="goal-client-filter" className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {t("therapist.common.client")}
          </label>
          <select
            id="goal-client-filter"
            value={selectedClientId}
            onChange={(e) => {
              setSelectedClientId(e.target.value);
              if (e.target.value !== "all") setSortBy("dueDate");
              else setSortBy("client");
            }}
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm font-semibold"
          >
            <option value="all">{t("therapist.goals.allClients", { count: String(goals.length) })}</option>
            {sortedClients.map((c) => {
              const count = goals.filter((g) => g.clientId === c.id).length;
              return (
                <option key={c.id} value={c.id}>
                  {c.demographics.name} ({count})
                </option>
              );
            })}
          </select>
        </div>

        <div className="min-w-[10rem] flex-1">
          <label htmlFor="goal-sort" className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {t("therapist.goals.sortBy")}
          </label>
          <select
            id="goal-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm font-semibold"
          >
            <option value="client">{t("therapist.goals.sort.clientName")}</option>
            <option value="dueDate">{t("therapist.goals.sort.dueDate")}</option>
            <option value="progress">{t("therapist.goals.sort.progress")}</option>
          </select>
        </div>

        <p className="text-sm text-slate-500">
          {t("therapist.goals.showing", {
            count: String(visibleGoals.length),
            forClient: selectedClient
              ? t("therapist.goals.forClient", { name: selectedClient.demographics.name })
              : "",
          })}
        </p>
      </section>

      {visibleGoals.length === 0 ? (
        <section className="th-card p-8 text-center text-sm text-slate-400">{t("therapist.goals.empty")}</section>
      ) : selectedClientId === "all" && sortBy === "client" && groupedByClient ? (
        <div className="space-y-8">
          {groupedByClient.map(([clientId, clientGoals]) => (
            <section key={clientId}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-lg font-extrabold text-teal-400">{clientName(clientId)}</h2>
                <span className="text-xs font-bold text-slate-500">
                  {t("therapist.goals.showing", { count: String(clientGoals.length), forClient: "" })}
                </span>
              </div>
              <div className="space-y-4">
                {clientGoals.map((g) => (
                  <GoalCard key={g.id} goal={g} clientName={clientName(g.clientId)} showClient={false} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {selectedClientId === "all" ? (
            <div className="hidden grid-cols-[1fr_2fr_auto_auto] gap-3 px-1 text-xs font-bold uppercase tracking-wide text-slate-500 sm:grid">
              <span>{t("therapist.goals.table.client")}</span>
              <span>{t("therapist.goals.table.goal")}</span>
              <span>{t("therapist.goals.table.due")}</span>
              <span className="text-right">{t("therapist.goals.table.progress")}</span>
            </div>
          ) : null}
          {visibleGoals.map((g) => (
            <GoalCard
              key={g.id}
              goal={g}
              clientName={clientName(g.clientId)}
              showClient={selectedClientId === "all"}
              listView={selectedClientId === "all"}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GoalCard({
  goal,
  clientName,
  showClient,
  listView = false,
}: {
  goal: TherapistDashboardSnapshot["goals"][number];
  clientName: string;
  showClient: boolean;
  listView?: boolean;
}) {
  const { t } = useLanguage();

  if (listView) {
    return (
      <article className="th-card grid gap-3 p-4 sm:grid-cols-[1fr_2fr_auto_auto] sm:items-center">
        <p className="text-sm font-bold text-teal-400">{clientName}</p>
        <div>
          <p className="font-extrabold">{goal.title}</p>
          <div className="th-bar-track mt-2 sm:hidden">
            <div className="th-bar-fill" style={{ width: `${goal.currentProgress}%` }} />
          </div>
        </div>
        <p className="text-xs text-slate-500">{goal.dueDate}</p>
        <p className="text-sm font-bold text-teal-400 sm:text-right">{goal.currentProgress}%</p>
      </article>
    );
  }

  return (
    <article className="th-card p-5">
      {showClient ? (
        <p className="text-xs font-bold uppercase tracking-wide text-teal-400">{clientName}</p>
      ) : null}
      <p className={`font-extrabold ${showClient ? "mt-1" : ""}`}>{goal.title}</p>
      <p className="text-sm text-slate-500">
        {showClient ? null : `${clientName} · `}
        {t("therapist.goals.targetBy", { target: String(goal.target), date: goal.dueDate })}
      </p>
      <div className="th-bar-track mt-3">
        <div className="th-bar-fill" style={{ width: `${goal.currentProgress}%` }} />
      </div>
      <p className="mt-2 text-sm font-bold text-teal-400">
        {t("therapist.goals.current", { progress: String(goal.currentProgress) })}
      </p>
      <p className="mt-2 text-xs text-slate-500">{t("therapist.goals.evidence")}</p>
    </article>
  );
}
