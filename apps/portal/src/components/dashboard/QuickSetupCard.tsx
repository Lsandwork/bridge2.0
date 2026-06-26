"use client";

import Link from "next/link";
import { Bell, Calendar, Check, ClipboardCheck, Target, UsersRound, X } from "lucide-react";

type QuickSetupCardProps = {
  profileId: string;
  childName: string;
  onDismiss: () => void;
};

const checklist = [
  {
    key: "goals",
    title: "Set first goals",
    body: "Add 1–3 practical goals so progress tracking starts from real priorities.",
    href: "/goals",
    icon: Target,
  },
  {
    key: "routines",
    title: "Create routines and tasks",
    body: "Add morning, school, therapy, or daily-living steps that Bridge can track.",
    href: "/routines",
    icon: Calendar,
  },
  {
    key: "notifications",
    title: "Choose notification preferences",
    body: "Decide what caregivers should be alerted about and what can wait.",
    href: "/settings",
    icon: Bell,
  },
  {
    key: "careTeam",
    title: "Invite care-team members",
    body: "Share the access code only with trusted therapists, caregivers, educators, or coordinators.",
    href: "/care-team",
    icon: UsersRound,
  },
] as const;

async function recordQuickSetup(action: string, profileId: string, childName: string, reason: string) {
  await fetch("/api/quick-setup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify({
      action,
      profileId,
      childName,
      reason,
      checklist: Object.fromEntries(checklist.map((item) => [item.key, false])),
    }),
  }).catch(() => undefined);
}

export function QuickSetupCard({ profileId, childName, onDismiss }: QuickSetupCardProps) {
  const skip = async () => {
    window.localStorage.setItem(`bridge.quickSetup.skipped.${profileId}`, new Date().toISOString());
    await recordQuickSetup("quick_setup_skipped", profileId, childName, "User skipped Quick Setup.");
    onDismiss();
  };

  const remindLater = async () => {
    const remindAt = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
    window.localStorage.setItem(`bridge.quickSetup.remindAt.${profileId}`, remindAt);
    await recordQuickSetup("quick_setup_remind_later", profileId, childName, "User asked to be reminded later.");
    onDismiss();
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-indigo-200 bg-white shadow-sm">
      <div className="border-b border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-emerald-50 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Quick Setup</p>
            <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
              Set up Bridge for {childName}
            </h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              New profiles start with no stats on purpose. Complete these steps so Bridge can track real goals,
              routines, communication needs, notifications, and care-team access with a clean baseline.
            </p>
          </div>
          <button
            type="button"
            onClick={skip}
            className="inline-flex min-h-10 items-center gap-1 rounded-full border border-slate-200 px-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            <X className="h-4 w-4" /> Skip
          </button>
        </div>
      </div>

      <div className="grid gap-3 p-5 md:grid-cols-2">
        {checklist.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => {
                void recordQuickSetup("quick_setup_started", profileId, childName, `Started ${item.title}.`);
              }}
              className="group rounded-2xl border border-slate-200 p-4 transition hover:border-indigo-300 hover:bg-indigo-50/40"
            >
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-indigo-100 text-indigo-700">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <strong className="block text-sm text-slate-950">{item.title}</strong>
                  <small className="mt-1 block text-sm leading-5 text-slate-600">{item.body}</small>
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
          <ClipboardCheck className="h-4 w-4 text-indigo-600" />
          Bridge will remind you if setup is still incomplete.
        </span>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={remindLater} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100">
            Remind me later
          </button>
          <Link href="/goals" className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700">
            <Check className="h-4 w-4" /> Start setup
          </Link>
        </div>
      </div>
    </section>
  );
}
