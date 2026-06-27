"use client";

import { Component, type ErrorInfo, type ReactNode, useCallback, useState } from "react";
import { TessIcon } from "./TessIcon";
import { TessCharacterFace } from "./TessCharacterFace";
import { TessVoiceWaves } from "./TessVoiceWaves";
import type { TessCharacterIntensity, TessCharacterSize, TessCharacterState } from "./tessCharacterState";
import { useBlink } from "@/hooks/useBlink";
import { useIdleWave } from "@/hooks/useIdleWave";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useWink } from "@/hooks/useWink";
import "./tess-animated-character.css";

export type { TessCharacterState };

export type TessAnimatedCharacterProps = {
  state?: TessCharacterState;
  size?: TessCharacterSize;
  intensity?: TessCharacterIntensity;
  enableBlink?: boolean;
  enableWink?: boolean;
  enableIdleWave?: boolean;
  enableMouthAnimation?: boolean;
  enableDance?: boolean;
  enableMicroInteractions?: boolean;
  enableFaceTracking?: boolean;
  showWaves?: boolean;
  audioLevel?: number;
  className?: string;
  onWaveComplete?: () => void;
  onDanceComplete?: () => void;
  onInteract?: () => void;
};

const AVATAR_PX: Record<TessCharacterSize, number> = {
  sm: 48,
  md: 80,
  lg: 120,
  xl: 144,
  fullscreen: 176,
};

const WAVE_PAUSED: TessCharacterState[] = [
  "listening",
  "userSpeaking",
  "thinking",
  "tessSpeaking",
  "error",
  "confused",
  "dancing",
];

const WINK_STATES: TessCharacterState[] = ["greeting", "happy", "winking", "celebrating", "waving"];

type FallbackProps = { size: TessCharacterSize; className?: string };

function TessCharacterFallback({ size, className }: FallbackProps) {
  return (
    <div className={`tess-char tess-char--${size} tess-char--fallback ${className ?? ""}`.trim()} role="img" aria-label="Nuvio avatar">
      <TessIcon size={AVATAR_PX[size]} variant="avatar" decorative className="tess-char__icon" />
    </div>
  );
}

class TessCharacterErrorBoundary extends Component<
  { size: TessCharacterSize; className?: string; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn("[TessAnimatedCharacter] fallback render", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <TessCharacterFallback size={this.props.size} className={this.props.className} />;
    }
    return this.props.children;
  }
}

function TessAnimatedCharacterInner({
  state = "idle",
  size = "md",
  intensity = "normal",
  enableBlink = true,
  enableWink = true,
  enableIdleWave = true,
  enableMouthAnimation = true,
  enableDance = true,
  enableMicroInteractions = true,
  enableFaceTracking = true,
  showWaves = true,
  audioLevel = 0,
  className = "",
  onWaveComplete,
  onInteract,
}: TessAnimatedCharacterProps) {
  const reducedMotion = useReducedMotion();
  const wavePaused = WAVE_PAUSED.includes(state);
  const { isWaving, triggerWave, bumpActivity } = useIdleWave({
    enabled: enableIdleWave && !reducedMotion,
    paused: wavePaused || state !== "idle",
    onWaveComplete,
  });

  let displayState: TessCharacterState = state;
  if (isWaving && state === "idle") displayState = "waving";
  if (state === "dancing" && !enableDance) displayState = "happy";

  const isBlinking = useBlink({
    enabled: enableBlink && !reducedMotion && displayState !== "sleeping" && displayState !== "dancing",
  });
  const { isWinking, triggerWink } = useWink({
    enabled: enableWink && !reducedMotion && WINK_STATES.includes(displayState),
    chance: 0.12,
  });
  const showWink = displayState === "winking" || isWinking;

  const mouthLevel = enableMouthAnimation && displayState === "tessSpeaking" ? audioLevel : 0;
  const [microWave, setMicroWave] = useState(false);

  const handlePointerEnter = useCallback(() => {
    if (!enableMicroInteractions || reducedMotion) return;
    if (displayState === "idle") bumpActivity();
    if (enableWink && Math.random() < 0.25) triggerWink();
  }, [enableMicroInteractions, reducedMotion, displayState, bumpActivity, enableWink, triggerWink]);

  const handleClick = useCallback(() => {
    onInteract?.();
    bumpActivity();
    if (!enableMicroInteractions || reducedMotion) return;
    if (!wavePaused && displayState !== "tessSpeaking" && displayState !== "listening") {
      setMicroWave(true);
      triggerWave();
      triggerWink();
      window.setTimeout(() => setMicroWave(false), 1800);
    }
  }, [onInteract, bumpActivity, enableMicroInteractions, reducedMotion, wavePaused, displayState, triggerWave, triggerWink]);

  const rootClass = [
    "tess-char",
    `tess-char--${size}`,
    `tess-char--${displayState}`,
    `tess-char--intensity-${intensity}`,
    reducedMotion ? "tess-char--reduced" : "",
    microWave || isWaving ? "tess-char--waving" : "",
    displayState === "dancing" ? "tess-char--dancing" : "",
    enableFaceTracking ? "tess-char--tracking" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={rootClass}
      role="img"
      aria-label="Nuvio avatar"
      data-tess-character-state={displayState}
      onPointerEnter={handlePointerEnter}
      onClick={handleClick}
    >
      <div className="tess-char__inner">
        <div className="tess-char__aura" aria-hidden />
        <div className="tess-char__glow" aria-hidden />
        <div className="tess-char__ring" aria-hidden />
        <div className="tess-char__shimmer" aria-hidden />

        {showWaves ? <TessVoiceWaves state={displayState} amplitude={mouthLevel || audioLevel} /> : null}

        <div className="tess-char__portrait">
          <TessIcon size={AVATAR_PX[size]} variant="avatar" decorative className="tess-char__icon" />
          <TessCharacterFace
            state={displayState}
            isBlinking={isBlinking}
            isWinking={showWink}
            audioLevel={mouthLevel || audioLevel}
          />
        </div>

        <span className="tess-char__hand tess-char__hand--left" aria-hidden />
        <span className="tess-char__hand tess-char__hand--right" aria-hidden />

        {(displayState === "thinking" || displayState === "confused") && (
          <div className="tess-char__dots" aria-hidden>
            <span className="tess-char__dot" />
            <span className="tess-char__dot" />
            <span className="tess-char__dot" />
          </div>
        )}

        {(displayState === "celebrating" || displayState === "greeting" || displayState === "waving" || displayState === "dancing") && (
          <>
            <span className="tess-char__spark tess-char__spark--1" aria-hidden>✦</span>
            <span className="tess-char__spark tess-char__spark--2" aria-hidden>✦</span>
          </>
        )}

        <span className="tess-char__heart" aria-hidden>💜</span>
      </div>
    </div>
  );
}

/** State-aware adaptive companion — animated Tess character with personalized interaction cues. */
export function TessAnimatedCharacter(props: TessAnimatedCharacterProps) {
  const size = props.size ?? "md";
  return (
    <TessCharacterErrorBoundary size={size} className={props.className}>
      <TessAnimatedCharacterInner {...props} />
    </TessCharacterErrorBoundary>
  );
}
