"use client";

import { useCallback, useState } from "react";
import { stopTessVoice } from "@/lib/tess/voice-client";
import { DEFAULT_TESS_VOICE_ENABLED, TESS_VOICE_STORAGE_KEY } from "./tessTypes";

function readStoredVoiceEnabled(): boolean {
  if (typeof window === "undefined") return DEFAULT_TESS_VOICE_ENABLED;
  try {
    const saved = localStorage.getItem(TESS_VOICE_STORAGE_KEY);
    if (saved === "true") return true;
    if (saved === "false") return false;
  } catch {
    /* ignore */
  }
  return DEFAULT_TESS_VOICE_ENABLED;
}

export function useTessVoice() {
  const [enabled, setEnabledState] = useState(() =>
    typeof window === "undefined" ? DEFAULT_TESS_VOICE_ENABLED : readStoredVoiceEnabled()
  );

  const setEnabled = useCallback((next: boolean) => {
    setEnabledState(next);
    try {
      localStorage.setItem(TESS_VOICE_STORAGE_KEY, String(next));
    } catch {
      /* ignore */
    }
    if (!next) stopTessVoice();
  }, []);

  const toggle = useCallback(() => {
    setEnabled(!enabled);
  }, [enabled, setEnabled]);

  return { enabled, setEnabled, toggle };
}
