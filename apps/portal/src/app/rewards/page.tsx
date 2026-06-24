"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { spectrumGames } from "@family-support/core";
import { VideoActivityPanel } from "@/components/VideoActivityPanel";
import { useLanguage } from "@/components/LanguageProvider";

type ProfileSummary = {
  profile: { id: string; name: string; ageGroup: string };
  balance: number;
  rewards: { id: string; title: string; pointsRequired: number; emoji?: string }[];
  pendingRedemptions: { id: string; rewardTitle: string; pointsSpent: number; status: string }[];
};

type HubDetail = {
  balance: number;
  pointEvents: { id: string; reason: string; amount: number; source: string; createdAt: string }[];
  gameSettings: {
    enabledGameIds: string[];
    dailyGameLimit: number;
    dailyEarnSessionLimit: number;
    perGameDailyEarnLimit: number;
    dailyPointsCap: number;
    sameGameCooldownMinutes: number;
    pointsEarnedToday: number;
    earnSessionsToday: number;
  };
  redemptions: { id: string; rewardTitle: string; status: string; pointsSpent: number }[];
};

export default function ParentRewardsPage() {
  const { t } = useLanguage();
  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<HubDetail | null>(null);
  const [newReward, setNewReward] = useState({ title: "", pointsRequired: 10, emoji: "⭐" });
  const [bonus, setBonus] = useState({ amount: 5, reason: "Great job today!" });
  const [message, setMessage] = useState<string | null>(null);

  const load = () => {
    fetch("/api/rewards")
      .then((r) => r.json())
      .then((data) => {
        setProfiles(data.profiles ?? []);
        if (!selectedId && data.profiles?.[0]) setSelectedId(data.profiles[0].profile.id);
      });
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    fetch(`/api/rewards?profileId=${selectedId}`)
      .then((r) => r.json())
      .then(setDetail);
  }, [selectedId]);

  const selected = profiles.find((p) => p.profile.id === selectedId);

  async function post(body: object) {
    setMessage(null);
    const res = await fetch("/api/rewards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? t("common.error"));
      return null;
    }
    load();
    if (selectedId) {
      const hub = await fetch(`/api/rewards?profileId=${selectedId}`).then((r) => r.json());
      setDetail(hub);
    }
    return data;
  }

  async function toggleGame(gameId: string) {
    if (!detail || !selectedId) return;
    const ids = detail.gameSettings.enabledGameIds.includes(gameId)
      ? detail.gameSettings.enabledGameIds.filter((id) => id !== gameId)
      : [...detail.gameSettings.enabledGameIds, gameId];
    await post({
      action: "update-games",
      profileId: selectedId,
      enabledGameIds: ids,
      dailyEarnSessionLimit: detail.gameSettings.dailyEarnSessionLimit,
      perGameDailyEarnLimit: detail.gameSettings.perGameDailyEarnLimit,
      dailyPointsCap: detail.gameSettings.dailyPointsCap,
      sameGameCooldownMinutes: detail.gameSettings.sameGameCooldownMinutes,
    });
  }

  async function saveLimits() {
    if (!detail || !selectedId) return;
    await post({
      action: "update-games",
      profileId: selectedId,
      enabledGameIds: detail.gameSettings.enabledGameIds,
      dailyEarnSessionLimit: detail.gameSettings.dailyEarnSessionLimit,
      perGameDailyEarnLimit: detail.gameSettings.perGameDailyEarnLimit,
      dailyPointsCap: detail.gameSettings.dailyPointsCap,
      sameGameCooldownMinutes: detail.gameSettings.sameGameCooldownMinutes,
    });
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">{t("parent.rewardsHub.parentOnly")}</p>
          <h1 className="text-3xl font-bold text-stone-900">{t("parent.rewardsHub.title")}</h1>
          <p className="mt-2 max-w-2xl text-stone-600">
            {t("parent.rewardsHub.subtitle")}
          </p>
        </div>
        <Link
          href="/my-space/games"
          className="rounded-full bg-brand px-6 py-3 text-sm font-bold text-white hover:bg-brand-dark"
        >
          {t("parent.rewardsHub.openMySpace")} →
        </Link>
      </header>

      <section className="mt-8 grid gap-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-6 md:grid-cols-3">
        <div>
          <p className="text-2xl">🎮</p>
          <p className="mt-2 font-bold text-stone-900">{t("parent.rewardsHub.stepPlay")}</p>
          <p className="text-sm text-stone-600">{t("parent.rewardsHub.stepPlayDesc")}</p>
        </div>
        <div>
          <p className="text-2xl">⭐</p>
          <p className="mt-2 font-bold text-stone-900">{t("parent.rewardsHub.stepEarn")}</p>
          <p className="text-sm text-stone-600">{t("parent.rewardsHub.stepEarnDesc")}</p>
        </div>
        <div>
          <p className="text-2xl">🎁</p>
          <p className="mt-2 font-bold text-stone-900">{t("parent.rewardsHub.stepRedeem")}</p>
          <p className="text-sm text-stone-600">{t("parent.rewardsHub.stepRedeemDesc")}</p>
        </div>
      </section>

      {message ? <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{message}</p> : null}

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {profiles.map((p) => (
          <button
            key={p.profile.id}
            type="button"
            onClick={() => setSelectedId(p.profile.id)}
            className={`card p-5 text-left transition ${selectedId === p.profile.id ? "ring-2 ring-brand" : ""}`}
          >
            <p className="text-xl font-bold text-stone-900">{p.profile.name}</p>
            <p className="text-sm capitalize text-stone-500">{p.profile.ageGroup}</p>
            <p className="mt-2 text-2xl font-bold text-brand">⭐ {t("parent.tasks.points", { points: String(p.balance) })}</p>
            {p.pendingRedemptions.length > 0 ? (
              <p className="mt-1 text-xs font-bold text-amber-700">
                {t("parent.rewardsHub.pending", { count: String(p.pendingRedemptions.length) })}
              </p>
            ) : null}
          </button>
        ))}
      </section>

      {selected && detail ? (
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <section className="card p-6">
            <h2 className="text-lg font-bold text-stone-900">
              {t("parent.rewardsHub.realWorldRewards", { name: selected.profile.name })}
            </h2>
            <ul className="mt-4 space-y-2">
              {selected.rewards.map((r) => (
                <li key={r.id} className="flex items-center gap-2 rounded-xl bg-stone-50 p-3 text-sm">
                  <span>{r.emoji ?? "⭐"}</span>
                  <span className="font-semibold text-stone-900">{r.title}</span>
                  <span className="ml-auto font-bold text-brand">{t("parent.tasks.points", { points: String(r.pointsRequired) })}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <input
                className="rounded-lg border border-stone-300 px-3 py-2 text-stone-900 sm:col-span-2"
                placeholder="New reward title"
                value={newReward.title}
                onChange={(e) => setNewReward((p) => ({ ...p, title: e.target.value }))}
              />
              <input
                type="number"
                className="rounded-lg border border-stone-300 px-3 py-2 text-stone-900"
                value={newReward.pointsRequired}
                onChange={(e) => setNewReward((p) => ({ ...p, pointsRequired: Number(e.target.value) }))}
              />
            </div>
            <button
              type="button"
              className="mt-3 rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white"
              onClick={() =>
                post({
                  action: "create-reward",
                  profileId: selectedId,
                  title: newReward.title,
                  pointsRequired: newReward.pointsRequired,
                  emoji: newReward.emoji,
                }).then(() => setNewReward({ title: "", pointsRequired: 10, emoji: "⭐" }))
              }
            >
              {t("parent.rewardsHub.addReward")}
            </button>
          </section>

          <section className="card p-6">
            <h2 className="text-lg font-bold text-stone-900">{t("parent.rewardsHub.approve")}</h2>
            {detail.redemptions.filter((r) => r.status === "pending").length === 0 ? (
              <p className="mt-3 text-sm text-stone-500">{t("common.empty")}</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {detail.redemptions
                  .filter((r) => r.status === "pending")
                  .map((r) => (
                    <li key={r.id} className="flex items-center justify-between rounded-xl border border-stone-200 p-3">
                      <span className="text-sm font-semibold">{r.rewardTitle}</span>
                      <button
                        type="button"
                        className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white"
                        onClick={() => post({ action: "approve-redemption", redemptionId: r.id })}
                      >
                        {t("parent.rewardsHub.approve")}
                      </button>
                    </li>
                  ))}
              </ul>
            )}

            <h3 className="mt-6 font-bold text-stone-900">{t("parent.rewardsHub.bonusPoints")}</h3>
            <div className="mt-2 flex gap-2">
              <input
                type="number"
                className="w-20 rounded-lg border border-stone-300 px-2 py-2"
                value={bonus.amount}
                onChange={(e) => setBonus((p) => ({ ...p, amount: Number(e.target.value) }))}
              />
              <input
                className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-stone-900"
                value={bonus.reason}
                onChange={(e) => setBonus((p) => ({ ...p, reason: e.target.value }))}
              />
              <button
                type="button"
                className="rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white"
                onClick={() => post({ action: "award-points", profileId: selectedId, amount: bonus.amount, reason: bonus.reason })}
              >
                {t("parent.rewardsHub.bonusPoints")}
              </button>
            </div>
          </section>

          <section className="card p-6 lg:col-span-2">
            <h2 className="text-lg font-bold text-stone-900">{t("parent.rewardsHub.gameSettings")}</h2>
            <p className="mt-1 text-sm text-stone-600">
              Fixed stars per game, predictable daily reset, short cooldowns to reduce repetitive loops. Kids can still play in practice mode after limits.
            </p>
            {detail.gameSettings ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="text-sm">
                  <span className="font-semibold text-stone-800">Daily star cap</span>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
                    value={detail.gameSettings.dailyPointsCap}
                    onChange={(e) =>
                      setDetail((d) =>
                        d
                          ? {
                              ...d,
                              gameSettings: { ...d.gameSettings, dailyPointsCap: Number(e.target.value) },
                            }
                          : d
                      )
                    }
                  />
                </label>
                <label className="text-sm">
                  <span className="font-semibold text-stone-800">Earns per game / day</span>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
                    value={detail.gameSettings.perGameDailyEarnLimit}
                    onChange={(e) =>
                      setDetail((d) =>
                        d
                          ? {
                              ...d,
                              gameSettings: { ...d.gameSettings, perGameDailyEarnLimit: Number(e.target.value) },
                            }
                          : d
                      )
                    }
                  />
                </label>
                <label className="text-sm">
                  <span className="font-semibold text-stone-800">Max earning sessions / day</span>
                  <input
                    type="number"
                    min={3}
                    max={30}
                    className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
                    value={detail.gameSettings.dailyEarnSessionLimit}
                    onChange={(e) =>
                      setDetail((d) =>
                        d
                          ? {
                              ...d,
                              gameSettings: {
                                ...d.gameSettings,
                                dailyEarnSessionLimit: Number(e.target.value),
                              },
                            }
                          : d
                      )
                    }
                  />
                </label>
                <label className="text-sm">
                  <span className="font-semibold text-stone-800">Same-game cooldown (minutes)</span>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
                    value={detail.gameSettings.sameGameCooldownMinutes}
                    onChange={(e) =>
                      setDetail((d) =>
                        d
                          ? {
                              ...d,
                              gameSettings: {
                                ...d.gameSettings,
                                sameGameCooldownMinutes: Number(e.target.value),
                              },
                            }
                          : d
                      )
                    }
                  />
                </label>
              </div>
            ) : null}
            <p className="mt-3 text-xs text-stone-500">
              Today: {detail.gameSettings.pointsEarnedToday} / {detail.gameSettings.dailyPointsCap} stars ·{" "}
              {detail.gameSettings.earnSessionsToday} / {detail.gameSettings.dailyEarnSessionLimit} earning sessions
            </p>
            <button
              type="button"
              className="mt-4 rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white"
              onClick={saveLimits}
            >
              {t("common.save")}
            </button>
          </section>

          <section className="card p-6 lg:col-span-2">
            <h2 className="text-lg font-bold text-stone-900">{t("parent.rewardsHub.gameSettings")}</h2>
            <p className="mt-1 text-sm text-stone-600">
              Toggle which games appear in {selected.profile.name}&apos;s My Space.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {spectrumGames.map((game) => {
                const on = detail.gameSettings.enabledGameIds.includes(game.id);
                return (
                  <label
                    key={game.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 ${on ? "border-brand bg-brand/5" : "border-stone-200"}`}
                  >
                    <input type="checkbox" checked={on} onChange={() => toggleGame(game.id)} className="mt-1" />
                    <div>
                      <p className="font-bold text-stone-900">{game.emoji} {game.title}</p>
                      <p className="text-xs text-stone-600">{game.tagline}</p>
                      <p className="mt-1 text-xs text-stone-500">{game.skills.join(" · ")}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </section>

          <section className="card p-6 lg:col-span-2">
            <h2 className="text-lg font-bold text-stone-900">Points history</h2>
            <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto text-sm">
              {detail.pointEvents.map((e) => (
                <li key={e.id} className="flex justify-between border-b border-stone-100 py-2">
                  <span className="text-stone-700">{e.reason}</span>
                  <span className={`font-bold ${e.amount >= 0 ? "text-brand" : "text-red-600"}`}>
                    {e.amount >= 0 ? "+" : ""}{e.amount}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="card p-6 lg:col-span-2">
            <VideoActivityPanel profileId={selectedId ?? undefined} title={t("parent.rewardsHub.videoActivity")} />
          </section>
        </div>
      ) : null}
    </main>
  );
}
