"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { TherapistDashboardSnapshot } from "@family-support/data";
import { LoadingBlock, ErrorBlock } from "@/components/StateBlock";
import { useLanguage } from "@/components/LanguageProvider";

function alertClass(level: string) {
  if (level === "critical") return "th-alert-critical";
  if (level === "high") return "th-alert-high";
  if (level === "medium") return "th-alert-medium";
  return "th-alert-low";
}

export default function TherapistDashboardPage() {
  const { t } = useLanguage();
  const [data, setData] = useState<TherapistDashboardSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/therapist/dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch((e) => setError(e instanceof Error ? e.message : t("therapist.common.loadFailed")));
  }, [t]);

  if (error) return <ErrorBlock message={error} />;
  if (!data) return <LoadingBlock label={t("therapist.dashboard.loading")} />;

  const { overview, actionCenter, clients, goals, recentBehaviors, patternInsights, messages, insurance, insuranceReadiness, trends } = data;

  const stats = [
    { labelKey: "therapist.dashboard.stats.activeClients", value: overview.activeClients },
    { labelKey: "therapist.dashboard.stats.sessionsThisWeek", value: overview.sessionsThisWeek },
    { labelKey: "therapist.dashboard.stats.reauthsDue", value: overview.reauthorizationsDue },
    { labelKey: "therapist.dashboard.stats.highPriority", value: overview.highPriorityAlerts },
    { labelKey: "therapist.dashboard.stats.unreadMessages", value: overview.unreadParentMessages },
    { labelKey: "therapist.dashboard.stats.goalsCompleted", value: overview.goalsCompletedThisMonth },
  ] as const;

  const trendItems = [
    { labelKey: "therapist.dashboard.monthlyImprovement", value: `+${trends.monthlyImprovementScore}%` },
    { labelKey: "therapist.dashboard.goalProgression", value: `${trends.goalProgression}%` },
    { labelKey: "therapist.dashboard.attendance", value: `${trends.attendanceTrend}%` },
    { labelKey: "therapist.dashboard.parentEngagement", value: `${trends.parentEngagementScore}%` },
    {
      labelKey: "therapist.dashboard.behaviorsThisWeek",
      value: String(trends.weeklyBehaviorFrequency.reduce((a, b) => a + b.count, 0)),
    },
  ] as const;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section>
        <h1 className="text-2xl font-extrabold">{t("therapist.dashboard.title")}</h1>
        <p className="mt-1 text-sm text-[var(--th-muted)]">{t("therapist.dashboard.subtitle")}</p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <article key={s.labelKey} className="th-card p-4">
            <p className="th-stat-label">{t(s.labelKey)}</p>
            <p className="th-stat-value">{s.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="th-card p-5">
          <h2 className="font-extrabold">{t("therapist.dashboard.actionCenter")}</h2>
          <ul className="mt-4 space-y-2">
            {actionCenter.map((a) => (
              <li key={a.id} className={`rounded-lg p-3 ${alertClass(a.level)}`}>
                <p className="text-sm font-bold">{a.title}</p>
                <p className="mt-0.5 text-xs text-slate-400">{a.detail}</p>
                {a.dueLabel ? <p className="mt-1 text-[10px] font-bold uppercase text-amber-400">{a.dueLabel}</p> : null}
              </li>
            ))}
          </ul>
        </article>

        <article className="th-card p-5">
          <h2 className="font-extrabold">{t("therapist.dashboard.insuranceReadiness")}</h2>
          <div className="mt-4 space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold">
                <span>{t("therapist.dashboard.documentationComplete")}</span>
                <span>{insuranceReadiness.documentationComplete}%</span>
              </div>
              <div className="th-bar-track mt-1">
                <div className="th-bar-fill" style={{ width: `${insuranceReadiness.documentationComplete}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold">
                <span>{t("therapist.dashboard.authorizationUsage")}</span>
                <span>{insuranceReadiness.authorizationUsage}%</span>
              </div>
              <div className="th-bar-track mt-1">
                <div className="th-bar-fill" style={{ width: `${insuranceReadiness.authorizationUsage}%` }} />
              </div>
            </div>
            <p className="text-sm text-slate-400">
              {t("therapist.dashboard.missingNotes", {
                count: String(insuranceReadiness.missingNotes),
                risk: insuranceReadiness.reauthorizationRisk,
              })}
            </p>
          </div>
          <Link href="/therapist/insurance" className="mt-4 inline-block text-sm font-bold text-teal-400">
            {t("therapist.dashboard.openInsurance")}
          </Link>
        </article>
      </section>

      <section className="th-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-extrabold">{t("therapist.dashboard.patterns")}</h2>
          <Link href="/therapist/behavior" className="text-sm font-bold text-teal-400">
            {t("therapist.dashboard.trendDashboard")}
          </Link>
        </div>
        <ul className="mt-4 space-y-2">
          {patternInsights.map((p) => (
            <li key={p.id} className={`rounded-lg p-3 text-sm ${alertClass(p.severity)}`}>
              {p.text}
            </li>
          ))}
        </ul>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {trendItems.map((item) => (
            <div key={item.labelKey} className="rounded-lg bg-black/20 p-3 text-center">
              <p className="text-lg font-extrabold text-teal-400">{item.value}</p>
              <p className="text-[10px] font-semibold uppercase text-slate-500">{t(item.labelKey)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="th-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold">{t("therapist.dashboard.activeGoals")}</h2>
            <Link href="/therapist/goals" className="text-sm font-bold text-teal-400">
              {t("therapist.common.viewAll")}
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {goals.map((g) => {
              const client = clients.find((c) => c.id === g.clientId);
              return (
                <li key={g.id} className="rounded-lg bg-black/20 p-3">
                  <p className="text-sm font-bold">{g.title}</p>
                  <p className="text-xs text-slate-500">
                    {client?.demographics.name} · {t("therapist.dashboard.dueDate", { date: g.dueDate })}
                  </p>
                  <div className="th-bar-track mt-2">
                    <div className="th-bar-fill" style={{ width: `${g.currentProgress}%` }} />
                  </div>
                  <p className="mt-1 text-xs font-bold text-teal-400">
                    {t("therapist.dashboard.progressTarget", {
                      progress: String(g.currentProgress),
                      target: String(g.target),
                    })}
                  </p>
                </li>
              );
            })}
          </ul>
        </article>

        <article className="th-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold">{t("therapist.dashboard.recentBehavior")}</h2>
            <Link href="/therapist/behavior" className="text-sm font-bold text-teal-400">
              {t("therapist.dashboard.logTrack")}
            </Link>
          </div>
          <ul className="mt-4 space-y-2">
            {recentBehaviors.map((b) => (
              <li key={b.id} className="rounded-lg border border-white/5 p-3 text-sm">
                <p className="font-bold">{b.type}</p>
                <p className="text-xs text-slate-500">
                  {t("therapist.dashboard.behaviorMeta", {
                    severity: String(b.severity),
                    minutes: String(b.durationMinutes),
                    by: b.reportedBy,
                  })}
                </p>
                {b.trigger ? (
                  <p className="mt-1 text-xs text-slate-400">{t("therapist.dashboard.trigger", { trigger: b.trigger })}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="th-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold">{t("therapist.dashboard.clientsPassports")}</h2>
          <Link href="/therapist/clients" className="text-sm font-bold text-teal-400">
            {t("therapist.dashboard.manageClients")}
          </Link>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {clients.map((c) => (
            <Link key={c.id} href={`/therapist/clients/${c.id}`} className="rounded-xl border border-white/10 p-4 transition hover:border-teal-500/40">
              <p className="font-extrabold">{c.demographics.name}</p>
              <p className="text-xs text-slate-500">{c.demographics.diagnosis.join(" · ")}</p>
              <p className="mt-2 text-xs text-slate-400 line-clamp-2">{c.passport.communicationStyle}</p>
              <p className="mt-2 text-sm font-bold text-teal-400">
                {t("therapist.dashboard.goalProgress", { pct: String(c.goalsProgress) })}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="th-card p-5">
          <h2 className="font-extrabold">{t("therapist.dashboard.messages")}</h2>
          <ul className="mt-4 space-y-2">
            {messages.map((m) => (
              <li key={m.id} className={`rounded-lg p-3 text-sm ${m.unread ? "bg-teal-500/10" : "bg-black/20"}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold">{m.from}</p>
                  {m.urgent ? (
                    <span className="text-[10px] font-bold uppercase text-red-400">{t("therapist.common.urgent")}</span>
                  ) : null}
                </div>
                <p className="text-xs text-slate-500">{m.role}</p>
                <p className="mt-1 text-slate-400">{m.preview}</p>
              </li>
            ))}
          </ul>
          <Link href="/therapist/messages" className="mt-4 inline-block text-sm font-bold text-teal-400">
            {t("therapist.dashboard.openMessaging")}
          </Link>
        </article>

        <article className="th-card p-5">
          <h2 className="font-extrabold">{t("therapist.dashboard.authAlerts")}</h2>
          <ul className="mt-4 space-y-2">
            {insurance.map((i) => (
              <li key={i.clientId} className="rounded-lg bg-black/20 p-3 text-sm">
                <p className="font-bold">{i.clientName}</p>
                <p className="text-xs text-slate-500">
                  {i.payer} · {i.authNumber}
                </p>
                <p className="mt-1 text-xs">
                  {t("therapist.dashboard.authUnits", {
                    used: String(i.usedUnits),
                    approved: String(i.approvedUnits),
                    days: String(i.daysRemaining),
                  })}
                </p>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}
