"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageCircle, Settings, History, ClipboardList, Sparkles } from "lucide-react";
import { PARENT_QUICK_PROMPTS } from "@family-support/core";
import { LoadingBlock } from "@/components/StateBlock";
import { useLanguage } from "@/components/LanguageProvider";
import { TessIcon } from "@/components/tess/TessIcon";

type Stats = {
  pendingSuggestions: number;
  recentConversations: number;
  safetyFlags: number;
};

export default function TessDashboardPage() {
  const { t } = useLanguage();
  const [profileId, setProfileId] = useState("cp1");
  const [profiles, setProfiles] = useState<{ id: string; name: string }[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/profiles").then((r) => r.json()),
      fetch("/api/tess/suggestions?status=pending").then((r) => r.json()),
      fetch("/api/tess/conversations").then((r) => r.json()),
    ]).then(([profs, pending, convs]) => {
      setProfiles(Array.isArray(profs) ? profs : []);
      setStats({
        pendingSuggestions: Array.isArray(pending) ? pending.length : 0,
        recentConversations: Array.isArray(convs) ? convs.length : 0,
        safetyFlags: 0,
      });
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingBlock label={t("tess.loading")} />;

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="tess-avatar">
            <TessIcon size={44} decorative />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">{t("tess.title")}</h1>
            <p className="text-sm text-[var(--text-secondary)]">{t("tess.subtitle")}</p>
          </div>
        </div>
        <select
          className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm"
          value={profileId}
          onChange={(e) => setProfileId(e.target.value)}
        >
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <p className="mt-4 rounded-xl bg-[var(--tess-lavender,#e8e4f8)] p-4 text-xs leading-relaxed text-[var(--text-secondary)]">
        {t("tess.disclaimer")}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="tess-card p-5">
          <p className="text-xs font-bold uppercase text-[var(--text-tertiary)]">Pending review</p>
          <p className="mt-1 text-3xl font-extrabold text-[var(--brand)]">{stats?.pendingSuggestions ?? 0}</p>
          <Link href="/tess/suggestions" className="mt-2 inline-block text-sm font-bold text-[var(--brand)]">
            Review suggestions →
          </Link>
        </div>
        <div className="tess-card p-5">
          <p className="text-xs font-bold uppercase text-[var(--text-tertiary)]">Conversations</p>
          <p className="mt-1 text-3xl font-extrabold">{stats?.recentConversations ?? 0}</p>
          <Link href="/tess/history" className="mt-2 inline-block text-sm font-bold text-[var(--brand)]">
            View history →
          </Link>
        </div>
        <div className="tess-card p-5">
          <p className="text-xs font-bold uppercase text-[var(--text-tertiary)]">Quick start</p>
          <Link href={`/tess/chat?profile=${profileId}`} className="btn-primary mt-3 block text-center text-sm">
            Open Tess Chat
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/tess/chat", label: t("tess.chat"), icon: MessageCircle },
          { href: "/tess/suggestions", label: t("tess.suggestions"), icon: ClipboardList },
          { href: "/tess/history", label: t("tess.history"), icon: History },
          { href: "/tess/settings", label: t("tess.settings"), icon: Settings },
        ].map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="tess-card flex items-center gap-3 p-4 hover:shadow-md">
            <Icon className="h-5 w-5 text-[var(--brand)]" />
            <span className="font-bold text-sm">{label}</span>
          </Link>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="flex items-center gap-2 text-lg font-extrabold">
          <Sparkles className="h-5 w-5 text-[var(--brand)]" /> Suggested prompts
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {PARENT_QUICK_PROMPTS.map((qa) => (
            <Link
              key={qa.id}
              href={`/tess/chat?profile=${profileId}&prompt=${encodeURIComponent(qa.prompt)}`}
              className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-xs font-bold hover:bg-[var(--brand-light)]"
            >
              {qa.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
