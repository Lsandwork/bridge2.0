"use client";

import type { TessState } from "./tessAnimationState";

type Props = {
  state: TessState;
};

export function TessAnimationLayer({ state }: Props) {
  const showDots = state === "typing" || state === "thinking";
  const showListenDots = state === "listening";
  const showWaves = state === "speaking";
  const showWaveSparkle = state === "waving" || state === "celebrating";
  const showIdleSparkle = state === "idle";

  return (
    <>
      <span className="tess-companion__glow" aria-hidden />
      <span className="tess-companion__ring" aria-hidden />
      <span className="tess-companion__ring tess-companion__ring--outer" aria-hidden />

      {showDots ? (
        <span className="tess-companion__fx tess-companion__dots" aria-hidden>
          <span className="tess-companion__dot" />
          <span className="tess-companion__dot" />
          <span className="tess-companion__dot" />
        </span>
      ) : null}

      {showListenDots ? (
        <span className="tess-companion__fx tess-companion__listen-dots" aria-hidden>
          <span className="tess-companion__listen-dot" />
          <span className="tess-companion__listen-dot" />
          <span className="tess-companion__listen-dot" />
        </span>
      ) : null}

      {showWaves ? (
        <span className="tess-companion__fx tess-companion__waves" aria-hidden>
          <span className="tess-companion__wave" />
          <span className="tess-companion__wave" />
          <span className="tess-companion__wave" />
          <span className="tess-companion__wave" />
        </span>
      ) : null}

      {showIdleSparkle ? (
        <span className="tess-companion__fx tess-companion__sparkle tess-companion__sparkle--idle" aria-hidden>
          ✨
        </span>
      ) : null}

      {showWaveSparkle ? (
        <span className="tess-companion__fx tess-companion__sparkle tess-companion__sparkle--wave" aria-hidden>
          ✨
        </span>
      ) : null}

      {state === "waving" ? (
        <span className="tess-companion__fx tess-companion__wave-bubble" aria-hidden>
          👋
        </span>
      ) : null}

      {state === "comforting" ? (
        <span className="tess-companion__fx tess-companion__comfort-heart" aria-hidden>
          💜
        </span>
      ) : null}
    </>
  );
}
