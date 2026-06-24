"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { LibraryCourse } from "@family-support/data";
import { getLocalizedLibraryFilter } from "@family-support/core";
import { useLanguage } from "@/components/LanguageProvider";
import { CoverageTeaser } from "./CoverageTeaser";
import { LibraryCourseCard } from "./LibraryCourseCard";
import { LibraryFilterPills } from "./LibraryFilterPills";
import { useLessonProgress } from "./useLessonProgress";
import type { LibraryFilter } from "@family-support/core";

type Props = {
  courses: LibraryCourse[];
};

export function LibraryIndexClient({ courses }: Props) {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<LibraryFilter>("All");
  const { courseProgress } = useLessonProgress();

  const filtered = useMemo(() => {
    if (filter === "All") return courses;
    return courses.filter((c) => c.filter === filter);
  }, [courses, filter]);

  return (
    <main className="library-page mx-auto max-w-7xl px-4 py-8 md:px-8">
      <header className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">{t("library.eyebrow")}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">{t("library.title")}</h1>
        <p className="mt-3 text-base leading-relaxed text-stone-600">{t("library.serviceDescription")}</p>
        <p className="mt-4 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800">
          <strong className="text-stone-900">{t("library.demoNoteStrong")}</strong> {t("library.demoNoteText")}
        </p>
      </header>

      <div className="mt-8">
        <LibraryFilterPills active={filter} onChange={setFilter} />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {filtered.map((course) => (
          <LibraryCourseCard
            key={course.slug}
            course={course}
            progress={courseProgress(
              course.slug,
              course.lessons.map((l) => l.slug)
            )}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-center text-stone-500">{t("library.noCourses")}</p>
      ) : null}

      <div className="mt-12">
        <CoverageTeaser />
      </div>

      <p className="mt-6 text-center text-sm text-stone-600">
        {t("library.needHelp")}{" "}
        <Link href="/pricing#insurance" className="font-bold text-brand hover:underline">
          {t("library.viewCoverage")}
        </Link>
      </p>
    </main>
  );
}
