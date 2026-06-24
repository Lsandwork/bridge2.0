"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WeekBarChart, EmotionDonut } from "@/components/bridge/Charts";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/StateBlock";
import { useAuth } from "@/components/AuthProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { useSupportPathway } from "@/components/SupportPathwayProvider";
import { PathwayDashboard } from "@/components/dashboard/PathwayDashboard";

type Snapshot = {
  childName: string;
  childProfileId: string;
  tasksCompletedPct: number;
  routinesCompletedPct: number;
  checkInsCount: number;
  newSkillsCount: number;
  weekChart: { label: string; tasks: number; routines: number; checkIns: number }[];
  emotionBreakdown: { label: string; count: number; color: string }[];
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const { pathway } = useSupportPathway();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [profileId, setProfileId] = useState("cp1");
  const [profiles, setProfiles] = useState<{ id: string; name: string }[]>([]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/dashboard?profileId=${profileId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setSnapshot(data);
      })
      .catch((e) => setError(e instanceof Error ? e.message : t("parent.dashboard.loadFailed")))
      .finally(() => setLoading(false));
  }, [profileId, t]);

  useEffect(() => {
    if (authLoading) return;
    if (user?.role === "caregiver_therapist_teacher") {
      router.replace("/therapist");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    fetch("/api/profiles")
      .then((r) => r.json())
      .then((data) => setProfiles(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const generateSummary = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, save: false }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAiSummary(data.text);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : t("parent.dashboard.aiSummary.error"));
    } finally {
      setAiLoading(false);
    }
  };

  const approveSummary = async () => {
    if (!aiSummary) return;
    const res = await fetch("/api/ai/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId, save: true }),
    });
    if (res.ok) {
      const data = await res.json();
      setAiSummary(data.text);
      alert(t("parent.dashboard.aiSummary.saved"));
    }
  };

  if (pathway.id !== "autism") return <PathwayDashboard pathway={pathway} />;
  if (loading) return <LoadingBlock label={t("parent.dashboard.loading")} />;
  if (error) return <ErrorBlock message={error} />;
  if (!snapshot) return <EmptyBlock message={t("parent.dashboard.noData")} />;

  const stats = [
    { label: t("parent.dashboard.tasksCompleted"), value: `${snapshot.tasksCompletedPct}%` },
    { label: t("parent.dashboard.routinesCompleted"), value: `${snapshot.routinesCompletedPct}%` },
    { label: t("parent.dashboard.checkIns"), value: String(snapshot.checkInsCount) },
    { label: t("parent.dashboard.newSkills"), value: String(snapshot.newSkillsCount) },
  ];

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[var(--text-primary)]">
            {t("parent.dashboard.title", { name: snapshot.childName })}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-[var(--text-secondary)]">{t("common.safetyDisclaimer")}</p>
        </div>
        <select
          className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-semibold"
          value={profileId}
          onChange={(e) => setProfileId(e.target.value)}
        >
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <article key={s.label} className="stat-card">
            <p className="stat-label">{s.label}</p>
            <p className="stat-value">{s.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="card p-6">
          <h3 className="font-bold text-[var(--text-primary)]">
            {t("parent.dashboard.weekAtGlance", { name: snapshot.childName })}
          </h3>
          <div className="mt-4">
            <WeekBarChart data={snapshot.weekChart} />
          </div>
        </article>
        <article className="card p-6">
          <h3 className="font-bold text-[var(--text-primary)]">{t("parent.dashboard.topEmotions")}</h3>
          <div className="mt-4">
            {snapshot.emotionBreakdown.length ? (
              <EmotionDonut emotions={snapshot.emotionBreakdown} />
            ) : (
              <p className="text-sm text-[var(--text-secondary)]">{t("parent.dashboard.noEmotions")}</p>
            )}
          </div>
        </article>
      </section>

      <section className="card border-2 border-[var(--brand-light)] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-bold text-[var(--text-primary)]">{t("parent.dashboard.aiSummary.title")}</h3>
          <button
            type="button"
            className="btn-primary px-4 py-2 text-sm"
            onClick={generateSummary}
            disabled={aiLoading}
          >
            {aiLoading
              ? t("parent.dashboard.aiSummary.generating")
              : aiSummary
                ? t("parent.dashboard.aiSummary.regenerate")
                : t("parent.dashboard.aiSummary.generate")}
          </button>
        </div>
        {aiError ? (
          <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{aiError}</p>
        ) : null}
        {aiSummary ? (
          <div className="mt-4 space-y-3">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-secondary)]">{aiSummary}</p>
            <div className="flex gap-2">
              <button type="button" className="btn-purple px-4 py-2 text-sm" onClick={approveSummary}>
                {t("parent.dashboard.aiSummary.approve")}
              </button>
              <Link href="/tess" className="btn-secondary px-4 py-2 text-sm">
                {t("parent.dashboard.aiSummary.editTess")}
              </Link>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-[var(--text-tertiary)]">
            {t("parent.dashboard.aiSummary.placeholder")}
          </p>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Link href="/library" className="card p-5 transition hover:shadow-md">
          <h3 className="font-bold">{t("parent.dashboard.quickLinks.library")}</h3>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{t("parent.dashboard.quickLinks.libraryDesc")}</p>
        </Link>
        <Link href="/tess" className="card p-5 transition hover:shadow-md">
          <h3 className="font-bold">{t("parent.dashboard.quickLinks.tess")}</h3>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{t("parent.dashboard.quickLinks.tessDesc")}</p>
        </Link>
        <Link href="/my-space" className="card p-5 transition hover:shadow-md">
          <h3 className="font-bold">{t("parent.dashboard.quickLinks.mySpace")}</h3>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{t("parent.dashboard.quickLinks.mySpaceDesc")}</p>
        </Link>
      </section>
    </main>
  );
}
