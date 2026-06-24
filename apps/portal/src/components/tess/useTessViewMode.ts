"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  DEFAULT_TESS_VIEW_MODE,
  TESS_VIEW_MODE_STORAGE_KEY,
  type TessViewMode,
} from "./tessTypes";

const VIEW_MODE_EVENT = "bridge-tess-view-mode-change";

function readStoredViewMode(): TessViewMode {
  if (typeof window === "undefined") return DEFAULT_TESS_VIEW_MODE;
  try {
    const saved = localStorage.getItem(TESS_VIEW_MODE_STORAGE_KEY);
    if (saved === "chat" || saved === "fullscreen") return saved;
  } catch {
    /* ignore */
  }
  return DEFAULT_TESS_VIEW_MODE;
}

function subscribeViewMode(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener(VIEW_MODE_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(VIEW_MODE_EVENT, handler);
  };
}

/**
 * View mode for Tess chat vs fullscreen.
 * Uses useSyncExternalStore so SSR and the first client render match (no hydration mismatch).
 * localStorage is read after hydration via the client snapshot.
 */
export function useTessViewMode(initial?: TessViewMode) {
  const storedMode = useSyncExternalStore(
    subscribeViewMode,
    readStoredViewMode,
    () => DEFAULT_TESS_VIEW_MODE
  );

  const viewMode = initial ?? storedMode;

  const setViewMode = useCallback((next: TessViewMode) => {
    try {
      localStorage.setItem(TESS_VIEW_MODE_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event(VIEW_MODE_EVENT));
  }, []);

  return { viewMode, setViewMode };
}
