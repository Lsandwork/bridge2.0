"use client";

import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Gift, Globe2, Handshake, LockKeyhole, ShieldCheck, Sparkles, Trophy, Users } from "lucide-react";

type SportsPartner = {
  slug: string;
  name: string;
  partnerType: string;
  licensingStatus: string;
  brandColors: { primary: string; accent: string };
  isActive: boolean;
};

const assetBase = "/assets/bridge-pets-sports/bridge_pets_sports_asset_pack";

const conceptIcons = [
  ["generic_cap", "Team-style caps"],
  ["generic_jersey", "Numbered jerseys"],
  ["generic_scarf", "City scarves"],
  ["generic_trophy", "Milestone trophies"],
  ["generic_ring", "Victory rings"],
  ["generic_pennant", "Fan pennants"],
  ["generic_backpack", "Locker packs"],
  ["generic_stadium", "Event auras"],
];

const marketCards = [
  ["Collect", "Generic fan drops, milestone packs, and event moments."],
  ["Represent", "Let users express hometown, school, clinic, group, or team-style identity."],
  ["Complete", "Healthy streaks and challenges unlock premium cosmetic rewards."],
  ["Celebrate", "Bridge turns progress into visible, safe, shareable companion moments."],
];

const monetization = [
  ["Limited edition drops", "Time-boxed original cosmetic sets."],
  ["Fan packs & bundles", "Grouped gear for events, groups, clinics, and communities."],
  ["Season pass access", "Optional premium cosmetic progression."],
  ["Premium upgrades", "Visual-only upgrades that never block care features."],
  ["Milestone unlocks", "Rewards tied to real Bridge engagement."],
];

export function SportsPartnershipsClient({ partners }: { partners: SportsPartner[] }) {
  return (
    <main className="min-h-screen bg-[#030712] text-white">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <Link href="/bridge-pets" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-violet-100 hover:bg-white/10">
            ← Bridge PETS
          </Link>
          <Link href="/bridge-pets/accessories" className="rounded-full border border-yellow-300/30 bg-yellow-300/10 px-4 py-2 text-yellow-100 hover:bg-yellow-300/20">
            Open fan gear →
          </Link>
        </nav>

        <header className="relative overflow-hidden rounded-[2rem] border border-violet-400/20 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,.18),transparent_32%),linear-gradient(135deg,#070b1a,#0b1024_58%,#170821)] p-5 shadow-2xl shadow-violet-950/40 sm:p-8">
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-yellow-300/60 to-transparent" />
          <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-violet-300">Bridge PETS · partnerships</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
                Sports <span className="text-violet-300">Partnerships</span>
              </h1>
              <p className="mt-4 max-w-3xl text-base text-slate-300 sm:text-lg">
                A licensing-ready system for future sports, school, creator, clinic, employer, and community drops — built with Bridge-owned placeholder assets until official partner files are approved.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {marketCards.map(([title, body]) => (
                  <article key={title} className="rounded-3xl border border-white/10 bg-white/[0.06] p-4">
                    <Trophy className="h-5 w-5 text-yellow-300" />
                    <h2 className="mt-3 font-black">{title}</h2>
                    <p className="mt-1 text-sm text-slate-300">{body}</p>
                  </article>
                ))}
              </div>
            </div>
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/25">
              <div className="min-h-72 bg-cover bg-center p-5" style={{ backgroundImage: `linear-gradient(180deg,rgba(3,7,18,.1),rgba(3,7,18,.95)),url(${assetBase}/png/backgrounds/arena_neon.png)` }}>
                <div className="rounded-2xl border border-white/10 bg-black/45 p-4 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-6 w-6 text-emerald-300" />
                    <div>
                      <h2 className="font-black">IP-safe today. License-ready tomorrow.</h2>
                      <p className="mt-1 text-sm text-slate-300">No team, league, flag, or official marks are used by default.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[.95fr_1.05fr]">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-4 flex items-center gap-3">
              <Globe2 className="h-5 w-5 text-violet-300" />
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-violet-200">Placeholder categories</p>
                <h2 className="text-2xl font-black">Partnership rails</h2>
              </div>
            </div>
            <div className="grid gap-3">
              {partners.map((partner) => (
                <article key={partner.slug} className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-black">{partner.name}</h3>
                      <p className="mt-1 text-sm text-slate-400">Generic category · no official marks loaded</p>
                    </div>
                    <span
                      className="rounded-full px-3 py-1 text-xs font-black uppercase"
                      style={{
                        backgroundColor: `${partner.brandColors.primary}22`,
                        color: partner.brandColors.accent,
                        border: `1px solid ${partner.brandColors.primary}66`,
                      }}
                    >
                      {partner.licensingStatus}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-violet-300/20 bg-violet-500/10 p-5">
            <div className="mb-4 flex items-center gap-3">
              <Gift className="h-5 w-5 text-yellow-300" />
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-yellow-200">Sports accessory concepts</p>
                <h2 className="text-2xl font-black">Original gear system</h2>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {conceptIcons.map(([icon, label]) => (
                <article key={icon} className="rounded-3xl border border-white/10 bg-black/35 p-4 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/5">
                    <Image src={`${assetBase}/png/icons/${icon}.png`} alt="" width={56} height={56} className="h-14 w-14 object-contain" />
                  </div>
                  <h3 className="mt-3 text-sm font-black">{label}</h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <article className="rounded-[1.75rem] border border-emerald-300/20 bg-emerald-300/10 p-5">
            <BadgeCheck className="h-6 w-6 text-emerald-300" />
            <h2 className="mt-3 text-xl font-black">Licensing guardrails</h2>
            <p className="mt-2 text-sm text-slate-300">
              Official brands stay disabled until a human admin verifies rights, uploads approved files, and changes the partner status from placeholder to approved.
            </p>
          </article>
          <article className="rounded-[1.75rem] border border-yellow-300/20 bg-yellow-300/10 p-5">
            <Users className="h-6 w-6 text-yellow-300" />
            <h2 className="mt-3 text-xl font-black">User bonding</h2>
            <p className="mt-2 text-sm text-slate-300">
              Drops can celebrate streaks, goals, groups, events, and support milestones without selling medical care or blocking essential support.
            </p>
          </article>
          <article className="rounded-[1.75rem] border border-violet-300/20 bg-violet-300/10 p-5">
            <Handshake className="h-6 w-6 text-violet-300" />
            <h2 className="mt-3 text-xl font-black">Partner-ready</h2>
            <p className="mt-2 text-sm text-slate-300">
              The data model can support future licensing, sponsorship, community packs, and branded collections without changing the companion core.
            </p>
          </article>
        </section>

        <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-4 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-violet-300" />
            <h2 className="text-2xl font-black">Monetization paths that stay respectful</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {monetization.map(([title, body]) => (
              <article key={title} className="rounded-3xl border border-white/10 bg-black/35 p-4">
                <LockKeyhole className="h-5 w-5 text-violet-200" />
                <h3 className="mt-3 font-black">{title}</h3>
                <p className="mt-1 text-sm text-slate-400">{body}</p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
