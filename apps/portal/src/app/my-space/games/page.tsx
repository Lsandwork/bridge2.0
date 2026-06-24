"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { categoryColors, categoryLabels, spectrumGames, type GameCategory } from "@family-support/core";
import { useLanguage } from "@/components/LanguageProvider";
import { useProfile } from "@/components/ProfileProvider";

const ALL_GAME_IDS = spectrumGames.map((g) => g.id);

type EarnSettings = {
  pointsEarnedToday: number;
  dailyPointsCap: number;
  earnSessionsToday: number;
  dailyEarnSessionLimit: number;
  perGamePlaysToday: Record<string, number>;
  perGameDailyEarnLimit: number;
};

export default function MySpaceGamesPage() {
  const { activeProfile } = useProfile();
  const { t } = useLanguage();
  const [enabledIds, setEnabledIds] = useState<string[]>([]);
  const [balance, setBalance] = useState(0);
  const [earn, setEarn] = useState<EarnSettings | null>(null);
  const [filter, setFilter] = useState<GameCategory | "all">("all");

  useEffect(() => {
    if (!activeProfile) return;
    fetch(`/api/rewards?profileId=${activeProfile.id}`)
      .then((r) => r.json())
      .then((hub) => {
        setEnabledIds(hub.gameSettings?.enabledGameIds?.length ? hub.gameSettings.enabledGameIds : ALL_GAME_IDS);
        setBalance(hub.balance ?? 0);
        const gs = hub.gameSettings;
        if (gs) {
          setEarn({
            pointsEarnedToday: gs.pointsEarnedToday ?? 0,
            dailyPointsCap: gs.dailyPointsCap ?? 40,
            earnSessionsToday: gs.earnSessionsToday ?? 0,
            dailyEarnSessionLimit: gs.dailyEarnSessionLimit ?? gs.dailyGameLimit ?? 10,
            perGamePlaysToday: gs.perGamePlaysToday ?? {},
            perGameDailyEarnLimit: gs.perGameDailyEarnLimit ?? 3,
          });
        }
      });
  }, [activeProfile]);

  const featured = useMemo(() => spectrumGames.find((g) => g.id === "star-catcher") ?? spectrumGames[0], []);

  const starsLeft = earn ? Math.max(0, earn.dailyPointsCap - earn.pointsEarnedToday) : null;
  const dayProgress = earn ? Math.min(1, earn.pointsEarnedToday / earn.dailyPointsCap) : 0;

  if (!activeProfile) {
    return (
      <main className="px-4 py-10 text-center">
        <Link href="/my-space" className="font-bold text-[var(--ms-accent)]">
          {t("myspace.pickProfileLink")}
        </Link>
      </main>
    );
  }

  const age = activeProfile.ageGroup as "child" | "teen" | "adult";
  const games = spectrumGames.filter(
    (g) =>
      g.ageGroups.includes(age) &&
      enabledIds.includes(g.id) &&
      (filter === "all" || g.category === filter)
  );

  return (
    <main className="games-arcade ms-page ms-page-pad-bottom mx-auto max-w-lg px-4 pb-8 pt-4">
      <div className="games-arcade-hero">
        <div className="games-arcade-hero-inner">
          <p className="games-arcade-kicker">🎮 {t("games.title")}</p>
          <h1 className="games-arcade-title">{t("games.subtitle")}</h1>
          <p className="games-arcade-balance">
            {t("games.savedBalance", { balance: String(balance), count: String(games.length) })}
          </p>
        </div>
      </div>

      {earn ? (
        <div className="token-daily-card mt-4">
          <div className="token-daily-header">
            <span className="token-daily-label">{t("games.todayStars")}</span>
            <span className="token-daily-count">
              {earn.pointsEarnedToday} / {earn.dailyPointsCap}
            </span>
          </div>
          <div className="token-daily-bar" aria-hidden>
            <span className="token-daily-fill" style={{ width: `${dayProgress * 100}%` }} />
          </div>
          <p className="token-daily-hint">
            {starsLeft === 0
              ? t("games.starLimitReached")
              : t("games.starsLeftHint", {
                  left: String(starsLeft),
                  max: String(earn.perGameDailyEarnLimit),
                })}
          </p>
        </div>
      ) : null}

      {enabledIds.includes(featured.id) && featured.ageGroups.includes(age) ? (
        <Link href={`/my-space/games/${featured.id}`} className="games-featured-card">
          <span className="games-featured-badge">{t("games.featured")}</span>
          <div className="games-featured-body">
            <span className="games-featured-emoji">{featured.emoji}</span>
            <div className="games-featured-copy">
              <p className="games-featured-name">{featured.title}</p>
              <p className="games-featured-tag">{featured.tagline}</p>
              <p className="games-featured-cta">
                {t("games.play")} · +{featured.pointsPerPlay} ⭐ →
              </p>
            </div>
          </div>
        </Link>
      ) : null}

      <div className="games-filter-row">
        <button type="button" className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>
          {t("games.all")}
        </button>
        {(Object.keys(categoryLabels) as GameCategory[]).map((cat) => (
          <button key={cat} type="button" className={filter === cat ? "active" : ""} onClick={() => setFilter(cat)}>
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      {games.length === 0 ? (
        <p className="ms-card mt-6 p-6 text-center text-sm">{t("games.noGames")}</p>
      ) : (
        <div className="games-grid mt-4">
          {games.map((game) => {
            const plays = earn?.perGamePlaysToday[game.id] ?? 0;
            const maxPlays = earn?.perGameDailyEarnLimit ?? 3;
            const earnsLeft = Math.max(0, maxPlays - plays);
            return (
              <Link key={game.id} href={`/my-space/games/${game.id}`} className="games-tile">
                <div className="games-tile-glow" style={{ background: categoryColors[game.category] }} />
                <span className="games-tile-emoji">{game.emoji}</span>
                <p className="games-tile-name">{game.title}</p>
                <p className="games-tile-meta">{t("games.pointsAlways", { points: String(game.pointsPerPlay) })}</p>
                {earn ? (
                  <p className="games-tile-earns">
                    {earnsLeft > 0 ? t("games.earnsLeft", { count: String(earnsLeft) }) : t("games.practiceMode")}
                  </p>
                ) : null}
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
