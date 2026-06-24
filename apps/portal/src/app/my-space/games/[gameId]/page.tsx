"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getGame } from "@family-support/core";
import { SpectrumGamePlayer } from "@/components/my-space/SpectrumGamePlayer";
import { useProfile } from "@/components/ProfileProvider";

type GameCompleteResponse = {
  pointsAwarded: number;
  status: "earned" | "practice";
  message: string;
  balance: number;
  earnSummary?: {
    pointsEarnedToday: number;
    dailyPointsCap: number;
    perGamePlaysToday: number;
    perGameDailyEarnLimit: number;
  };
};

export default function GamePlayPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;
  const game = getGame(gameId);
  const { activeProfile, lowStimulation } = useProfile();
  const [result, setResult] = useState<GameCompleteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!activeProfile || !game) return;
    fetch(`/api/rewards?profileId=${activeProfile.id}`)
      .then((r) => r.json())
      .then((hub) => {
        const ids: string[] = hub.gameSettings?.enabledGameIds ?? [];
        setAllowed(ids.length === 0 || ids.includes(gameId));
      })
      .catch(() => setAllowed(true));
  }, [activeProfile, game, gameId]);

  if (!activeProfile) {
    return (
      <main className="px-4 py-10 text-center">
        <Link href="/my-space" className="font-bold text-[var(--ms-accent)]">
          Pick a profile first →
        </Link>
      </main>
    );
  }

  if (!game) {
    return <main className="p-8 text-center">Game not found.</main>;
  }

  if (allowed === false) {
    return (
      <main className="mx-auto max-w-md px-4 py-10 text-center">
        <p className="text-lg font-extrabold">This game is turned off</p>
        <p className="mt-2 text-sm text-[var(--ms-muted)]">Ask a parent to enable it in Rewards & Games.</p>
        <Link href="/my-space/games" className="ms-btn ms-btn-primary mt-6 inline-flex">
          Back to arcade
        </Link>
      </main>
    );
  }

  async function logCheckIn(type: "emotion" | "sensory", value: string) {
    await fetch("/api/bridge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "check-in",
        childProfileId: activeProfile!.id,
        type,
        value,
        notes: `From game: ${game!.title}`,
      }),
    });
  }

  async function handleComplete() {
    try {
      const res = await fetch("/api/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "game-complete", profileId: activeProfile!.id, gameId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data as GameCompleteResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save progress");
    }
  }

  if (result) {
    const earned = result.status === "earned";
    return (
      <main className="mx-auto max-w-md px-4 py-10 text-center">
        <p className="text-5xl">{earned ? "🎉" : "🌟"}</p>
        {earned ? (
          <p className="mt-4 text-2xl font-extrabold">+{result.pointsAwarded} stars!</p>
        ) : (
          <p className="mt-4 text-xl font-extrabold">Practice mode</p>
        )}
        <p className="mt-3 text-[var(--ms-muted)]">{result.message}</p>
        <p className="mt-2 text-sm font-bold text-[var(--ms-accent)]">Balance: ⭐ {result.balance}</p>
        {result.earnSummary ? (
          <p className="mt-1 text-xs text-[var(--ms-muted)]">
            Today: {result.earnSummary.pointsEarnedToday} / {result.earnSummary.dailyPointsCap} stars · This game:{" "}
            {result.earnSummary.perGamePlaysToday} / {result.earnSummary.perGameDailyEarnLimit} earns
          </p>
        ) : null}
        <div className="mt-8 flex flex-col gap-3">
          <button type="button" className="ms-btn ms-btn-primary w-full" onClick={() => router.push("/my-space/games")}>
            {earned ? "Play another game" : "Back to arcade"}
          </button>
          {earned ? (
            <Link href="/my-space/rewards" className="text-sm font-bold text-[var(--ms-accent)]">
              Spend stars on rewards →
            </Link>
          ) : null}
        </div>
      </main>
    );
  }

  return (
    <main className="ms-page ms-page-pad-bottom mx-auto max-w-lg px-4 py-6">
      <Link href="/my-space/games" className="text-sm font-bold text-[var(--ms-accent)]">
        ← Arcade
      </Link>
      <div className="ms-card mt-4 p-6">
        <p className="text-3xl">{game.emoji}</p>
        <h1 className="mt-2 text-xl font-extrabold">{game.title}</h1>
        <p className="text-sm text-[var(--ms-muted)]">{game.description}</p>
        <p className="mt-2 rounded-xl bg-[var(--ms-accent-soft)] px-3 py-2 text-xs font-bold text-[var(--ms-text)]">
          ⭐ +{game.pointsPerPlay} stars every time you finish · same amount, always
        </p>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        <div className="mt-6">
          {allowed === null ? (
            <p className="text-center text-sm text-[var(--ms-muted)]">Loading game…</p>
          ) : (
            <SpectrumGamePlayer
              gameId={gameId}
              onComplete={handleComplete}
              onLogCheckIn={logCheckIn}
              lowStimulation={lowStimulation}
            />
          )}
        </div>
      </div>
    </main>
  );
}
