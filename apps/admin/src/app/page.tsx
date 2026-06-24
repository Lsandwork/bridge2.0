"use client";

import { useEffect, useState } from "react";
import { SAFETY_DISCLAIMER } from "@family-support/core";
import Link from "next/link";

type Stats = {
  activeFamilies: number;
  openTickets: number;
  pendingAiReviews: number;
  safetyFlags: number;
  errorLogs24h: number;
  retention: string;
  trialingOrgs: number;
  pushDeliveryRate: string;
};

type Analytics = {
  loginsToday: number;
  logoutsToday: number;
  spectrumLoginsToday: number;
  activeUsers7d: number;
  openIssues: number;
  criticalIssues: number;
  totalUsers: number;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin?section=stats").then((res) => res.json()),
      fetch("/api/admin?section=analytics").then((res) => res.json()),
    ])
      .then(([statsData, analyticsData]) => {
        if (statsData.error) throw new Error(statsData.error);
        setStats(statsData);
        setAnalytics(analyticsData.error ? null : analyticsData);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load admin stats"));
  }, []);

  const opsCards = stats
    ? [
        ["Active families", stats.activeFamilies],
        ["Open support tickets", stats.openTickets],
        ["Pending AI reviews", stats.pendingAiReviews],
        ["Safety flags", stats.safetyFlags],
        ["Error logs (24h)", stats.errorLogs24h],
        ["Monthly retention", stats.retention],
        ["Stripe trialing orgs", stats.trialingOrgs],
        ["Push delivery rate", stats.pushDeliveryRate],
      ]
    : [];

  const liveCards = analytics
    ? [
        ["Logins today", analytics.loginsToday],
        ["Spectrum sign-ins", analytics.spectrumLoginsToday],
        ["Active users (7d)", analytics.activeUsers7d],
        ["Open site issues", analytics.openIssues],
        ["Critical issues", analytics.criticalIssues],
        ["Total auth accounts", analytics.totalUsers],
      ]
    : [];

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-4 md:p-8">
      <section className="card p-6">
        <h2 className="text-3xl font-semibold">Operations Overview</h2>
        <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">{SAFETY_DISCLAIMER}</p>
      </section>

      {error ? <section className="card p-6 text-red-700">{error}</section> : null}

      {!stats ? (
        <section className="card p-6">Loading admin metrics...</section>
      ) : (
        <>
          <section>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Live platform analytics</h3>
            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
              {liveCards.map(([label, value]) => (
                <article key={String(label)} className="card p-4">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="text-2xl font-semibold">{value}</p>
                </article>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Operations metrics</h3>
            <div className="grid gap-3 md:grid-cols-4">
              {opsCards.map(([label, value]) => (
                <article key={String(label)} className="card p-4">
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="text-2xl font-semibold">{value}</p>
                </article>
              ))}
            </div>
          </section>
        </>
      )}

      <section className="grid gap-4 lg:grid-cols-3">
        <Link href="/diagnostics" className="card p-5 transition hover:shadow-md">
          <h3 className="font-semibold">Diagnostics & accounts</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Manage all users, credits, per-course library access, passwords, and site issues.
          </p>
        </Link>
        <Link href="/users" className="card p-5 transition hover:shadow-md">
          <h3 className="font-semibold">Users & Roles</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Browse accounts and jump to full management.</p>
        </Link>
        <Link href="/library" className="card p-5 transition hover:shadow-md">
          <h3 className="font-semibold">Parent Library Content</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Preview education modules and course catalog.</p>
        </Link>
        <Link href="/ai-review" className="card p-5 transition hover:shadow-md">
          <h3 className="font-semibold">AI Review Logs</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Audit AI suggestions and safety language.</p>
        </Link>
        <Link href="/tess/safety" className="card p-5 transition hover:shadow-md">
          <h3 className="font-semibold">Tess Safety</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Review safety flags and Tess usage patterns.</p>
        </Link>
        <Link href="/support" className="card p-5 transition hover:shadow-md">
          <h3 className="font-semibold">Support Tickets</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Track open family and provider support requests.</p>
        </Link>
      </section>
    </main>
  );
}
