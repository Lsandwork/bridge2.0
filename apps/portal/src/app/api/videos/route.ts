import { NextResponse } from "next/server";
import {
  completeVideoView,
  getVideoActivity,
  getVideoActivityForProfiles,
  getVideoCatalog,
  getVideoRewardStatus,
  logVideoSearch,
  startVideoPlay,
  getLinkedProfileIds,
} from "@family-support/data";
import { getSession } from "@/lib/auth/session";
import { searchYouTubeVideos } from "@/lib/youtube-search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const q = searchParams.get("q") ?? "";
  const profileId = searchParams.get("profileId") ?? undefined;
  const section = searchParams.get("section") ?? "catalog";

  try {
    if (section === "activity") {
      const limit = Number(searchParams.get("limit") ?? 100);

      if (session.role === "admin" || session.role === "super_admin") {
        return NextResponse.json({ activity: getVideoActivity(limit) });
      }

      if (session.role === "parent_guardian" || session.role === "caregiver_therapist_teacher") {
        const linked = getLinkedProfileIds(session.id);
        const filterId = profileId && linked.includes(profileId) ? profileId : undefined;
        const activity = filterId
          ? getVideoActivity(limit, filterId)
          : getVideoActivityForProfiles(linked, limit);
        return NextResponse.json({ activity });
      }

      if (profileId) {
        return NextResponse.json({ activity: getVideoActivity(limit, profileId) });
      }

      return NextResponse.json({ error: "profileId required." }, { status: 400 });
    }

    if (!profileId) {
      return NextResponse.json({ error: "profileId is required." }, { status: 400 });
    }

    const search = q.trim() ? await searchYouTubeVideos(q) : { videos: getVideoCatalog() };
    const rewardStatus = getVideoRewardStatus(profileId);

    return NextResponse.json({
      videos: search.videos,
      rewardStatus,
      searchHintKey: search.searchHintKey,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load videos." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      action?: string;
      profileId?: string;
      profileName?: string;
      query?: string;
      videoId?: string;
      youtubeId?: string;
      title?: string;
      sessionId?: string;
      playToken?: string;
    };

    const { action, profileId } = body;
    if (!action || !profileId) {
      return NextResponse.json({ error: "action and profileId are required." }, { status: 400 });
    }

    switch (action) {
      case "search": {
        const query = body.query ?? "";
        if (query.trim()) logVideoSearch(profileId, query, body.profileName);
        const search = query.trim()
          ? await searchYouTubeVideos(query)
          : { videos: getVideoCatalog() };
        return NextResponse.json({
          videos: search.videos,
          rewardStatus: getVideoRewardStatus(profileId),
          searchHintKey: search.searchHintKey,
        });
      }
      case "play-start": {
        if (!body.videoId) {
          return NextResponse.json({ error: "videoId is required." }, { status: 400 });
        }
        const play = startVideoPlay(profileId, body.videoId, body.profileName, {
          youtubeId: body.youtubeId,
          title: body.title,
        });
        return NextResponse.json({ ok: true, ...play });
      }
      case "complete": {
        if (!body.sessionId || !body.playToken) {
          return NextResponse.json({ error: "sessionId and playToken are required." }, { status: 400 });
        }
        const result = completeVideoView(
          profileId,
          body.sessionId,
          body.profileName,
          body.playToken
        );
        return NextResponse.json(result);
      }
      default:
        return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Video action failed." },
      { status: 400 }
    );
  }
}
