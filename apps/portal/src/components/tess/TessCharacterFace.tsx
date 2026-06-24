"use client";

import type { TessCharacterState } from "./tessCharacterState";

type Props = {
  state: TessCharacterState;
  isBlinking?: boolean;
  isWinking?: boolean;
  audioLevel?: number;
  className?: string;
};

function mouthScale(state: TessCharacterState, audioLevel?: number): number {
  if (state === "tessSpeaking") {
    const safe = Math.min(Math.max(audioLevel ?? 0.4, 0), 1);
    return 0.45 + safe * 0.75;
  }
  return 1;
}

/**
 * SVG face overlay — blink, wink, smile, and speaking mouth on Tess portrait.
 * Decorative; parent provides aria-label.
 */
export function TessCharacterFace({ state, isBlinking = false, isWinking = false, audioLevel, className = "" }: Props) {
  const speaking = state === "tessSpeaking";
  const scaleY = mouthScale(state, audioLevel);

  const leftEyeClass = [
    "tess-char-face__eye",
    isBlinking || isWinking ? "tess-char-face__eye--blink" : "",
    state === "listening" || state === "userSpeaking" ? "tess-char-face__eye--focus" : "",
    state === "thinking" || state === "confused" ? "tess-char-face__eye--curious" : "",
    state === "sleeping" ? "tess-char-face__eye--sleep" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const rightEyeClass = [
    "tess-char-face__eye",
    isBlinking ? "tess-char-face__eye--blink" : "",
    isWinking ? "" : "",
    state === "listening" || state === "userSpeaking" ? "tess-char-face__eye--focus" : "",
    state === "thinking" || state === "confused" ? "tess-char-face__eye--curious" : "",
    state === "sleeping" ? "tess-char-face__eye--sleep" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const mouthClass = [
    "tess-char-face__mouth",
    speaking ? "tess-char-face__mouth--speak" : "",
    state === "happy" || state === "celebrating" || state === "dancing" || state === "greeting" || state === "waving"
      ? "tess-char-face__mouth--wide"
      : "",
    state === "userSpeaking" || state === "listening" ? "tess-char-face__mouth--closed" : "",
    state === "error" || state === "confused" ? "tess-char-face__mouth--soft" : "",
    state === "winking" ? "tess-char-face__mouth--playful" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <svg
      className={`tess-char-face ${className}`.trim()}
      viewBox="0 0 100 100"
      aria-hidden
      preserveAspectRatio="xMidYMid meet"
    >
      <g className="tess-char-face__eyes">
        <path className={`${leftEyeClass} tess-char-face__eye--left`} d="M32 42 Q38 36 44 42" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path
          className={`${rightEyeClass} tess-char-face__eye--right ${isWinking ? "tess-char-face__eye--wink" : ""}`}
          d="M56 42 Q62 36 68 42"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>

      {speaking ? (
        <ellipse
          className={mouthClass}
          cx="50"
          cy="62"
          rx="8"
          ry={4 * scaleY}
          style={{ transform: `scaleY(${scaleY})`, transformOrigin: "50px 62px" }}
        />
      ) : (
        <path
          className={mouthClass}
          d={
            state === "happy" || state === "celebrating" || state === "dancing" || state === "waving" || state === "greeting"
              ? "M36 56 Q50 72 64 56"
              : "M38 58 Q50 68 62 58"
          }
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      )}

      {(state === "happy" || state === "celebrating" || state === "dancing") && (
        <>
          <circle className="tess-char-face__cheek tess-char-face__cheek--left" cx="28" cy="54" r="4" />
          <circle className="tess-char-face__cheek tess-char-face__cheek--right" cx="72" cy="54" r="4" />
        </>
      )}
    </svg>
  );
}
