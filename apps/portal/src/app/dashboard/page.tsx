"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, BookOpen, CalendarCheck, CheckCircle2, HeartPulse, MessageCircle, PartyPopper, PawPrint, Sparkles, Target, Users, Zap } from "lucide-react";
import { WeekBarChart, EmotionDonut } from "@/components/bridge/Charts";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/StateBlock";
import { useAuth } from "@/components/AuthProvider";
import { isAdminRole } from "@family-support/data";
import { useLanguage } from "@/components/LanguageProvider";
import { useSupportPathway } from "@/components/SupportPathwayProvider";
import { QuickSetupCard } from "@/components/dashboard/QuickSetupCard";
import { BridgePetDashboardWidget } from "@/components/bridge-pets/BridgePetDashboardWidget";
import { useCompanionPet } from "@/components/pets/CompanionPetProvider";
import { pickStressReliefActivity, type StressReliefActivity } from "@family-support/data";

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
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<{ id: string; name: string }[]>([]);
  const [profilesLoaded, setProfilesLoaded] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [quickSetupHidden, setQuickSetupHidden] = useState(false);
  const [stressActivity, setStressActivity] = useState<StressReliefActivity | null>(null);
  const { awardXp, updatePet, state: petState } = useCompanionPet();

  const load = useCallback(() => {
    if (!profileId) return;
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
    if (!user) return;
    if (isAdminRole(user.role)) {
      router.replace("/admin");
      return;
    }
    if (user.role === "caregiver_therapist_teacher") {
      router.replace("/therapist");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (authLoading || !user) return;
    fetch("/api/profiles")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setProfiles(list);
        if (list.length > 0) {
          setProfileId((current) => current ?? list[0].id);
        }
      })
      .finally(() => setProfilesLoaded(true));
  }, [authLoading, user]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(id);
  }, [load]);

  useEffect(() => {
    if (!profileId || !snapshot || user?.isDemo) return;

    const hasActivity =
      snapshot.tasksCompletedPct > 0 ||
      snapshot.routinesCompletedPct > 0 ||
      snapshot.checkInsCount > 0 ||
      snapshot.newSkillsCount > 0;

    const skipped = window.localStorage.getItem(`bridge.quickSetup.skipped.${profileId}`);
    const remindAt = window.localStorage.getItem(`bridge.quickSetup.remindAt.${profileId}`);
    const reminderActive = remindAt ? new Date(remindAt).getTime() > Date.now() : false;
    const shouldHideQuickSetup = Boolean(skipped) || reminderActive || hasActivity;
    const id = window.setTimeout(() => {
      setQuickSetupHidden(shouldHideQuickSetup);
    }, 0);

    if (!hasActivity) {
      const key = `bridge.quickSetup.incompleteNotified.${profileId}`;
      if (!window.localStorage.getItem(key)) {
        window.localStorage.setItem(key, new Date().toISOString());
        void fetch("/api/quick-setup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          cache: "no-store",
          body: JSON.stringify({
            action: "quick_setup_incomplete",
            profileId,
            childName: snapshot.childName,
            reason: "New real user has not completed Quick Setup or created trackable activity.",
          }),
        }).catch(() => undefined);
      }
    }
    return () => window.clearTimeout(id);
  }, [profileId, snapshot, user?.isDemo]);

  const generateSummary = async () => {
    if (!profileId) return;
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
    if (!aiSummary || !profileId) return;
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

  const runDashboardStressReset = async () => {
    const activity = pickStressReliefActivity(Date.now());
    setStressActivity(activity);
    await updatePet({ mood: "overwhelmed_support" });
    await awardXp("stress_relief_reset", {
      source: activity.source,
      activityId: activity.id,
      activityTitle: activity.title,
      category: activity.category,
      pointsAwarded: activity.pointsAwarded,
      noDailyLimit: true,
      location: "parent_today_dashboard",
    });
  };

  if (authLoading || !profilesLoaded) return <LoadingBlock label={t("parent.dashboard.loading")} />;

  if (!profiles.length) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-6">
        <EmptyBlock message={t("parent.dashboard.noProfile")} />
        <div className="flex flex-wrap gap-3">
          <Link href="/profiles" className="btn-primary px-4 py-2 text-sm">
            {t("parent.dashboard.createProfile")}
          </Link>
          <Link href="/onboarding" className="btn-secondary px-4 py-2 text-sm">
            {t("parent.dashboard.restartOnboarding")}
          </Link>
        </div>
      </main>
    );
  }

  if (loading) return <LoadingBlock label={t("parent.dashboard.loading")} />;
  if (error) return <ErrorBlock message={error} />;
  if (!snapshot || !profileId) return <EmptyBlock message={t("parent.dashboard.noData")} />;

  const hasActivity =
    snapshot.tasksCompletedPct > 0 ||
    snapshot.routinesCompletedPct > 0 ||
    snapshot.checkInsCount > 0 ||
    snapshot.newSkillsCount > 0;

  const stats = [
    { label: t("parent.dashboard.tasksCompleted"), value: hasActivity ? `${snapshot.tasksCompletedPct}%` : "0%" },
    { label: t("parent.dashboard.routinesCompleted"), value: hasActivity ? `${snapshot.routinesCompletedPct}%` : "0%" },
    { label: t("parent.dashboard.checkIns"), value: String(snapshot.checkInsCount) },
    { label: t("parent.dashboard.newSkills"), value: String(snapshot.newSkillsCount) },
  ];

  const todaysPlan = [
    { title: "Morning routine", detail: "Keep it small, visual, and predictable.", href: "/routines", icon: CalendarCheck },
    { title: "Goal step", detail: "Pick one trackable goal for today.", href: "/goals", icon: Target },
    { title: "Communication practice", detail: "Use one card, script, or choice prompt.", href: "/communication", icon: MessageCircle },
    { title: "Reward goal", detail: "Choose a reward that feels motivating.", href: "/rewards", icon: PartyPopper },
  ];

  const quickSetupSteps = [
    { title: "Set first goals", href: "/goals", icon: Target },
    { title: "Create routines", href: "/routines", icon: CalendarCheck },
    { title: "Notification preferences", href: "/settings", icon: Bell },
    { title: "Invite care team", href: "/care-team", icon: Users },
    { title: "Talk to Nuvio", href: "/tess/chat", icon: MessageCircle },
    { title: "Try Stressed Out reset", href: "#stressed-out", icon: Zap },
  ];

  return (
    <main className="parent-today mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6">
      <section className="parent-today-hero">
        <div className="relative z-10">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-violet-200">Today</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">
            Good to see you. Here’s {snapshot.childName}’s support day.
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-violet-100/90">
            {pathway.name} pathway · Nuvio is watching for small wins, reset moments, and practical next steps. {t("common.safetyDisclaimer")}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button id="stressed-out" type="button" className="parent-stress-btn" onClick={() => void runDashboardStressReset()}>
              <Zap className="h-5 w-5" /> Stressed Out?
            </button>
            <Link href="/tess/chat" className="parent-hero-btn">
              <MessageCircle className="h-5 w-5" /> Talk to Nuvio
            </Link>
            {profiles.length > 1 ? (
              <select
                className="rounded-full border border-white/20 bg-white/10 px-4 py-3 text-sm font-black text-white"
                value={profileId}
                onChange={(e) => setProfileId(e.target.value)}
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            ) : null}
          </div>
          {stressActivity ? (
            <p className="mt-4 rounded-2xl border border-emerald-200/40 bg-emerald-400/15 px-4 py-3 text-sm font-bold text-emerald-50">
              +20 points — Nuvio is growing. Let’s try this: {stressActivity.title}.
            </p>
          ) : null}
        </div>
        <div className="parent-hero-orb">
          <PawPrint className="h-12 w-12" />
          <span>{petState?.pet?.xp ?? 0}</span>
          <small>Nuvio points</small>
        </div>
      </section>

      {!hasActivity ? (
        <>
          {!quickSetupHidden ? (
            <QuickSetupCard
              profileId={profileId}
              childName={snapshot.childName}
              onDismiss={() => setQuickSetupHidden(true)}
            />
          ) : (
            <p className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm text-[var(--text-secondary)]">
              {t("parent.dashboard.emptyState")} Quick Setup is available anytime from Goals, Routines, Settings, and Care Team.
            </p>
          )}
        </>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <article key={s.label} className="parent-glass-card">
            <p className="stat-label">{s.label}</p>
            <p className="stat-value">{s.value}</p>
          </article>
        ))}
        <article className="parent-glass-card">
          <p className="stat-label">Nuvio Recommendation</p>
          <p className="text-sm font-bold text-slate-700">Start with one routine, one reset, and one celebration.</p>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <article className="parent-card p-6">
          <div className="flex items-center gap-3">
            <HeartPulse className="h-5 w-5 text-violet-600" />
            <h2 className="text-xl font-black text-slate-950">Family Snapshot</h2>
          </div>
          <p className="mt-2 text-sm text-slate-500">Overall mood, progress, streaks, weekly wins, and Nuvio’s next best nudge.</p>
          <div className="mt-4">
            {snapshot.weekChart.some((d) => d.tasks > 0 || d.routines > 0 || d.checkIns > 0) ? (
              <WeekBarChart data={snapshot.weekChart} />
            ) : (
              <p className="text-sm text-[var(--text-secondary)]">{t("parent.dashboard.noProgressYet")}</p>
            )}
          </div>
        </article>
        <article className="parent-card p-6">
          <h2 className="text-xl font-black text-slate-950">Overall Mood</h2>
          <div className="mt-4">
            {snapshot.emotionBreakdown.length ? (
              <EmotionDonut emotions={snapshot.emotionBreakdown} />
            ) : (
              <p className="text-sm text-[var(--text-secondary)]">{t("parent.dashboard.noEmotions")}</p>
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
        <article className="parent-card p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600">Today’s Plan</p>
              <h2 className="mt-1 text-xl font-black text-slate-950">Make today trackable</h2>
            </div>
            <Sparkles className="h-6 w-6 text-yellow-500" />
          </div>
          <div className="mt-4 grid gap-3">
            {todaysPlan.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.title} href={item.href} className="parent-plan-row">
                  <Icon className="h-5 w-5" />
                  <span><strong>{item.title}</strong><small>{item.detail}</small></span>
                </Link>
              );
            })}
          </div>
        </article>

        <BridgePetDashboardWidget />
      </section>

      {!hasActivity ? (
        <section className="parent-card p-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600">Warm setup</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">New here? Build the first support loop.</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {quickSetupSteps.map((step) => {
              const Icon = step.icon;
              return (
                <Link key={step.title} href={step.href} className="parent-setup-tile">
                  <Icon className="h-5 w-5" />
                  {step.title}
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="parent-card border-2 border-violet-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600">Nuvio Summary</p>
            <h3 className="font-black text-slate-950">Review and approve support insights</h3>
          </div>
          <button
            type="button"
            className="btn-primary px-4 py-2 text-sm"
            onClick={generateSummary}
            disabled={aiLoading}
          >
            {aiLoading
              ? "Generating…"
              : aiSummary
                ? "Regenerate Nuvio Summary"
                : "Generate Nuvio Summary"}
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
              <Link href="/tess/chat" className="btn-secondary px-4 py-2 text-sm">
                Edit with Nuvio
              </Link>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-[var(--text-tertiary)]">
            Nuvio can review routines, tasks, check-ins, and wins to suggest practical next steps for your family.
          </p>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Link href="/library" className="parent-card p-5 transition hover:shadow-md">
          <BookOpen className="h-5 w-5 text-violet-600" />
          <h3 className="mt-3 font-bold">Parent Education</h3>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Lessons, insurance paths, and pathway resources.</p>
        </Link>
        <Link href="/tess/chat" className="parent-card p-5 transition hover:shadow-md">
          <MessageCircle className="h-5 w-5 text-violet-600" />
          <h3 className="mt-3 font-bold">Nuvio Assistant</h3>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Create routines, stories, practice ideas, and reset plans.</p>
        </Link>
        <Link href="/my-space" className="parent-card p-5 transition hover:shadow-md">
          <CheckCircle2 className="h-5 w-5 text-violet-600" />
          <h3 className="mt-3 font-bold">{t("parent.dashboard.quickLinks.mySpace")}</h3>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{t("parent.dashboard.quickLinks.mySpaceDesc")}</p>
        </Link>
      </section>
    </main>
  );
}
