"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, AlertTriangle, CalendarDays, ClipboardList, FileText, MessageSquare, Search, ShieldAlert, Sparkles, Users } from "lucide-react";
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
  const [query, setQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");

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
    { label: "Today’s Sessions", value: overview.sessionsThisWeek, icon: CalendarDays, href: "/therapist/clients" },
    { label: "Clients Assigned", value: overview.activeClients, icon: Users, href: "/therapist/clients" },
    { label: "Pending Reviews", value: overview.reauthorizationsDue, icon: ClipboardList, href: "/therapist/documentation" },
    { label: "Safety Alerts", value: overview.highPriorityAlerts, icon: ShieldAlert, href: "/safety-alerts" },
    { label: "Messages", value: overview.unreadParentMessages, icon: MessageSquare, href: "/therapist/messages" },
    { label: "Reports Due", value: overview.goalsCompletedThisMonth, icon: FileText, href: "/reports" },
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

  const filteredClients = clients.filter((client) => {
    const q = query.trim().toLowerCase();
    const hasOpenAlert = actionCenter.some((action) => action.clientName === client.demographics.name);
    const matchesQuery =
      !q ||
      client.demographics.name.toLowerCase().includes(q) ||
      client.demographics.diagnosis.join(" ").toLowerCase().includes(q);
    const matchesPriority =
      priorityFilter === "all" ||
      (priorityFilter === "alert" && hasOpenAlert) ||
      (priorityFilter === "progress" && client.goalsProgress < 60);
    return matchesQuery && matchesPriority;
  });

  const schedule = clients.slice(0, 4).map((client, index) => ({
    id: `${client.id}-session`,
    time: `${9 + index}:00 ${index < 3 ? "AM" : "PM"}`,
    name: client.demographics.name,
    detail: index % 2 === 0 ? "Caregiver note requested" : "Goal review + routine plan",
  }));

  return (
    <div className="therapist-workspace mx-auto max-w-7xl space-y-8">
      <section className="th-hero">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-teal-300">Care Team Workspace</p>
          <h1 className="mt-3 text-3xl font-black text-white sm:text-5xl">Today’s clinical support command center</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            Sessions, alerts, notes, reports, client progress, and Nuvio-generated reviews stay organized for human care-team approval.
          </p>
        </div>
        <div className="th-hero-grid">
          <span><strong>{overview.sessionsThisWeek}</strong> sessions</span>
          <span><strong>{overview.highPriorityAlerts}</strong> urgent alerts</span>
          <span><strong>{overview.reauthorizationsDue}</strong> pending reports</span>
          <span><strong>{overview.unreadParentMessages}</strong> unread messages</span>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="th-card th-kpi-card p-4">
            <s.icon className="h-5 w-5 text-teal-300" />
            <p className="th-stat-value">{s.value}</p>
            <p className="th-stat-label">{s.label}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <article className="th-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-300">Client Queue</p>
              <h2 className="font-extrabold">Assigned clients and open plans</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="th-search">
                <Search className="h-4 w-4" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search clients" />
              </label>
              <select className="th-filter" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>
                <option value="all">All</option>
                <option value="alert">Alerts</option>
                <option value="progress">Needs progress</option>
              </select>
            </div>
          </div>
          <div className="th-client-scroll mt-4 overflow-hidden rounded-2xl border border-white/10">
            <div className="th-client-table">
              <div className="th-client-head bg-white/5 px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <span>Client</span><span>Pathway</span><span>Mood</span><span>Goal progress</span><span>Plan</span>
              </div>
              {filteredClients.map((client) => (
                <div key={client.id} className="th-client-row border-t border-white/10 px-4 py-3 text-sm">
                  <div>
                    <p className="font-black text-white">{client.demographics.name}</p>
                    <p className="text-xs text-slate-500">Last check-in: recent</p>
                  </div>
                  <p className="text-slate-300">{client.demographics.diagnosis[0] ?? "Support"}</p>
                  <p className="font-bold text-teal-300">Steady</p>
                  <div>
                    <div className="th-bar-track"><div className="th-bar-fill" style={{ width: `${client.goalsProgress}%` }} /></div>
                    <p className="mt-1 text-xs text-slate-400">{client.goalsProgress}%</p>
                  </div>
                  <Link href={`/therapist/clients/${client.id}`} className="rounded-full bg-teal-400 px-3 py-1.5 text-center text-xs font-black text-slate-950">Open</Link>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="th-card p-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">Today’s Schedule</p>
          <h2 className="mt-1 font-extrabold">Sessions, notes, and requested reviews</h2>
          <ul className="mt-4 space-y-2">
            {schedule.map((item) => (
              <li key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-white">{item.name}</p>
                    <p className="text-xs text-slate-400">{item.detail}</p>
                  </div>
                  <span className="text-xs font-black text-teal-300">{item.time}</span>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="th-card p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-300" />
            <h2 className="font-extrabold">Action Center</h2>
          </div>
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
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-teal-300" />
            <h2 className="font-extrabold">Nuvio Review Center</h2>
          </div>
          <p className="mt-2 text-sm text-slate-400">Human review is required before recommendations, summaries, or safety-triggered reports are used in care decisions.</p>
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
          <Link href="/therapist/documentation" className="mt-4 inline-block text-sm font-bold text-teal-400">
            Open review queue
          </Link>
        </article>
      </section>

      <section className="th-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-teal-300" />
            <h2 className="font-extrabold">Progress Trends</h2>
          </div>
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
