"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "family-support-lesson-progress";

function readProgress(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function useLessonProgress() {
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    setCompleted(readProgress());
  }, []);

  const markComplete = useCallback((lessonKey: string) => {
    setCompleted((prev) => {
      if (prev.includes(lessonKey)) return prev;
      const next = [...prev, lessonKey];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isComplete = useCallback(
    (courseSlug: string, lessonSlug: string) => completed.includes(`${courseSlug}/${lessonSlug}`),
    [completed]
  );

  const courseProgress = useCallback(
    (courseSlug: string, lessonSlugs: string[]) => {
      if (lessonSlugs.length === 0) return 0;
      const done = lessonSlugs.filter((s) => completed.includes(`${courseSlug}/${s}`)).length;
      return done / lessonSlugs.length;
    },
    [completed]
  );

  return { completed, markComplete, isComplete, courseProgress };
}
