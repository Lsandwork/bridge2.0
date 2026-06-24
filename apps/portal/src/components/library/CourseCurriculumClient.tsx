"use client";

import Link from "next/link";
import type { LibraryCourse } from "@family-support/data";
import { getLocalizedAccessTierLabel, getLocalizedLibraryCourse } from "@family-support/core";
import { useLanguage } from "@/components/LanguageProvider";
import { CurriculumRow } from "./LessonPlanSections";
import { LibraryImage } from "./LibraryImage";
import { useLessonProgress } from "./useLessonProgress";
import { useLibraryAccess } from "./useLibraryAccess";

type Props = {
  course: LibraryCourse;
};

export function CourseCurriculumClient({ course }: Props) {
  const { t } = useLanguage();
  const localized = getLocalizedLibraryCourse(t, course);
  const { courseProgress, isComplete } = useLessonProgress();
  const { canUnlockCourse } = useLibraryAccess();
  const progress = courseProgress(
    course.slug,
    course.lessons.map((l) => l.slug)
  );
  const pct = Math.round(progress * 100);

  const nextLesson = course.lessons.find(
    (l) =>
      !isComplete(course.slug, l.slug) &&
      canUnlockCourse(course.slug, course.accessTier === "included", l.isFreePreview)
  ) ?? course.lessons.find((l) => l.isFreePreview);

  return (
    <main className="library-page mx-auto max-w-4xl px-4 py-8 md:px-8">
      <Link href="/library" className="text-sm font-bold text-brand hover:underline">
        {t("library.backToLibrary")}
      </Link>

      <article className="library-card mt-6 overflow-hidden">
        <div className="relative h-56 w-full overflow-hidden bg-stone-100 md:h-64">
          <LibraryImage
            src={course.coverImageUrl}
            alt={course.coverImageAlt}
            fallbackSrc={`/library/${course.slug}/_cover.svg`}
            fill
            priority
            sizes="800px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <p className="text-xs font-bold uppercase tracking-wide text-white/90">{localized.filter}</p>
            <h1 className="mt-1 text-3xl font-bold drop-shadow-md">{localized.title}</h1>
            <p className="mt-1 text-sm text-white/95 drop-shadow">{localized.subtitle}</p>
          </div>
        </div>
        <div className="bg-white p-6">
          <p className="leading-relaxed text-stone-600">{localized.description}</p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold text-stone-500">
            <span>{t("library.lessonsProgress", { count: String(course.lessonCount), pct: String(pct) }).split(" · ")[0]}</span>
            <span>{pct}%</span>
            <span className="text-brand">{getLocalizedAccessTierLabel(t, course.accessTier)}</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-200">
            <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
          </div>
          {nextLesson ? (
            <Link
              href={`/library/${course.slug}/lessons/${nextLesson.slug}`}
              className="mt-6 inline-flex rounded-full bg-brand px-6 py-3 font-bold text-white hover:bg-brand-dark"
            >
              {pct > 0 ? t("library.continueCourse") : t("library.startCourse")}
            </Link>
          ) : null}
        </div>
      </article>

      <section className="library-card mt-6 bg-white p-6">
        <h2 className="text-sm font-bold uppercase tracking-wide text-stone-500">{t("library.payerDocs")}</h2>
        <p className="mt-2 font-bold text-stone-900">{localized.documentation.label}</p>
        <p className="mt-1 text-sm leading-relaxed text-stone-600">{localized.documentation.detail}</p>
        {course.documentation.referenceCodes?.length ? (
          <p className="mt-3 text-xs text-stone-500">
            {t("library.referenceCodes", { codes: course.documentation.referenceCodes.join(" · ") })}
          </p>
        ) : null}
        <Link href="/pricing#insurance" className="mt-4 inline-block text-sm font-bold text-brand hover:underline">
          {t("library.viewCoverage")}
        </Link>
      </section>

      {course.accessTier === "coaching_intensive" ? (
        <section className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="text-lg font-bold text-stone-900">Multi-week coaching plan</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-700">
            These plans include daily parent actions and tracking prompts formatted for regional center quarterly
            reports and Medi-Cal re-authorization. Most families unlock through their service coordinator — not
            credit card.
          </p>
          <Link
            href="/pricing#medi-cal-ca"
            className="mt-4 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-bold text-white hover:bg-brand-dark"
          >
            Request authorization packet
          </Link>
        </section>
      ) : null}

      <section className="library-card mt-8 bg-white p-6">
        <h2 className="text-xl font-bold text-stone-900">Curriculum</h2>
        <div className="mt-2 divide-y divide-stone-100">
          {course.lessons.map((lesson, index) => (
            <CurriculumRow
              key={lesson.slug}
              courseSlug={course.slug}
              courseTitle={course.title}
              lesson={lesson}
              index={index}
              unlocked={canUnlockCourse(course.slug, course.accessTier === "included", lesson.isFreePreview)}
              done={isComplete(course.slug, lesson.slug)}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
