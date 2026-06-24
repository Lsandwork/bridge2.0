"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { detectFeelingBetter } from "@/lib/tess/emotionDetection";
import { startTessDanceMusic, stopTessDanceMusic } from "@/lib/tess/tessDanceAudio";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type Options = {
  lowStimulation?: boolean;
};

type DancePhase = "idle" | "initial" | "continue-prompt" | "extended";

/**
 * Emotion-aware support flow — gentle dance break with user-controlled duration.
 */
export function useTessDanceBreak({ lowStimulation = false }: Options = {}) {
  const reducedMotion = useReducedMotion();
  const [shouldShowDancePrompt, setShouldShowDancePrompt] = useState(false);
  const [isDancing, setIsDancing] = useState(false);
  const [danceSecondsRemaining, setDanceSecondsRemaining] = useState(0);
  const [phase, setPhase] = useState<DancePhase>("idle");
  const [showSafetyMessage, setShowSafetyMessage] = useState(false);
  const timerRef = useRef<number | null>(null);
  const pendingTextRef = useRef<string | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopDance = useCallback(() => {
    clearTimer();
    stopTessDanceMusic();
    setIsDancing(false);
    setDanceSecondsRemaining(0);
    setPhase("idle");
    setShouldShowDancePrompt(false);
  }, [clearTimer]);

  const runCountdown = useCallback(
    (seconds: number, onComplete: () => void) => {
      clearTimer();
      setDanceSecondsRemaining(seconds);
      timerRef.current = window.setInterval(() => {
        setDanceSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearTimer();
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [clearTimer]
  );

  const startDance = useCallback(async () => {
    setShouldShowDancePrompt(false);
    setIsDancing(true);
    setPhase("initial");
    if (!lowStimulation) {
      await startTessDanceMusic(reducedMotion ? 0.2 : 0.35);
    }
    runCountdown(15, () => {
      setPhase("continue-prompt");
      setIsDancing(true);
    });
  }, [lowStimulation, reducedMotion, runCountdown]);

  const continueDance = useCallback(async () => {
    setPhase("extended");
    setIsDancing(true);
    if (!lowStimulation && !reducedMotion) {
      await startTessDanceMusic(0.35);
    }
    runCountdown(30, () => {
      setPhase("continue-prompt");
    });
  }, [lowStimulation, reducedMotion, runCountdown]);

  const dismissDancePrompt = useCallback(() => {
    setShouldShowDancePrompt(false);
    pendingTextRef.current = null;
  }, []);

  const offerDance = useCallback((userText: string) => {
    pendingTextRef.current = userText;
    setShouldShowDancePrompt(true);
    setShowSafetyMessage(false);
  }, []);

  const showSafetySupport = useCallback(() => {
    setShowSafetyMessage(true);
    setShouldShowDancePrompt(false);
    stopDance();
  }, [stopDance]);

  const checkUserTextDuringDance = useCallback(
    (text: string) => {
      if (detectFeelingBetter(text)) {
        stopDance();
        return true;
      }
      return false;
    },
    [stopDance]
  );

  useEffect(() => {
    return () => {
      clearTimer();
      stopTessDanceMusic();
    };
  }, [clearTimer]);

  const dismissSafetyMessage = useCallback(() => {
    setShowSafetyMessage(false);
  }, []);

  return {
    shouldShowDancePrompt,
    isDancing,
    danceSecondsRemaining,
    phase,
    showSafetyMessage,
    startDance,
    continueDance,
    stopDance,
    dismissDancePrompt,
    dismissSafetyMessage,
    offerDance,
    showSafetySupport,
    checkUserTextDuringDance,
  };
}
