"use client";

import Link from "next/link";
import type { LibraryCourse, LibraryLesson } from "@family-support/data";
import { LessonPlanSections } from "./LessonPlanSections";
import { LibraryImage } from "./LibraryImage";
import { useLessonProgress } from "./useLessonProgress";
import { useLibraryAccess } from "./useLibraryAccess";

type Props = {
  course: LibraryCourse;
  lesson: LibraryLesson;
  lessonIndex: number;
};

export function LessonDetailClient({ course, lesson, lessonIndex }: Props) {
  const { isComplete, markComplete } = useLessonProgress();
  const { canUnlockCourse } = useLibraryAccess();
  const done = isComplete(course.slug, lesson.slug);
  const lessonKey = `${course.slug}/${lesson.slug}`;
  const unlocked = canUnlockCourse(course.slug, course.accessTier === "included", lesson.isFreePreview);

  const prev = course.lessons[lessonIndex - 1];
  const next = course.lessons[lessonIndex + 1];

  if (!unlocked) {
    return (
      <main className="library-page mx-auto max-w-3xl px-4 py-8 md:px-8">
        <Link href={`/library/${course.slug}`} className="text-sm font-bold text-brand hover:underline">
          ← Back to {course.title}
        </Link>
        <section className="library-card mt-6 overflow-hidden bg-white">
          <div className="relative h-48 w-full bg-stone-200">
            <LibraryImage src={lesson.imageUrl} alt={lesson.imageAlt} fill sizes="600px" />
            <div className="absolute inset-0 bg-black/40" />
          </div>
          <div className="p-8 text-center">
            <h1 className="text-xl font-bold text-stone-900">{lesson.title}</h1>
            <p className="mt-3 text-stone-600">
              This lesson is part of your home-program plan. Unlock it through Medi-Cal authorization, insurance
              reimbursement, or direct family access.
            </p>
            <Link
              href="/pricing#insurance"
              className="mt-6 inline-flex rounded-full bg-brand px-6 py-3 font-bold text-white hover:bg-brand-dark"
            >
              View coverage options
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="library-page mx-auto max-w-3xl px-4 py-8 md:px-8">
      <Link href={`/library/${course.slug}`} className="text-sm font-bold text-brand hover:underline">
        ← Back to {course.title}
      </Link>

      <article className="library-card mt-6 overflow-hidden bg-white">
        <div className="relative h-52 w-full bg-stone-200 md:h-60">
          <LibraryImage src={lesson.imageUrl} alt={lesson.imageAlt} fill priority sizes="768px" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-5 right-5 text-white">
            <p className="text-xs font-bold uppercase tracking-wide text-white/90">
              Lesson {lessonIndex + 1} · {lesson.durationMinutes} minutes
            </p>
            <h1 className="mt-1 text-2xl font-bold drop-shadow md:text-3xl">{lesson.title}</h1>
            <p className="mt-1 text-sm text-white/90">{course.title}</p>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <LessonPlanSections lesson={lesson} />

          <div className="mt-8 border-t border-stone-200 pt-6">
            <p className="text-xs font-bold uppercase tracking-wide text-stone-500">Ask Nuvio about this article</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                { label: "Ask Nuvio", prompt: `Explain this article in plain language: ${lesson.title}` },
                { label: "Simplify", prompt: `Simplify this article for busy parents: ${lesson.title}` },
                { label: "Make exercise", prompt: `Turn this article into a practice exercise: ${lesson.title}` },
                { label: "Make routine", prompt: `Turn this article into a daily routine: ${lesson.title}` },
                { label: "Social story", prompt: `Turn this article into a social story outline: ${lesson.title}` },
                { label: "Age-appropriate", prompt: `Make this article age-appropriate for my child: ${lesson.title}` },
                { label: "7-day plan", prompt: `Create a 7-day plan from this topic: ${lesson.title}` },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={`/tess/chat?prompt=${encodeURIComponent(item.prompt)}`}
                  className="rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-bold text-violet-800 hover:bg-violet-100"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3 border-t border-stone-200 pt-6">
            <button
              type="button"
              onClick={() => markComplete(lessonKey)}
              disabled={done}
              className="rounded-full bg-brand px-6 py-3 text-sm font-bold text-white hover:bg-brand-dark disabled:cursor-default disabled:opacity-60"
            >
              {done ? "Marked complete ✓" : "Mark lesson complete"}
            </button>
            <button
              type="button"
              className="rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-bold text-stone-900 hover:bg-stone-50"
              onClick={() => window.print()}
            >
              Print lesson plan
            </button>
          </div>
        </div>
      </article>

      <nav className="mt-6 grid gap-4 sm:grid-cols-2">
        {prev ? (
          <Link
            href={`/library/${course.slug}/lessons/${prev.slug}`}
            className="library-card flex overflow-hidden bg-white transition hover:shadow-md"
          >
            <div className="relative h-20 w-28 shrink-0 bg-stone-200">
              <LibraryImage src={prev.imageUrl} alt={prev.imageAlt} fill sizes="112px" />
            </div>
            <div className="flex min-w-0 flex-col justify-center p-3">
              <p className="text-xs font-bold text-stone-500">Previous</p>
              <p className="truncate text-sm font-bold text-brand">{prev.title}</p>
            </div>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/library/${course.slug}/lessons/${next.slug}`}
            className="library-card flex overflow-hidden bg-white transition hover:shadow-md sm:col-start-2"
          >
            <div className="relative order-2 h-20 w-28 shrink-0 bg-stone-200">
              <LibraryImage src={next.imageUrl} alt={next.imageAlt} fill sizes="112px" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center p-3 text-right">
              <p className="text-xs font-bold text-stone-500">Next</p>
              <p className="truncate text-sm font-bold text-brand">{next.title}</p>
            </div>
          </Link>
        ) : null}
      </nav>
    </main>
  );
}
