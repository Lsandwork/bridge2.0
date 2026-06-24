"use client";

import { useCallback, useEffect, useState } from "react";
import type { TherapistDashboardSnapshot } from "@family-support/data";
import { LoadingBlock } from "@/components/StateBlock";
import { useLanguage } from "@/components/LanguageProvider";

const BEHAVIOR_TYPES = [
  { value: "Meltdowns", labelKey: "therapist.behavior.type.meltdowns" },
  { value: "Shutdowns", labelKey: "therapist.behavior.type.shutdowns" },
  { value: "Aggression", labelKey: "therapist.behavior.type.aggression" },
  { value: "Elopement", labelKey: "therapist.behavior.type.elopement" },
  { value: "Self injury", labelKey: "therapist.behavior.type.selfInjury" },
  { value: "Anxiety episodes", labelKey: "therapist.behavior.type.anxiety" },
  { value: "Sleep issues", labelKey: "therapist.behavior.type.sleep" },
  { value: "Sensory overload", labelKey: "therapist.behavior.type.sensory" },
] as const;

export default function TherapistBehaviorPage() {
  const { t } = useLanguage();
  const [events, setEvents] = useState<TherapistDashboardSnapshot["recentBehaviors"]>([]);
  const [clients, setClients] = useState<TherapistDashboardSnapshot["clients"]>([]);
  const [insights, setInsights] = useState<TherapistDashboardSnapshot["patternInsights"]>([]);
  const [trends, setTrends] = useState<TherapistDashboardSnapshot["trends"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [clientId, setClientId] = useState("");
  const [type, setType] = useState<string>(BEHAVIOR_TYPES[0].value);
  const [severity, setSeverity] = useState(2);
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [trigger, setTrigger] = useState("");
  const [interventionUsed, setInterventionUsed] = useState("");
  const [outcome, setOutcome] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/therapist/dashboard");
    const d = await res.json();
    setEvents(d.recentBehaviors ?? []);
    setClients(d.clients ?? []);
    setInsights(d.patternInsights ?? []);
    setTrends(d.trends ?? null);
    setClientId((prev) => prev || d.clients?.[0]?.id || "");
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const logEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/therapist/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "log-behavior",
          behavior: {
            clientId,
            type,
            severity,
            durationMinutes,
            trigger: trigger || undefined,
            interventionUsed: interventionUsed || undefined,
            outcome: outcome || undefined,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("therapist.behavior.logFailed"));
      setTrigger("");
      setInterventionUsed("");
      setOutcome("");
      setToast(t("therapist.behavior.logged"));
      setTimeout(() => setToast(null), 3000);
      await load();
    } catch (err) {
      setToast(err instanceof Error ? err.message : t("therapist.behavior.logFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !trends) return <LoadingBlock label={t("therapist.behavior.loading")} />;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold">{t("therapist.behavior.title")}</h1>
        <p className="mt-1 text-sm text-slate-400">{t("therapist.behavior.subtitle")}</p>
      </div>

      {toast ? (
        <div className="rounded-lg border border-teal-500/30 bg-teal-500/10 px-4 py-3 text-sm font-semibold text-teal-300">
          {toast}
        </div>
      ) : null}

      <section className="th-card p-5">
        <h2 className="font-extrabold">{t("therapist.behavior.logNew")}</h2>
        <form onSubmit={logEvent} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-bold uppercase text-slate-500">{t("therapist.common.client")}</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
              required
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.demographics.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-slate-500">{t("therapist.behavior.eventType")}</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
            >
              {BEHAVIOR_TYPES.map((bt) => (
                <option key={bt.value} value={bt.value}>
                  {t(bt.labelKey)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-slate-500">{t("therapist.behavior.severity")}</label>
            <input
              type="number"
              min={1}
              max={5}
              value={severity}
              onChange={(e) => setSeverity(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-slate-500">{t("therapist.behavior.duration")}</label>
            <input
              type="number"
              min={1}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-bold uppercase text-slate-500">{t("therapist.behavior.trigger")}</label>
            <input
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
              placeholder={t("therapist.behavior.triggerPlaceholder")}
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-slate-500">{t("therapist.behavior.intervention")}</label>
            <input
              value={interventionUsed}
              onChange={(e) => setInterventionUsed(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-slate-500">{t("therapist.behavior.outcome")}</label>
            <input
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
            >
              {submitting ? t("therapist.common.logging") : t("therapist.behavior.submit")}
            </button>
          </div>
        </form>
      </section>

      <section className="th-card p-5">
        <h2 className="font-extrabold">{t("therapist.behavior.trackedTypes")}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {BEHAVIOR_TYPES.map((bt) => (
            <span key={bt.value} className="rounded-full bg-black/30 px-3 py-1 text-xs font-bold">
              {t(bt.labelKey)}
            </span>
          ))}
        </div>
      </section>

      <section className="th-card p-5">
        <h2 className="font-extrabold">{t("therapist.behavior.weeklyFrequency")}</h2>
        <div className="mt-4 flex h-32 items-end gap-2">
          {trends.weeklyBehaviorFrequency.map((d) => (
            <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
              <div className="w-full rounded-t bg-teal-500/80" style={{ height: `${Math.max(8, d.count * 18)}px` }} />
              <span className="text-[10px] font-bold text-slate-500">{d.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="th-card p-5">
        <h2 className="font-extrabold">{t("therapist.behavior.patternInsights")}</h2>
        <ul className="mt-3 space-y-2">
          {insights.map((i) => (
            <li key={i.id} className="rounded-lg bg-black/20 p-3 text-sm">
              {i.text}
            </li>
          ))}
        </ul>
      </section>

      <section className="th-card p-5">
        <h2 className="font-extrabold">{t("therapist.behavior.recentEvents")}</h2>
        <ul className="mt-3 space-y-2">
          {events.map((e) => {
            const client = clients.find((c) => c.id === e.clientId);
            return (
              <li key={e.id} className="rounded-lg border border-white/5 p-3 text-sm">
                <p className="font-bold">
                  {e.type}
                  {client ? <span className="font-normal text-slate-500"> · {client.demographics.name}</span> : null}
                </p>
                <p className="text-xs text-slate-500">
                  {t("therapist.dashboard.behaviorMeta", {
                    severity: String(e.severity),
                    minutes: String(e.durationMinutes),
                    by: e.reportedBy,
                  })}{" "}
                  · {new Date(e.timestamp).toLocaleString()}
                </p>
                {e.trigger ? (
                  <p className="text-xs text-slate-400">{t("therapist.dashboard.trigger", { trigger: e.trigger })}</p>
                ) : null}
                {e.interventionUsed ? <p className="text-xs text-slate-400">{e.interventionUsed}</p> : null}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
