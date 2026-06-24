"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getNextRewardProgress } from "@family-support/core";
import { useLanguage } from "@/components/LanguageProvider";
import { useProfile } from "@/components/ProfileProvider";

type Reward = { id: string; title: string; pointsRequired: number; emoji?: string };
type Hub = {
  balance: number;
  rewards: Reward[];
  redemptions: { rewardTitle: string; status: string }[];
  gameSettings?: { pointsEarnedToday: number; dailyPointsCap: number };
};

export default function MySpaceRewardsPage() {
  const { activeProfile } = useProfile();
  const { t } = useLanguage();
  const [hub, setHub] = useState<Hub | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!activeProfile) return;
    fetch(`/api/rewards?profileId=${activeProfile.id}`)
      .then((r) => r.json())
      .then(setHub);
  }, [activeProfile]);

  const nextReward = useMemo(
    () => (hub ? getNextRewardProgress(hub.balance, hub.rewards) : null),
    [hub]
  );

  async function redeem(rewardId: string) {
    if (!activeProfile) return;
    setMessage(null);
    const res = await fetch("/api/rewards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "redeem", profileId: activeProfile.id, rewardId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? t("rewards.couldNotRedeem"));
      return;
    }
    setHub(data.hub);
    setMessage(t("rewards.requestSent"));
  }

  if (!activeProfile) {
    return (
      <main className="px-4 py-10 text-center">
        <Link href="/my-space" className="font-bold text-[var(--ms-accent)]">
          {t("myspace.pickProfileLink")}
        </Link>
      </main>
    );
  }

  const nextDetail = nextReward
    ? nextReward.remaining > 0
      ? t("rewards.moreStars", { count: String(nextReward.remaining) })
      : t("rewards.ready")
    : "";

  return (
    <main className="ms-page ms-page-pad-bottom mx-auto max-w-lg px-4 py-6">
      <div className="token-board ms-card p-5">
        <p className="token-board-kicker">{t("rewards.starJar")}</p>
        <p className="token-board-balance">⭐ {hub?.balance ?? 0}</p>
        {nextReward ? (
          <>
            <p className="token-board-next">
              {t("rewards.nextReward", { title: nextReward.title, detail: nextDetail })}
            </p>
            <div className="token-board-track" aria-hidden>
              {Array.from({ length: 10 }).map((_, i) => (
                <span
                  key={i}
                  className={`token-board-pip ${i / 10 < nextReward.progress ? "filled" : ""}`}
                />
              ))}
            </div>
          </>
        ) : null}
        {hub?.gameSettings ? (
          <p className="token-board-day">
            {t("rewards.todayFromGames", {
              earned: String(hub.gameSettings.pointsEarnedToday),
              cap: String(hub.gameSettings.dailyPointsCap),
            })}
          </p>
        ) : null}
      </div>

      <h1 className="mt-6 text-2xl font-extrabold">{t("rewards.shopTitle")}</h1>
      <p className="text-sm text-[var(--ms-muted)]">{t("rewards.shopDesc")}</p>

      {message ? <p className="ms-card mt-4 p-4 text-center font-bold text-emerald-700">{message}</p> : null}

      <div className="mt-6 space-y-3">
        {(hub?.rewards ?? []).map((r) => {
          const canAfford = (hub?.balance ?? 0) >= r.pointsRequired;
          const need = r.pointsRequired - (hub?.balance ?? 0);
          return (
            <div key={r.id} className="ms-card flex items-center justify-between gap-3 p-5">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{r.emoji ?? "⭐"}</span>
                <div>
                  <p className="font-extrabold">{r.title}</p>
                  <p className="text-sm font-bold text-[var(--ms-accent)]">
                    {t("rewards.stars", { count: String(r.pointsRequired) })}
                  </p>
                  {!canAfford ? (
                    <p className="text-xs text-[var(--ms-muted)]">{t("rewards.moreToGo", { count: String(need) })}</p>
                  ) : null}
                </div>
              </div>
              <button
                type="button"
                disabled={!canAfford}
                className="ms-btn ms-btn-primary shrink-0 px-4 py-2 text-sm disabled:opacity-40"
                onClick={() => redeem(r.id)}
              >
                {t("rewards.getIt")}
              </button>
            </div>
          );
        })}
      </div>

      {hub?.redemptions?.length ? (
        <section className="ms-card mt-6 p-5">
          <h2 className="font-extrabold">{t("rewards.yourRequests")}</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {hub.redemptions.map((r, i) => (
              <li key={i}>
                {r.rewardTitle} — <span className="font-bold">{r.status}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
