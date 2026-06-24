import type { CSSProperties } from "react";

export type TessMotionPresetKey = "fullscreen" | "chat";

export type TessMotionPreset = {
  intensity: "calm" | "minimal";
  floatDistance: number;
  breathScale: number;
  speakingScale: number;
  tiltDegrees: number;
  idleFloatDuration: number;
  idleBreathDuration: number;
  idleTiltDuration: number;
  speakingBodyDuration: number;
  speakingFacePulseDuration: number;
  speakingWaveDuration: number;
  listeningRingDuration: number;
  thinkingPulseDuration: number;
  wavingDuration: number;
  waveEngagementDuration: number;
};

/** Target calm motion for Full Screen Tess Mode */
export const FULLSCREEN_TESS_ANIMATION: TessMotionPreset = {
  intensity: "calm",
  floatDistance: 6,
  breathScale: 1.025,
  speakingScale: 1.035,
  tiltDegrees: 1.5,
  idleFloatDuration: 4200,
  idleBreathDuration: 5200,
  idleTiltDuration: 6500,
  speakingBodyDuration: 1800,
  speakingFacePulseDuration: 1200,
  speakingWaveDuration: 1400,
  listeningRingDuration: 2200,
  thinkingPulseDuration: 1800,
  wavingDuration: 2600,
  waveEngagementDuration: 2600,
};

/** Subtle motion for chat status card */
export const CHAT_TESS_ANIMATION: TessMotionPreset = {
  intensity: "minimal",
  floatDistance: 3,
  breathScale: 1.015,
  speakingScale: 1.02,
  tiltDegrees: 1,
  idleFloatDuration: 5200,
  idleBreathDuration: 5600,
  idleTiltDuration: 7200,
  speakingBodyDuration: 2200,
  speakingFacePulseDuration: 1400,
  speakingWaveDuration: 1600,
  listeningRingDuration: 2600,
  thinkingPulseDuration: 2000,
  wavingDuration: 2800,
  waveEngagementDuration: 2800,
};

export const tessMotionPreset: Record<TessMotionPresetKey, TessMotionPreset> = {
  fullscreen: FULLSCREEN_TESS_ANIMATION,
  chat: CHAT_TESS_ANIMATION,
};

export type TessMotionCssVars = CSSProperties & Record<`--tess-${string}`, string>;

export function getTessMotionCssVars(preset: TessMotionPresetKey): TessMotionCssVars {
  const p = tessMotionPreset[preset];
  return {
    "--tess-float-px": `${p.floatDistance}px`,
    "--tess-breath-scale": String(p.breathScale),
    "--tess-speak-scale": String(p.speakingScale),
    "--tess-tilt-deg": `${p.tiltDegrees}deg`,
    "--tess-idle-float-dur": `${p.idleFloatDuration}ms`,
    "--tess-idle-breath-dur": `${p.idleBreathDuration}ms`,
    "--tess-idle-tilt-dur": `${p.idleTiltDuration}ms`,
    "--tess-speak-body-dur": `${p.speakingBodyDuration}ms`,
    "--tess-speak-face-dur": `${p.speakingFacePulseDuration}ms`,
    "--tess-speak-wave-dur": `${p.speakingWaveDuration}ms`,
    "--tess-listen-ring-dur": `${p.listeningRingDuration}ms`,
    "--tess-think-dur": `${p.thinkingPulseDuration}ms`,
    "--tess-wave-dur": `${p.wavingDuration}ms`,
  } as TessMotionCssVars;
}

export function getWaveEngagementMs(preset: TessMotionPresetKey): number {
  return tessMotionPreset[preset].waveEngagementDuration;
}
