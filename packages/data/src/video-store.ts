import { filterVideoCatalog, getVideoById, videoCatalog, type VideoCatalogItem } from "@family-support/core";
import { addPointEvent, getLocalChildProfiles, getPointEvents, getPointsBalance } from "./local-store";
import { createVideoPlayToken, verifyVideoPlayToken } from "./video-play-token";

const VIDEO_REWARD_LIMIT_24H = 5;
const MIN_WATCH_SECONDS = 30;

export type VideoActivityType = "search" | "play" | "reward";

export type VideoActivity = {
  id: string;
  childProfileId: string;
  profileName: string;
  type: VideoActivityType;
  videoId?: string;
  youtubeId?: string;
  videoTitle?: string;
  searchQuery?: string;
  pointsAwarded?: number;
  rewarded?: boolean;
  at: string;
};

export type VideoPlaySession = {
  sessionId: string;
  childProfileId: string;
  videoId: string;
  youtubeId: string;
  videoTitle: string;
  startedAt: string;
};

export type VideoCompleteResult = {
  pointsAwarded: number;
  rewarded: boolean;
  message: string;
  balance: number;
  rewardsUsed24h: number;
  rewardsRemaining24h: number;
};

type VideoStoreGlobal = { __bridgeVideoActivityLog?: VideoActivity[] };

const activityLog: VideoActivity[] =
  (globalThis as VideoStoreGlobal).__bridgeVideoActivityLog ??
  ((globalThis as VideoStoreGlobal).__bridgeVideoActivityLog = []);

function nowIso() {
  return new Date().toISOString();
}

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 3600000).toISOString();
}

function getProfileName(profileId: string): string {
  return getLocalChildProfiles().find((p) => p.id === profileId)?.name ?? "Profile";
}

function logActivity(entry: Omit<VideoActivity, "id" | "at">) {
  const event: VideoActivity = {
    ...entry,
    id: `vid-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    at: nowIso(),
  };
  activityLog.unshift(event);
  if (activityLog.length > 1000) activityLog.length = 1000;
  return event;
}

function rewardedViewsIn24h(profileId: string): number {
  const since = hoursAgo(24);
  const fromActivity = activityLog.filter(
    (a) =>
      a.childProfileId === profileId &&
      a.type === "reward" &&
      a.rewarded &&
      a.at >= since
  ).length;
  const fromPoints = getPointEvents(profileId).filter(
    (e) => e.source === "video" && e.createdAt >= since
  ).length;
  return Math.max(fromActivity, fromPoints);
}

function wasVideoRewardedIn24h(profileId: string, videoId: string, youtubeId?: string): boolean {
  const since = hoursAgo(24);
  if (
    activityLog.some(
      (a) =>
        a.childProfileId === profileId &&
        a.type === "reward" &&
        a.rewarded &&
        a.at >= since &&
        (a.videoId === videoId || (youtubeId != null && a.youtubeId === youtubeId))
    )
  ) {
    return true;
  }

  const marker = youtubeId ? `yt:${youtubeId}` : `vid:${videoId}`;
  return getPointEvents(profileId).some(
    (e) => e.source === "video" && e.createdAt >= since && e.reason.includes(marker)
  );
}

function resolvePlayableVideo(
  videoId: string,
  options?: { youtubeId?: string; title?: string }
): { id: string; youtubeId: string; title: string } {
  const fromCatalog = getVideoById(videoId);
  if (fromCatalog) {
    return { id: fromCatalog.id, youtubeId: fromCatalog.youtubeId, title: fromCatalog.title };
  }

  const youtubeId = options?.youtubeId ?? (videoId.startsWith("yt-") ? videoId.slice(3) : undefined);
  if (!youtubeId) throw new Error("Video not found.");

  return {
    id: videoId.startsWith("yt-") ? videoId : `yt-${youtubeId}`,
    youtubeId,
    title: options?.title ?? "YouTube video",
  };
}

export function searchVideos(query: string): VideoCatalogItem[] {
  return filterVideoCatalog(query);
}

export function logVideoSearch(childProfileId: string, query: string, profileName?: string) {
  const name = profileName ?? getProfileName(childProfileId);
  return logActivity({
    childProfileId,
    profileName: name,
    type: "search",
    searchQuery: query.trim(),
  });
}

export function startVideoPlay(
  childProfileId: string,
  videoId: string,
  profileName?: string,
  options?: { youtubeId?: string; title?: string }
): { sessionId: string; playToken: string } {
  const video = resolvePlayableVideo(videoId, options);

  const name = profileName ?? getProfileName(childProfileId);
  const sessionId = `vs-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const startedAt = nowIso();

  const playToken = createVideoPlayToken({
    sid: sessionId,
    pid: childProfileId,
    vid: video.id,
    yid: video.youtubeId,
    title: video.title,
    startedAt,
  });

  logActivity({
    childProfileId,
    profileName: name,
    type: "play",
    videoId: video.id,
    youtubeId: video.youtubeId,
    videoTitle: video.title,
  });

  return { sessionId, playToken };
}

export function getVideoRewardStatus(childProfileId: string) {
  const used = rewardedViewsIn24h(childProfileId);
  return {
    rewardsUsed24h: used,
    rewardsRemaining24h: Math.max(0, VIDEO_REWARD_LIMIT_24H - used),
    dailyLimit: VIDEO_REWARD_LIMIT_24H,
  };
}

function sessionFromToken(
  childProfileId: string,
  sessionId: string,
  playToken: string
): VideoPlaySession {
  const payload = verifyVideoPlayToken(playToken);
  if (!payload || payload.pid !== childProfileId || payload.sid !== sessionId) {
    throw new Error("Invalid or expired play session. Start the video again.");
  }

  return {
    sessionId: payload.sid,
    childProfileId: payload.pid,
    videoId: payload.vid,
    youtubeId: payload.yid,
    videoTitle: payload.title,
    startedAt: payload.startedAt,
  };
}

export function completeVideoView(
  childProfileId: string,
  sessionId: string,
  profileName?: string,
  playToken?: string
): VideoCompleteResult {
  if (!playToken) {
    throw new Error("Invalid or expired play session. Start the video again.");
  }

  const session = sessionFromToken(childProfileId, sessionId, playToken);

  const elapsedMs = Date.now() - new Date(session.startedAt).getTime();
  if (elapsedMs < MIN_WATCH_SECONDS * 1000) {
    throw new Error(`Watch at least ${MIN_WATCH_SECONDS} seconds to earn a point.`);
  }

  const name = profileName ?? getProfileName(childProfileId);
  const status = getVideoRewardStatus(childProfileId);

  let pointsAwarded = 0;
  let rewarded = false;
  let message: string;

  if (wasVideoRewardedIn24h(childProfileId, session.videoId, session.youtubeId)) {
    message = "You already earned a point for this video today. Keep watching for fun!";
  } else if (status.rewardsUsed24h >= VIDEO_REWARD_LIMIT_24H) {
    message = "You've earned 5 video points in the last 24 hours. You can still watch — no more points until tomorrow.";
  } else {
    pointsAwarded = 1;
    rewarded = true;
    addPointEvent({
      childProfileId,
      amount: 1,
      reason: `Watched: ${session.videoTitle} [yt:${session.youtubeId}]`,
      source: "video",
    });
    message = "+1 point! Great job watching and learning.";
  }

  logActivity({
    childProfileId,
    profileName: name,
    type: "reward",
    videoId: session.videoId,
    youtubeId: session.youtubeId,
    videoTitle: session.videoTitle,
    pointsAwarded,
    rewarded,
  });

  const newStatus = getVideoRewardStatus(childProfileId);

  return {
    pointsAwarded,
    rewarded,
    message,
    balance: getPointsBalance(childProfileId),
    rewardsUsed24h: newStatus.rewardsUsed24h,
    rewardsRemaining24h: newStatus.rewardsRemaining24h,
  };
}

export function getVideoActivity(limit = 100, childProfileId?: string): VideoActivity[] {
  const list = childProfileId
    ? activityLog.filter((a) => a.childProfileId === childProfileId)
    : activityLog;
  return list.slice(0, limit);
}

export function getVideoActivityForProfiles(profileIds: string[], limit = 100): VideoActivity[] {
  if (profileIds.length === 0) return [];
  return activityLog.filter((a) => profileIds.includes(a.childProfileId)).slice(0, limit);
}

export function getVideoCatalog() {
  return videoCatalog;
}
