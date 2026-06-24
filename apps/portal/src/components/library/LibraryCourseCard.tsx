"use client";

import Link from "next/link";
import type { LibraryCourse } from "@family-support/data";
import { getLocalizedAccessTierLabel, getLocalizedLibraryCourse } from "@family-support/core";
import { useLanguage } from "@/components/LanguageProvider";
import { LibraryImage } from "./LibraryImage";

type Props = {
  course: LibraryCourse;
  progress: number;
};

function tierBadge(tier: LibraryCourse["accessTier"], t: (key: string) => string) {
  switch (tier) {
    case "included":
      return { text: t("library.badge.free"), className: "bg-emerald-700 text-white" };
    case "insurance_packet":
      return { text: t("library.badge.insurance"), className: "bg-brand text-white" };
    case "coaching_intensive":
      return { text: t("library.badge.coaching"), className: "bg-amber-800 text-white" };
  }
}

export function LibraryCourseCard({ course, progress }: Props) {
  const { t } = useLanguage();
  const localized = getLocalizedLibraryCourse(t, course);
  const badge = tierBadge(course.accessTier, t);
  const pct = Math.round(progress * 100);

  return (
    <Link
      href={`/library/${course.slug}`}
      className="library-card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative h-48 overflow-hidden bg-stone-100">
        <LibraryImage
          src={course.coverImageUrl}
          alt={course.coverImageAlt}
          fallbackSrc={`/library/${course.slug}/_cover.svg`}
          fill
          sizes="(max-width:768px) 100vw, 400px"
          className="transition duration-300 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
        <span
          className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shadow-sm ${badge.className}`}
        >
          {badge.text}
        </span>
        <div className="absolute bottom-3 left-4 right-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-white drop-shadow-md">{localized.filter}</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col bg-white p-5">
        <h2 className="text-lg font-bold leading-snug text-stone-900">{localized.title}</h2>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-stone-600">{localized.subtitle}</p>
        <p className="mt-3 text-xs font-semibold text-stone-500">
          {t("library.lessonsProgress", { count: String(course.lessonCount), pct: String(pct) })}
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-200">
          <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-3 text-xs text-stone-500">{getLocalizedAccessTierLabel(t, course.accessTier)}</p>
        <span className="mt-3 text-sm font-bold text-brand group-hover:underline">{t("library.viewCurriculum")}</span>
      </div>
    </Link>
  );
}
