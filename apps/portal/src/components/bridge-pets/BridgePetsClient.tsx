"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, ShieldCheck, TrendingUp, HeartHandshake, PawPrint } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { BridgePetCard } from "./BridgePetCard";
import type { BridgePetProfile } from "@/features/bridge-pets/petAssetManifest";

type BridgePetsClientProps = {
  pets: BridgePetProfile[];
};

const filters = ["All", "Teens", "Adults", "Focus support", "Routine support", "Calm support", "Ready-for-action", "Creative expression"];

export function BridgePetsClient({ pets }: BridgePetsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const [filter, setFilter] = useState("All");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [selectingSlug, setSelectingSlug] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const visiblePets = useMemo(() => {
    if (filter === "All") return pets;
    return pets.filter((pet) => pet.audienceTags.includes(filter) || pet.supportTags.includes(filter));
  }, [filter, pets]);

  useEffect(() => {
    if (loading || !user) return;
    fetch("/api/bridge-pets?section=selected", { credentials: "include", cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setSelectedSlug(data?.selected?.petSlug ?? null))
      .catch(() => undefined);
  }, [loading, user]);

  useEffect(() => {
    if (loading || !user) return;
    const pending = window.localStorage.getItem("bridge.pendingPet");
    if (!pending || searchParams.get("select") !== "1") return;
    void selectPet(pending, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, searchParams]);

  async function selectPet(slug: string, fromPending = false) {
    setMessage(null);
    if (!user) {
      window.localStorage.setItem("bridge.pendingPet", slug);
      router.push(`/login?next=${encodeURIComponent(`/bridge-pets/${slug}?select=1`)}`);
      return;
    }
    setSelectingSlug(slug);
    try {
      const res = await fetch("/api/bridge-pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({ action: "select", slug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not choose this companion.");
      window.localStorage.removeItem("bridge.pendingPet");
      setSelectedSlug(data.selected.petSlug);
      setMessage(`${data.selected.petName} is now in your corner. Growth starts at zero and builds with real activity.`);
      if (fromPending) router.replace(`/bridge-pets/${slug}`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not choose this companion.");
    } finally {
      setSelectingSlug(null);
    }
  }

  return (
    <main className="bridge-pets-root min-h-screen overflow-x-hidden bg-[#020617] bg-[radial-gradient(circle_at_15%_10%,rgba(139,92,246,0.24),transparent_32rem),radial-gradient(circle_at_85%_0%,rgba(34,211,238,0.16),transparent_30rem),linear-gradient(135deg,#020617,#070b18_50%,#0b1024)] p-4 text-white sm:p-8">
      <section className="bridge-pets-hero mx-auto grid max-w-7xl gap-5 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-black/40 backdrop-blur lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
        <div>
          <p className="bridge-pets-brand inline-flex items-center gap-2 font-black tracking-wide text-white">
            <PawPrint className="h-5 w-5" /> Bridge <span>PETS</span>
          </p>
          <h1 className="mt-4 max-w-4xl break-words text-3xl font-black leading-[1.02] tracking-[-0.05em] text-white min-[420px]:text-5xl sm:text-6xl lg:text-7xl">Companions for every pace, personality, and path.</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
            Premium support companions for focus, routines, emotional regulation, creative expression, adult goals, and
            ready-for-action resilience. They grow only through real engagement — no fake progress for new users.
          </p>
          <div className="bridge-pets-hero-actions mt-6 flex flex-wrap gap-3">
            <a href="#pet-lineup" className="bridge-pets-primary-action rounded-full bg-gradient-to-r from-yellow-300 to-violet-500 px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-violet-900/30 transition hover:-translate-y-0.5">Explore companions</a>
            <Link href="/bridge-pets/accessories" className="bridge-pets-secondary-action rounded-full border border-yellow-300/30 bg-yellow-300/10 px-5 py-3 text-sm font-black text-yellow-100 transition hover:-translate-y-0.5 hover:bg-yellow-300/20">Fan gear</Link>
            <Link href="/bridge-pets/sports-partnerships" className="bridge-pets-secondary-action rounded-full border border-violet-300/30 bg-violet-400/10 px-5 py-3 text-sm font-black text-violet-100 transition hover:-translate-y-0.5 hover:bg-violet-400/20">Partnerships</Link>
            <Link href="/dashboard" className="bridge-pets-secondary-action rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-white/15">Dashboard widget</Link>
          </div>
        </div>
        <div className="bridge-pets-hero-panel rounded-3xl border border-violet-400/30 bg-white/[0.06] p-5 shadow-inner shadow-violet-500/10">
          <Sparkles className="h-6 w-6 text-violet-300" />
          <h2 className="mt-3 text-2xl font-black text-violet-200">Your path. Your pace. Your partner.</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">Animated, movable companions designed to encourage healthy support habits without replacing human care.</p>
          <div className="bridge-pets-trust-grid mt-5 grid gap-3">
            <span className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/25 px-3 py-2 text-sm font-bold text-slate-200"><ShieldCheck className="h-4 w-4" /> Private by design</span>
            <span className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/25 px-3 py-2 text-sm font-bold text-slate-200"><TrendingUp className="h-4 w-4" /> Real progress only</span>
            <span className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/25 px-3 py-2 text-sm font-bold text-slate-200"><HeartHandshake className="h-4 w-4" /> Respectful support</span>
          </div>
        </div>
      </section>

      <section id="pet-lineup" className="bridge-pets-lineup mx-auto mt-6 max-w-7xl">
        <div className="bridge-pets-section-head flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="bridge-pets-kicker text-xs font-black uppercase tracking-[0.18em] text-violet-300">Character lineup</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">Choose a companion that fits the user, not a stereotype.</h2>
          </div>
          {message ? <p className="bridge-pets-status-message rounded-2xl border border-emerald-300/25 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-100">{message}</p> : null}
        </div>

        <div className="bridge-pets-filters flex gap-2 overflow-x-auto py-4" aria-label="Filter Bridge PETS companions">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              className={`shrink-0 rounded-full border px-3 py-2 text-xs font-black transition ${
                filter === item
                  ? "border-violet-300 bg-violet-500/30 text-white"
                  : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="bridge-pets-grid grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {visiblePets.map((pet) => (
            <BridgePetCard
              key={pet.slug}
              pet={pet}
              selectedSlug={selectedSlug}
              selecting={selectingSlug === pet.slug}
              onSelect={selectPet}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
