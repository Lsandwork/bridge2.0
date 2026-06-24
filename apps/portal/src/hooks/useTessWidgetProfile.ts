"use client";

import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { ProfileContext } from "@/components/ProfileProvider";

type Profile = { id: string; name: string; ageGroup: string; mode: string };

const STORAGE_PREFIX = "bridge-tess-widget-profile:";

function storageKey(userId: string) {
  return `${STORAGE_PREFIX}${userId}`;
}

/** Resolves child profile for Tess — works inside and outside My Space. */
export function useTessWidgetProfile() {
  const { user, loading: authLoading } = useAuth();
  const profileCtx = useContext(ProfileContext);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setProfiles([]);
      setSelectedId(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/profiles");
      const data = await res.json();
      const list = Array.isArray(data) ? (data as Profile[]) : [];
      setProfiles(list);
    } catch {
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    void refresh();
  }, [authLoading, user?.id, refresh]);

  useEffect(() => {
    if (authLoading || loading || !user) return;

    if (profileCtx?.activeProfile?.id) {
      setSelectedId(profileCtx.activeProfile.id);
      return;
    }

    if (profiles.length === 0) {
      setSelectedId(null);
      return;
    }

    if (user.role === "child_user") {
      setSelectedId(profiles[0].id);
      return;
    }

    const saved = localStorage.getItem(storageKey(user.id));
    const valid = saved && profiles.some((p) => p.id === saved) ? saved : null;
    setSelectedId(valid ?? profiles[0]?.id ?? null);
  }, [authLoading, loading, user, profiles, profileCtx?.activeProfile?.id]);

  const setProfileId = useCallback(
    (id: string) => {
      setSelectedId(id);
      if (user?.id) localStorage.setItem(storageKey(user.id), id);
    },
    [user?.id]
  );

  const activeProfile = useMemo(
    () => profiles.find((p) => p.id === selectedId) ?? null,
    [profiles, selectedId]
  );

  return {
    profiles,
    profileId: selectedId ?? "cp1",
    activeProfile,
    setProfileId,
    loading: authLoading || loading,
  };
}
