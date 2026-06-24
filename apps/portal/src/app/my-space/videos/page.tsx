"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { VideoCatalogItem } from "@family-support/core";
import { useLanguage } from "@/components/LanguageProvider";
import { useProfile } from "@/components/ProfileProvider";
import { YouTubeEmbedPlayer } from "@/components/my-space/YouTubeEmbedPlayer";
import Link from "next/link";

type RewardStatus = {
  rewardsUsed24h: number;
  rewardsRemaining24h: number;
  dailyLimit: number;
};

const CATEGORIES = ["All", "Calm", "Sensory", "Social", "Daily Living", "Feelings", "Transitions", "Interests", "Creative"] as const;

export default function MySpaceVideosPage() {
  const { activeProfile } = useProfile();
  const { t } = useLanguage();
  const [videos, setVideos] = useState<VideoCatalogItem[]>([]);
  const [rewardStatus, setRewardStatus] = useState<RewardStatus | null>(null);
  const [balance, setBalance] = useState(0);
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [selected, setSelected] = useState<VideoCatalogItem | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [playToken, setPlayToken] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchHintKey, setSearchHintKey] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);

  const loadCatalog = useCallback(
    async (q = query) => {
      if (!activeProfile) return;
      const res = await fetch(
        `/api/videos?profileId=${activeProfile.id}${q ? `&q=${encodeURIComponent(q)}` : ""}`
      );
      const data = await res.json();
      if (res.ok) {
        setVideos(data.videos ?? []);
        setRewardStatus(data.rewardStatus ?? null);
        setSearchHintKey(data.searchHintKey ?? null);
      }
      const hub = await fetch(`/api/rewards?profileId=${activeProfile.id}`).then((r) => r.json());
      setBalance(hub.balance ?? 0);
      setLoading(false);
    },
    [activeProfile, query]
  );

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const isYouTubeSearch = query.trim().length > 0;

  const filtered = useMemo(() => {
    if (isYouTubeSearch) return videos;
    if (category === "All") return videos;
    return videos.filter((v) => v.category === category);
  }, [videos, category, isYouTubeSearch]);

  const featured = !isYouTubeSearch ? videos[0] ?? null : null;

  const gridVideos = useMemo(() => {
    if (!selected && featured) {
      return filtered.filter((v) => v.id !== featured.id);
    }
    return filtered;
  }, [filtered, selected, featured]);

  const pointsProgress = rewardStatus
    ? Math.min(1, rewardStatus.rewardsUsed24h / rewardStatus.dailyLimit)
    : 0;

  const runSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = searchInput.trim();
    setQuery(q);
    setCategory("All");
    setSelected(null);
    if (!activeProfile) return;

    setSearching(true);
    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "search",
          profileId: activeProfile.id,
          profileName: activeProfile.name,
          query: q,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setVideos(data.videos ?? []);
        setRewardStatus(data.rewardStatus ?? null);
        setSearchHintKey(data.searchHintKey ?? null);
      }
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = async () => {
    setSearchInput("");
    setQuery("");
    setCategory("All");
    setSelected(null);
    setSearchHintKey(null);
    if (!activeProfile) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/videos?profileId=${activeProfile.id}`);
      const data = await res.json();
      if (res.ok) {
        setVideos(data.videos ?? []);
        setRewardStatus(data.rewardStatus ?? null);
        setSearchHintKey(data.searchHintKey ?? null);
      }
    } finally {
      setSearching(false);
    }
  };

  const selectVideo = (video: VideoCatalogItem) => {
    setSelected(video);
    setSessionId(null);
    setPlayToken(null);
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onPlayStart = useCallback(async () => {
    if (!activeProfile || !selected || sessionId) return;
    const res = await fetch("/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "play-start",
        profileId: activeProfile.id,
        profileName: activeProfile.name,
        videoId: selected.id,
        youtubeId: selected.youtubeId,
        title: selected.title,
      }),
    });
    const data = await res.json();
    if (res.ok && data.sessionId && data.playToken) {
      setSessionId(data.sessionId);
      setPlayToken(data.playToken);
    } else if (!res.ok) {
      setMessage(data.error ?? "Could not start video session.");
    }
  }, [activeProfile, selected, sessionId]);

  const onComplete = useCallback(async () => {
    if (!activeProfile || !sessionId || !playToken || completing) return;
    setCompleting(true);
    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete",
          profileId: activeProfile.id,
          profileName: activeProfile.name,
          sessionId,
          playToken,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not complete video.");
      setMessage(data.message);
      setBalance(data.balance);
      setRewardStatus({
        rewardsUsed24h: data.rewardsUsed24h,
        rewardsRemaining24h: data.rewardsRemaining24h,
        dailyLimit: rewardStatus?.dailyLimit ?? 5,
      });
      setSessionId(null);
      setPlayToken(null);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not award points.");
    } finally {
      setCompleting(false);
    }
  }, [activeProfile, sessionId, playToken, completing, rewardStatus?.dailyLimit]);

  if (!activeProfile) {
    return (
      <main className="ms-page-pad-bottom px-4 py-10 text-center">
        <Link href="/my-space" className="font-bold text-[var(--ms-accent)]">
          {t("myspace.pickProfileLink")}
        </Link>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="videos-arcade ms-page ms-page-pad-bottom mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-sm font-semibold text-[var(--ms-muted)]">{t("videos.loading")}</p>
      </main>
    );
  }

  return (
    <main className="videos-arcade ms-page ms-page-pad-bottom mx-auto max-w-lg px-4 pb-8 pt-4">
      <div className="videos-arcade-hero">
        <div className="videos-arcade-hero-inner">
          <p className="videos-arcade-kicker">▶ {t("videos.title")}</p>
          <h1 className="videos-arcade-title">{t("videos.subtitle")}</h1>
          <p className="videos-arcade-balance">
            ⭐ {balance} {t("games.points")} · {videos.length} {t("videos.libraryCount")}
          </p>
        </div>
      </div>

      {rewardStatus ? (
        <div className="token-daily-card videos-points-card mt-4">
          <div className="token-daily-header">
            <span className="token-daily-label">{t("videos.pointsTodayLabel")}</span>
            <span className="token-daily-count">
              {rewardStatus.rewardsUsed24h} / {rewardStatus.dailyLimit}
            </span>
          </div>
          <div className="token-daily-bar" aria-hidden>
            <span className="token-daily-fill" style={{ width: `${pointsProgress * 100}%` }} />
          </div>
          <p className="token-daily-hint">
            {rewardStatus.rewardsRemaining24h === 0
              ? t("videos.noPointsLeft")
              : t("videos.watchToEarn")}
          </p>
        </div>
      ) : null}

      {message ? (
        <div
          className={`videos-toast mt-4 ${message.startsWith("+") ? "videos-toast--success" : ""}`}
          role="status"
        >
          {message}
        </div>
      ) : null}

      {selected ? (
        <section className="videos-player-card mt-4">
          <div className="videos-player-head">
            <button type="button" className="videos-back-btn" onClick={() => setSelected(null)}>
              ← {t("videos.allVideos")}
            </button>
            <p className="videos-player-title">{selected.title}</p>
            <p className="videos-player-meta">
              {selected.category} · {selected.durationLabel}
            </p>
          </div>
          <YouTubeEmbedPlayer
            key={selected.id}
            youtubeId={selected.youtubeId}
            title={selected.title}
            onPlayStart={onPlayStart}
            onComplete={onComplete}
          />
          <p className="videos-player-desc">{selected.description}</p>
          <p className="videos-player-earn">+1 {t("games.points")} {t("videos.whenFinished")}</p>
        </section>
      ) : featured ? (
        <button type="button" className="videos-featured-card" onClick={() => selectVideo(featured)}>
          <span className="videos-featured-badge">{t("videos.featured")}</span>
          <div className="videos-featured-body">
            <div className="videos-featured-thumb">
              <img src={`https://img.youtube.com/vi/${featured.youtubeId}/mqdefault.jpg`} alt="" />
              <span className="videos-play-icon" aria-hidden>▶</span>
            </div>
            <div className="videos-featured-copy">
              <p className="videos-featured-name">{featured.title}</p>
              <p className="videos-featured-tag">{featured.description}</p>
              <p className="videos-featured-cta">
                {t("videos.watchNow")} · +1 ⭐
              </p>
            </div>
          </div>
        </button>
      ) : null}

      <form onSubmit={runSearch} className="videos-search-row mt-4">
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder={t("videos.searchPlaceholder")}
          className="videos-search-input"
          aria-label={t("videos.search")}
        />
        {query ? (
          <button type="button" className="videos-clear-btn" onClick={clearSearch}>
            {t("videos.clear")}
          </button>
        ) : null}
        <button type="submit" className="videos-search-btn" disabled={searching}>
          {searching ? t("videos.searching") : t("videos.search")}
        </button>
      </form>

      {!isYouTubeSearch ? (
      <div className="videos-filter-row">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            className={category === cat ? "active" : ""}
            onClick={() => setCategory(cat)}
          >
            {cat === "All" ? t("videos.all") : cat}
          </button>
        ))}
      </div>
      ) : null}

      <h2 className="videos-section-label">
        {searching
          ? t("videos.searching")
          : query
            ? t("videos.searchResults")
            : category === "All"
              ? t("videos.allVideos")
              : category}
      </h2>

      {searching ? (
        <p className="ms-card mt-3 p-6 text-center text-sm text-[var(--ms-muted)]">{t("videos.searching")}</p>
      ) : gridVideos.length === 0 ? (
        <div className="ms-card mt-3 p-6 text-center text-sm text-[var(--ms-muted)]">
          <p>{searchHintKey ? t(searchHintKey) : t("videos.noResults")}</p>
        </div>
      ) : (
        <div className="videos-grid mt-3">
          {gridVideos.map((video) => (
            <button
              key={video.id}
              type="button"
              onClick={() => selectVideo(video)}
              className={`videos-tile ${selected?.id === video.id ? "videos-tile--active" : ""}`}
            >
              <div className="videos-tile-thumb">
                <img src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`} alt="" loading="lazy" />
                <span className="videos-tile-duration">{video.durationLabel}</span>
                <span className="videos-play-icon videos-play-icon--sm" aria-hidden>▶</span>
              </div>
              <div className="videos-tile-body">
                <p className="videos-tile-category">{video.category}</p>
                <p className="videos-tile-name">{video.title}</p>
                <p className="videos-tile-meta">+1 {t("games.points")}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
