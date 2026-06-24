"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getWaveEngagementMs, type TessMotionPresetKey } from "./tessMotionPreset";
import { useReducedMotion } from "./useReducedMotion";

const IDLE_BEFORE_WAVE_MS = 10_000;
const MIN_BETWEEN_WAVES_MS = 25_000;
const POLL_MS = 2_000;

type Options = {
  /** True when Tess would otherwise be idle (no override, not busy) */
  enabled: boolean;
  motionPreset?: TessMotionPresetKey;
};

/**
 * Gently re-engages the user when idle: Tess waves after ~10s,
 * for ~3s, then waits at least 25s before waving again.
 */
export function useTessEngagement({ enabled, motionPreset = "chat" }: Options) {
  const reducedMotion = useReducedMotion();
  const waveDurationMs = getWaveEngagementMs(motionPreset);
  const [isWaving, setIsWaving] = useState(false);
  const lastActivityRef = useRef(Date.now());
  const lastWaveEndRef = useRef(0);
  const isWavingRef = useRef(false);
  const pollRef = useRef<number | null>(null);
  const waveEndRef = useRef<number | null>(null);

  const bumpActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    isWavingRef.current = false;
    setIsWaving(false);
    if (waveEndRef.current) {
      window.clearTimeout(waveEndRef.current);
      waveEndRef.current = null;
    }
  }, []);

  useEffect(() => {
    isWavingRef.current = isWaving;
  }, [isWaving]);

  useEffect(() => {
    if (!enabled || reducedMotion) {
      isWavingRef.current = false;
      setIsWaving(false);
      return;
    }

    const tick = () => {
      if (isWavingRef.current) return;
      const idleMs = Date.now() - lastActivityRef.current;
      const sinceLastWave = Date.now() - lastWaveEndRef.current;

      if (idleMs >= IDLE_BEFORE_WAVE_MS && sinceLastWave >= MIN_BETWEEN_WAVES_MS) {
        isWavingRef.current = true;
        setIsWaving(true);
        waveEndRef.current = window.setTimeout(() => {
          isWavingRef.current = false;
          setIsWaving(false);
          lastWaveEndRef.current = Date.now();
          waveEndRef.current = null;
        }, waveDurationMs);
      }
    };

    pollRef.current = window.setInterval(tick, POLL_MS);
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
      if (waveEndRef.current) window.clearTimeout(waveEndRef.current);
    };
  }, [enabled, reducedMotion, waveDurationMs]);

  return { isWaving, bumpActivity };
}
