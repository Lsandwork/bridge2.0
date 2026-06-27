"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { flushPetSyncQueue, queuePetEvent } from "@/lib/pets/petSync";
import { CompanionPetOverlay } from "./CompanionPetOverlay";

export type CompanionPet = {
  id: string;
  name: string;
  species: string;
  personality: string;
  growthStage: string;
  level: number;
  xp: number;
  mood: string;
  activeOutfit: Record<string, string>;
  settings: {
    motionLevel: "off" | "low" | "normal";
    bubbleFrequency: "low" | "normal" | "high";
    sound: boolean;
    voice: boolean;
    sensorySafe: boolean;
    quietMode: boolean;
    largerButtons: boolean;
    highContrast: boolean;
    simpleLanguage: boolean;
    minimized: boolean;
    disabled?: boolean;
  };
};

export type CompanionPetState = {
  pet: CompanionPet | null;
  inventory: Array<{ itemId: string; itemType: string; source: string }>;
  items: Array<{ id: string; name: string; itemType: string; theme: string | null; unlockLevel: number; assetConfig: Record<string, unknown> }>;
  diagnostics?: Record<string, unknown>;
};

type ContextValue = {
  state: CompanionPetState | null;
  loading: boolean;
  refresh: () => Promise<void>;
  createPet: (input: { name: string; species: string; personality: string; settings?: Record<string, unknown> }) => Promise<void>;
  updatePet: (patch: Partial<CompanionPet>) => Promise<void>;
  awardXp: (eventType: string, metadata?: Record<string, unknown>) => Promise<void>;
  equipItem: (slot: string, itemId: string) => Promise<void>;
};

const CompanionPetContext = createContext<ContextValue | null>(null);

const hiddenPrefixes = ["/login", "/onboarding", "/privacy", "/terms", "/safety", "/data-policy", "/change-password"];

export function CompanionPetProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const [state, setState] = useState<CompanionPetState | null>(null);
  const [loading, setLoading] = useState(false);

  const shouldShow = Boolean(
    user &&
      !authLoading &&
      !hiddenPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
  );

  const cacheKey = user ? `nuvio.pet.state.${user.id}` : null;

  const refresh = useCallback(async () => {
    if (!user) {
      setState(null);
      return;
    }
    setLoading(true);
    try {
      if (cacheKey) {
        const cached = window.localStorage.getItem(cacheKey);
        if (cached) setState(JSON.parse(cached));
      }
      const res = await fetch("/api/pets", { credentials: "include", cache: "no-store" });
      const next = await res.json();
      if (!res.ok) throw new Error(next.error);
      setState(next);
      if (cacheKey) window.localStorage.setItem(cacheKey, JSON.stringify(next));
    } finally {
      setLoading(false);
    }
  }, [cacheKey, user]);

  useEffect(() => {
    if (!user || authLoading) return;
    void refresh();
    void flushPetSyncQueue();
  }, [authLoading, refresh, user]);

  const post = useCallback(async (payload: Record<string, unknown>) => {
    try {
      const res = await fetch("/api/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const next = data.state ?? data;
      if (next?.pet !== undefined) {
        setState(next);
        if (cacheKey) window.localStorage.setItem(cacheKey, JSON.stringify(next));
      } else {
        await refresh();
      }
    } catch {
      queuePetEvent({ action: String(payload.action ?? "sync"), payload, at: new Date().toISOString() });
    }
  }, [cacheKey, refresh]);

  const createPet = useCallback((input: { name: string; species: string; personality: string; settings?: Record<string, unknown> }) => {
    return post({ action: "create", ...input });
  }, [post]);

  const updatePet = useCallback((patch: Partial<CompanionPet>) => {
    if (!state?.pet) return Promise.resolve();
    return post({ action: "update", petId: state.pet.id, ...patch });
  }, [post, state?.pet]);

  const awardXp = useCallback((eventType: string, metadata?: Record<string, unknown>) => {
    return post({ action: "award-xp", eventType, metadata });
  }, [post]);

  const equipItem = useCallback((slot: string, itemId: string) => {
    if (!state?.pet) return Promise.resolve();
    return post({
      action: "equip",
      petId: state.pet.id,
      activeOutfit: { ...(state.pet.activeOutfit ?? {}), [slot]: itemId },
    });
  }, [post, state?.pet]);

  const value = useMemo<ContextValue>(() => ({
    state,
    loading,
    refresh,
    createPet,
    updatePet,
    awardXp,
    equipItem,
  }), [awardXp, createPet, equipItem, loading, refresh, state, updatePet]);

  return (
    <CompanionPetContext.Provider value={value}>
      {children}
      {shouldShow ? <CompanionPetOverlay /> : null}
    </CompanionPetContext.Provider>
  );
}

export function useCompanionPet() {
  const ctx = useContext(CompanionPetContext);
  if (!ctx) throw new Error("useCompanionPet must be used within CompanionPetProvider");
  return ctx;
}
