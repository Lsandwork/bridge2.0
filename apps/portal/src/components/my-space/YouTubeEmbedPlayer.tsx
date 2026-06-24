"use client";

import { useCallback, useEffect, useRef } from "react";

type YouTubePlayerInstance = {
  destroy: () => void;
  getCurrentTime: () => number;
  getPlayerState: () => number;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement,
        config: {
          videoId: string;
          playerVars?: Record<string, number | string>;
          events?: { onStateChange?: (event: { data: number }) => void };
        }
      ) => YouTubePlayerInstance;
      PlayerState: { ENDED: number; PLAYING: number; PAUSED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiLoading = false;
let apiReady = false;
const readyQueue: Array<() => void> = [];

function loadYouTubeApi() {
  if (apiReady && window.YT?.Player) {
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => {
    readyQueue.push(resolve);
    if (apiLoading) return;
    apiLoading = true;

    const done = () => {
      apiReady = true;
      while (readyQueue.length) readyQueue.shift()?.();
    };

    if (window.YT?.Player) {
      done();
      return;
    }

    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      done();
    };

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.body.appendChild(script);
    }
  });
}

type Props = {
  youtubeId: string;
  title: string;
  minWatchSeconds?: number;
  onPlayStart: () => void | Promise<void>;
  onComplete: () => void;
};

export function YouTubeEmbedPlayer({
  youtubeId,
  title,
  minWatchSeconds = 30,
  onPlayStart,
  onComplete,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayerInstance | null>(null);
  const playLoggedRef = useRef(false);
  const completedRef = useRef(false);
  const watchPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const onPlayStartRef = useRef(onPlayStart);
  const onCompleteRef = useRef(onComplete);
  onPlayStartRef.current = onPlayStart;
  onCompleteRef.current = onComplete;

  const clearWatchPoll = useCallback(() => {
    if (watchPollRef.current) {
      clearInterval(watchPollRef.current);
      watchPollRef.current = null;
    }
  }, []);

  const tryComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    clearWatchPoll();
    onCompleteRef.current();
  }, [clearWatchPoll]);

  const startWatchPoll = useCallback(() => {
    clearWatchPoll();
    watchPollRef.current = setInterval(() => {
      const player = playerRef.current;
      if (!player || completedRef.current) return;

      const state = player.getPlayerState();
      if (state === window.YT!.PlayerState.PLAYING && player.getCurrentTime() >= minWatchSeconds) {
        tryComplete();
      }
    }, 2000);
  }, [clearWatchPoll, minWatchSeconds, tryComplete]);

  const mountPlayer = useCallback(() => {
    if (!containerRef.current || !window.YT?.Player) return;

    playerRef.current?.destroy();
    clearWatchPoll();
    playLoggedRef.current = false;
    completedRef.current = false;
    containerRef.current.innerHTML = "";

    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId: youtubeId,
      playerVars: {
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
      },
      events: {
        onStateChange: (event) => {
          if (event.data === window.YT!.PlayerState.PLAYING && !playLoggedRef.current) {
            playLoggedRef.current = true;
            Promise.resolve(onPlayStartRef.current()).finally(() => startWatchPoll());
          }
          if (event.data === window.YT!.PlayerState.ENDED && !completedRef.current) {
            tryComplete();
          }
        },
      },
    });
  }, [youtubeId, clearWatchPoll, startWatchPoll, tryComplete]);

  useEffect(() => {
    let cancelled = false;
    loadYouTubeApi().then(() => {
      if (!cancelled) mountPlayer();
    });
    return () => {
      cancelled = true;
      clearWatchPoll();
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [mountPlayer, clearWatchPoll]);

  return (
    <div className="video-player-wrap">
      <div ref={containerRef} className="video-player-embed" aria-label={title} />
    </div>
  );
}
