"use client";

import { useEffect, useState } from "react";

type LibraryAccess = {
  hasFullAccess: boolean;
  libraryCredits: number;
  accessPlan: "free" | "monthly" | "annual";
  accessExpiresAt: string | null;
  courseGrants?: { courseSlug: string; tier: string }[];
};

export function useLibraryAccess() {
  const [access, setAccess] = useState<LibraryAccess | null>(null);

  useEffect(() => {
    fetch("/api/library/access")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setAccess(data))
      .catch(() => setAccess(null));
  }, []);

  const canUnlockCourse = (courseSlug: string, included: boolean, isFreePreview: boolean) => {
    if (included || isFreePreview) return true;
    if (!access) return false;
    if (access.courseGrants?.some((g) => g.courseSlug === courseSlug)) return true;
    return access.hasFullAccess || access.libraryCredits > 0;
  };

  return { access, canUnlockCourse };
}
