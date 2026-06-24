"use client";

import { useEffect, useState } from "react";

type Options = {
  enabled?: boolean;
  minIntervalMs?: number;
  maxIntervalMs?: number;
  blinkDurationMs?: number;
};

/**
 * Natural blink timing for state-aware avatar face overlay.
 * Randomized interval between blinks (4–7s default).
 */
export function useBlink({
  enabled = true,
  minIntervalMs = 4000,
  maxIntervalMs = 7000,
  blinkDurationMs = 140,
}: Options = {}) {
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let blinkTimer: number | null = null;
    let closeTimer: number | null = null;

    const schedule = () => {
      const delay = minIntervalMs + Math.random() * (maxIntervalMs - minIntervalMs);
      blinkTimer = window.setTimeout(() => {
        setIsBlinking(true);
        closeTimer = window.setTimeout(() => {
          setIsBlinking(false);
          schedule();
        }, blinkDurationMs);
      }, delay);
    };

    schedule();
    return () => {
      if (blinkTimer) window.clearTimeout(blinkTimer);
      if (closeTimer) window.clearTimeout(closeTimer);
    };
  }, [enabled, minIntervalMs, maxIntervalMs, blinkDurationMs]);

  return enabled && isBlinking;
}
