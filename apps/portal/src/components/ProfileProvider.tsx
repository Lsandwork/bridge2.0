"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";

type Profile = { id: string; name: string; ageGroup: string; mode: string };

type ProfileContextValue = {
  profiles: Profile[];
  activeProfile: Profile | null;
  setActiveProfileId: (id: string | null) => void;
  lowStimulation: boolean;
  setLowStimulation: (v: boolean) => void;
  simpleLanguage: boolean;
  setSimpleLanguage: (v: boolean) => void;
  highContrast: boolean;
  setHighContrast: (v: boolean) => void;
  refreshProfiles: () => Promise<void>;
  profilesLoading: boolean;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export { ProfileContext };

const PREFS_KEY = "family-support-profile-prefs";

function profileStorageKey(userId: string) {
  return `family-support-active-profile:${userId}`;
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfileId, setActiveProfileIdState] = useState<string | null>(null);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [lowStimulation, setLowStimulationState] = useState(true);
  const [simpleLanguage, setSimpleLanguageState] = useState(false);
  const [highContrast, setHighContrastState] = useState(false);
  const lastUserIdRef = useRef<string | null>(null);

  const refreshProfiles = useCallback(async () => {
    setProfilesLoading(true);
    try {
      const res = await fetch("/api/profiles");
      const data = await res.json();
      if (Array.isArray(data)) setProfiles(data);
    } finally {
      setProfilesLoading(false);
    }
  }, []);

  useEffect(() => {
    localStorage.removeItem("family-support-active-profile");
    try {
      const prefs = JSON.parse(localStorage.getItem(PREFS_KEY) ?? "{}") as {
        lowStimulation?: boolean;
        simpleLanguage?: boolean;
        highContrast?: boolean;
      };
      if (prefs.lowStimulation !== undefined) setLowStimulationState(prefs.lowStimulation);
      if (prefs.simpleLanguage !== undefined) setSimpleLanguageState(prefs.simpleLanguage);
      if (prefs.highContrast !== undefined) setHighContrastState(prefs.highContrast);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    void refreshProfiles();
  }, [authLoading, user?.id, refreshProfiles]);

  useEffect(() => {
    if (authLoading || profilesLoading) return;

    const userId = user?.id ?? null;
    if (userId !== lastUserIdRef.current) {
      lastUserIdRef.current = userId;
      setActiveProfileIdState(null);
    }

    if (!userId || !user || profiles.length === 0) {
      setActiveProfileIdState(null);
      return;
    }

    const storageKey = profileStorageKey(userId);
    const saved = localStorage.getItem(storageKey);
    const validSaved = saved && profiles.some((p) => p.id === saved) ? saved : null;

    if (user.role === "child_user") {
      const own = profiles[0]?.id ?? null;
      if (own) {
        setActiveProfileIdState(own);
        localStorage.setItem(storageKey, own);
      }
      return;
    }

    if (validSaved) {
      setActiveProfileIdState(validSaved);
      return;
    }

    if (profiles.length === 1) {
      setActiveProfileIdState(profiles[0].id);
      localStorage.setItem(storageKey, profiles[0].id);
    } else {
      setActiveProfileIdState(null);
    }
  }, [authLoading, profilesLoading, user, profiles]);

  const savePrefs = useCallback(
    (patch: Partial<{ lowStimulation: boolean; simpleLanguage: boolean; highContrast: boolean }>) => {
      const next = {
        lowStimulation: patch.lowStimulation ?? lowStimulation,
        simpleLanguage: patch.simpleLanguage ?? simpleLanguage,
        highContrast: patch.highContrast ?? highContrast,
      };
      localStorage.setItem(PREFS_KEY, JSON.stringify(next));
    },
    [lowStimulation, simpleLanguage, highContrast]
  );

  const setLowStimulation = useCallback(
    (v: boolean) => {
      setLowStimulationState(v);
      savePrefs({ lowStimulation: v });
    },
    [savePrefs]
  );

  const setSimpleLanguage = useCallback(
    (v: boolean) => {
      setSimpleLanguageState(v);
      savePrefs({ simpleLanguage: v });
    },
    [savePrefs]
  );

  const setHighContrast = useCallback(
    (v: boolean) => {
      setHighContrastState(v);
      savePrefs({ highContrast: v });
    },
    [savePrefs]
  );

  const setActiveProfileId = useCallback(
    (id: string | null) => {
      setActiveProfileIdState(id);
      if (user?.id) {
        const storageKey = profileStorageKey(user.id);
        if (id) localStorage.setItem(storageKey, id);
        else localStorage.removeItem(storageKey);
      }
    },
    [user?.id]
  );

  const activeProfile = profiles.find((p) => p.id === activeProfileId) ?? null;

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        activeProfile,
        setActiveProfileId,
        lowStimulation,
        setLowStimulation,
        simpleLanguage,
        setSimpleLanguage,
        highContrast,
        setHighContrast,
        refreshProfiles,
        profilesLoading: authLoading || profilesLoading,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
