"use client";

import { useEffect, useState } from "react";

type Options = {
  enabled?: boolean;
  chance?: number;
};

/**
 * Occasional friendly wink — personalized interaction cue, not constant.
 */
export function useWink({ enabled = true, chance = 0.15 }: Options = {}) {
  const [isWinking, setIsWinking] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let timer: number | null = null;
    let closeTimer: number | null = null;

    const schedule = () => {
      const delay = 8000 + Math.random() * 12000;
      timer = window.setTimeout(() => {
        if (Math.random() < chance) {
          setIsWinking(true);
          closeTimer = window.setTimeout(() => {
            setIsWinking(false);
            schedule();
          }, 280);
        } else {
          schedule();
        }
      }, delay);
    };

    schedule();
    return () => {
      if (timer) window.clearTimeout(timer);
      if (closeTimer) window.clearTimeout(closeTimer);
    };
  }, [enabled, chance]);

  const triggerWink = () => {
    if (!enabled) return;
    setIsWinking(true);
    window.setTimeout(() => setIsWinking(false), 280);
  };

  return { isWinking, triggerWink };
}
