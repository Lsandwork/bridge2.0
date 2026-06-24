"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import {
  defaultPathway,
  findPathway,
  type SupportPathway,
  type SupportPathwayId,
} from "@/lib/support-pathways";

type SupportPathwayContextValue = {
  pathway: SupportPathway;
  pathwayId: SupportPathwayId;
  ready: boolean;
  selectPathway: (id: SupportPathwayId) => void;
};

const SupportPathwayContext = createContext<SupportPathwayContextValue | null>(null);
const STORAGE_KEY = "bridge-support-pathway";
const CHANGE_EVENT = "bridge-support-pathway-change";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
  };
}

function getSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY) ?? defaultPathway.id;
}

export function SupportPathwayProvider({ children }: { children: React.ReactNode }) {
  const storedPathwayId = useSyncExternalStore(subscribe, getSnapshot, () => defaultPathway.id);
  const pathway = findPathway(storedPathwayId);

  const value = useMemo<SupportPathwayContextValue>(
    () => ({
      pathway,
      pathwayId: pathway.id,
      ready: true,
      selectPathway: (id) => {
        const next = findPathway(id);
        window.localStorage.setItem(STORAGE_KEY, next.id);
        window.dispatchEvent(new Event(CHANGE_EVENT));
        document.documentElement.style.setProperty("--pathway-accent", next.accent);
        document.documentElement.style.setProperty("--pathway-accent-soft", next.accentSoft);
      },
    }),
    [pathway]
  );

  useEffect(() => {
    document.documentElement.style.setProperty("--pathway-accent", pathway.accent);
    document.documentElement.style.setProperty("--pathway-accent-soft", pathway.accentSoft);
  }, [pathway]);

  return <SupportPathwayContext.Provider value={value}>{children}</SupportPathwayContext.Provider>;
}

export function useSupportPathway() {
  const value = useContext(SupportPathwayContext);
  if (!value) throw new Error("useSupportPathway must be used inside SupportPathwayProvider");
  return value;
}
