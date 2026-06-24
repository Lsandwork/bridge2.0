"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_IDLE_AFTER_MS = 12_000;
const DEFAULT_COOLDOWN_MS = 20_000;
const DEFAULT_WAVE_MS = 2_400;
const POLL_MS = 1_500;

type Options = {
  enabled?: boolean;
  paused?: boolean;
  idleAfterMs?: number;
  cooldownMs?: number;
  waveDurationMs?: number;
  onWaveStart?: () => void;
  onWaveComplete?: () => void;
};

/**
 * Personalized interaction cue — gentle idle wave after inactivity.
 * Cooldown prevents repetitive waving (adaptive companion behavior).
 */
export function useIdleWave({
  enabled = true,
  paused = false,
  idleAfterMs = DEFAULT_IDLE_AFTER_MS,
  cooldownMs = DEFAULT_COOLDOWN_MS,
  waveDurationMs = DEFAULT_WAVE_MS,
  onWaveStart,
  onWaveComplete,
}: Options = {}) {
  const [isWaving, setIsWaving] = useState(false);
  const lastActivityRef = useRef(0);
  const lastWaveEndRef = useRef(0);
  const isWavingRef = useRef(false);
  const waveEndTimerRef = useRef<number | null>(null);
  const pollRef = useRef<number | null>(null);
  const initializedRef = useRef(false);

  const bumpActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (isWavingRef.current) {
      isWavingRef.current = false;
      setIsWaving(false);
      if (waveEndTimerRef.current) {
        window.clearTimeout(waveEndTimerRef.current);
        waveEndTimerRef.current = null;
      }
    }
  }, []);

  const triggerWave = useCallback(() => {
    if (isWavingRef.current || paused || !enabled) return;
    isWavingRef.current = true;
    setIsWaving(true);
    onWaveStart?.();
    waveEndTimerRef.current = window.setTimeout(() => {
      isWavingRef.current = false;
      setIsWaving(false);
      lastWaveEndRef.current = Date.now();
      waveEndTimerRef.current = null;
      onWaveComplete?.();
    }, waveDurationMs);
  }, [enabled, paused, waveDurationMs, onWaveStart, onWaveComplete]);

  useEffect(() => {
    isWavingRef.current = isWaving;
  }, [isWaving]);

  useEffect(() => {
    if (!initializedRef.current) {
      lastActivityRef.current = Date.now();
      initializedRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (!enabled || paused) {
      if (pollRef.current) window.clearInterval(pollRef.current);
      if (waveEndTimerRef.current) window.clearTimeout(waveEndTimerRef.current);
      isWavingRef.current = false;
      return;
    }

    const tick = () => {
      if (isWavingRef.current) return;
      const idleMs = Date.now() - lastActivityRef.current;
      const sinceLastWave = Date.now() - lastWaveEndRef.current;
      if (idleMs >= idleAfterMs && sinceLastWave >= cooldownMs) {
        triggerWave();
      }
    };

    pollRef.current = window.setInterval(tick, POLL_MS);
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
      if (waveEndTimerRef.current) window.clearTimeout(waveEndTimerRef.current);
    };
  }, [enabled, paused, idleAfterMs, cooldownMs, triggerWave]);

  const visibleWaving = enabled && !paused && isWaving;

  return { isWaving: visibleWaving, bumpActivity, triggerWave };
}
