import type { VideoCatalogItem } from "@family-support/core";

type YouTubeSearchItem = {
  youtubeId: string;
  title: string;
  description: string;
  durationLabel: string;
  channelTitle?: string;
};

export type YouTubeSearchResult = {
  videos: VideoCatalogItem[];
  /** i18n key shown when search cannot return results */
  searchHintKey?: "videos.hint.missingApiKey" | "videos.hint.apiError";
};

function getYouTubeApiKey(): string | undefined {
  const key = process.env.YOUTUBE_API_KEY?.trim();
  return key ? key : undefined;
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds < 1) return "";
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (s === 0) return `${m} min`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function toCatalogItem(item: YouTubeSearchItem): VideoCatalogItem {
  return {
    id: `yt-${item.youtubeId}`,
    youtubeId: item.youtubeId,
    title: item.title,
    description: item.description || item.channelTitle || "YouTube",
    category: "YouTube",
    tags: item.channelTitle ? [item.channelTitle] : [],
    durationLabel: item.durationLabel || "Video",
  };
}

async function searchViaYouTubeApi(query: string): Promise<{
  items: YouTubeSearchItem[];
  apiError: boolean;
}> {
  const key = getYouTubeApiKey();
  if (!key) return { items: [], apiError: false };

  const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
  searchUrl.searchParams.set("part", "snippet");
  searchUrl.searchParams.set("type", "video");
  searchUrl.searchParams.set("maxResults", "24");
  searchUrl.searchParams.set("safeSearch", "strict");
  searchUrl.searchParams.set("q", query);
  searchUrl.searchParams.set("key", key);

  const res = await fetch(searchUrl.toString(), { cache: "no-store" });
  if (!res.ok) {
    console.error("[youtube-search] search failed:", res.status, await res.text().catch(() => ""));
    return { items: [], apiError: true };
  }

  const data = (await res.json()) as {
    items?: Array<{
      id?: { videoId?: string };
      snippet?: {
        title?: string;
        description?: string;
        channelTitle?: string;
      };
    }>;
  };

  const items: YouTubeSearchItem[] = [];
  for (const item of data.items ?? []) {
    const youtubeId = item.id?.videoId;
    if (!youtubeId) continue;
    items.push({
      youtubeId,
      title: item.snippet?.title ?? "YouTube video",
      description: item.snippet?.description ?? "",
      channelTitle: item.snippet?.channelTitle,
      durationLabel: "Video",
    });
  }

  if (items.length === 0) return { items: [], apiError: false };

  const ids = items.map((i) => i.youtubeId).join(",");
  const detailsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
  detailsUrl.searchParams.set("part", "contentDetails");
  detailsUrl.searchParams.set("id", ids);
  detailsUrl.searchParams.set("key", key);

  const detailsRes = await fetch(detailsUrl.toString(), { cache: "no-store" });
  if (detailsRes.ok) {
    const details = (await detailsRes.json()) as {
      items?: Array<{ id?: string; contentDetails?: { duration?: string } }>;
    };
    const durationMap = new Map<string, string>();
    for (const row of details.items ?? []) {
      if (!row.id || !row.contentDetails?.duration) continue;
      const match = row.contentDetails.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      if (!match) continue;
      const seconds =
        Number(match[1] ?? 0) * 3600 + Number(match[2] ?? 0) * 60 + Number(match[3] ?? 0);
      durationMap.set(row.id, formatDuration(seconds));
    }
    for (const item of items) {
      const label = durationMap.get(item.youtubeId);
      if (label) item.durationLabel = label;
    }
  }

  return { items, apiError: false };
}

function parseInvidiousResults(data: unknown): YouTubeSearchItem[] {
  if (!Array.isArray(data)) return [];

  const results: YouTubeSearchItem[] = [];
  for (const row of data) {
    if (!row || typeof row !== "object") continue;
    const item = row as {
      type?: string;
      videoId?: string;
      title?: string;
      description?: string;
      author?: string;
      lengthSeconds?: number;
    };
    if (item.type !== "video" || !item.videoId) continue;
    results.push({
      youtubeId: item.videoId,
      title: item.title ?? "YouTube video",
      description: item.description ?? "",
      channelTitle: item.author,
      durationLabel: formatDuration(item.lengthSeconds ?? 0) || "Video",
    });
  }
  return results.slice(0, 24);
}

async function searchViaInvidious(query: string): Promise<YouTubeSearchItem[]> {
  const hosts = [
    "https://invidious.fdn.fr",
    "https://invidious.privacyredirect.com",
    "https://inv.tux.pizza",
  ];

  for (const host of hosts) {
    try {
      const url = `${host}/api/v1/search?q=${encodeURIComponent(query)}&type=video`;
      const res = await fetch(url, { next: { revalidate: 60 } });
      if (!res.ok) continue;
      const results = parseInvidiousResults(await res.json());
      if (results.length > 0) return results;
    } catch {
      continue;
    }
  }

  return [];
}

async function searchViaPiped(query: string): Promise<YouTubeSearchItem[]> {
  const hosts = [
    "https://pipedapi.kavin.rocks",
    "https://pipedapi.moomoo.me",
    "https://api.piped.yt",
  ];

  for (const host of hosts) {
    try {
      const url = `${host}/search?q=${encodeURIComponent(query)}&filter=videos`;
      const res = await fetch(url, { next: { revalidate: 60 } });
      if (!res.ok) continue;

      const data = (await res.json()) as {
        items?: Array<{
          type?: string;
          title?: string;
          url?: string;
          uploaderName?: string;
          duration?: number;
          shortDescription?: string;
        }>;
      };

      const results: YouTubeSearchItem[] = [];
      for (const item of data.items ?? []) {
        if (item.type !== "stream" || !item.url) continue;
        const match = item.url.match(/[?&]v=([^&]+)/) ?? item.url.match(/\/([^/?]+)$/);
        const youtubeId = match?.[1];
        if (!youtubeId) continue;
        results.push({
          youtubeId,
          title: item.title ?? "YouTube video",
          description: item.shortDescription ?? "",
          channelTitle: item.uploaderName,
          durationLabel: formatDuration(item.duration ?? 0) || "Video",
        });
      }

      if (results.length > 0) return results.slice(0, 24);
    } catch {
      continue;
    }
  }

  return [];
}

export async function searchYouTubeVideos(query: string): Promise<YouTubeSearchResult> {
  const q = query.trim();
  if (!q) return { videos: [] };

  const hasApiKey = Boolean(getYouTubeApiKey());
  const { items: apiItems, apiError } = await searchViaYouTubeApi(q);

  if (apiItems.length > 0) {
    return { videos: apiItems.map(toCatalogItem) };
  }

  if (apiError && hasApiKey) {
    return { videos: [], searchHintKey: "videos.hint.apiError" };
  }

  let results = await searchViaInvidious(q);
  if (results.length === 0) results = await searchViaPiped(q);

  if (results.length > 0) {
    return { videos: results.map(toCatalogItem) };
  }

  if (!hasApiKey) {
    return { videos: [], searchHintKey: "videos.hint.missingApiKey" };
  }

  return { videos: [] };
}

export function isYouTubeSearchConfigured(): boolean {
  return Boolean(getYouTubeApiKey());
}
