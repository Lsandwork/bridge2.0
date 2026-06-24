import type { LibraryLesson } from "@family-support/data";
import Link from "next/link";
import { LibraryImage } from "./LibraryImage";

type Props = {
  courseSlug: string;
  courseTitle: string;
  lesson: LibraryLesson;
  index: number;
  unlocked: boolean;
  done: boolean;
};

export function CurriculumRow({ courseSlug, courseTitle, lesson, index, unlocked, done }: Props) {
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 gap-4">
        <div className="relative hidden h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-stone-200 sm:block">
          <LibraryImage src={lesson.imageUrl} alt={lesson.imageAlt} fill sizes="96px" />
        </div>
        <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wide text-stone-500">
          Lesson {index + 1}
          {lesson.isFreePreview ? " · Free preview" : ""}
        </p>
        <p className="font-bold text-stone-900">{lesson.title}</p>
        <p className="text-sm text-stone-600">
          {lesson.durationMinutes} min · {lesson.summary.slice(0, 80)}
          {lesson.summary.length > 80 ? "…" : ""}
        </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        {unlocked ? (
          <Link
            href={`/library/${courseSlug}/lessons/${lesson.slug}`}
            className="rounded-full bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark"
          >
            {done ? "Review lesson" : "Open lesson"}
          </Link>
        ) : (
          <Link
            href="/pricing#insurance"
            className="rounded-full border border-brand/30 bg-brand/5 px-4 py-2 text-sm font-bold text-brand"
          >
            Unlock via coverage
          </Link>
        )}
      </div>
    </div>
  );
}

export function LessonPlanSections({ lesson }: { lesson: LibraryLesson }) {
  return (
    <div className="space-y-6 text-stone-900">
      <section>
        <h3 className="text-sm font-bold uppercase tracking-wide text-stone-500">What this lesson covers</h3>
        <p className="mt-2 leading-relaxed text-stone-800">{lesson.summary}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-stone-50 p-4 ring-1 ring-stone-200">
          <h4 className="text-sm font-bold text-stone-900">Purpose</h4>
          <p className="mt-1 text-sm leading-relaxed text-stone-700">{lesson.purpose}</p>
        </div>
        <div className="rounded-2xl bg-stone-50 p-4 ring-1 ring-stone-200">
          <h4 className="text-sm font-bold text-stone-900">Age / level</h4>
          <p className="mt-1 text-sm leading-relaxed text-stone-700">{lesson.ageLevel}</p>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-bold uppercase tracking-wide text-stone-500">Materials</h3>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-stone-800">
          {lesson.materials.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-sm font-bold uppercase tracking-wide text-stone-500">Step-by-step lesson plan</h3>
        <ol className="mt-3 space-y-3">
          {lesson.steps.map((step, i) => (
            <li key={step} className="flex gap-3 text-sm leading-relaxed">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                {i + 1}
              </span>
              <span className="pt-0.5 text-stone-800">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <h4 className="text-sm font-bold text-stone-900">How to prompt</h4>
          <p className="mt-1 text-sm leading-relaxed text-stone-700">{lesson.promptGuide}</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <h4 className="text-sm font-bold text-stone-900">How to fade support</h4>
          <p className="mt-1 text-sm leading-relaxed text-stone-700">{lesson.fadeGuide}</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <h4 className="text-sm font-bold text-stone-900">Reward idea</h4>
          <p className="mt-1 text-sm leading-relaxed text-stone-700">{lesson.rewardIdea}</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <h4 className="text-sm font-bold text-stone-900">Parent notes</h4>
          <p className="mt-1 text-sm leading-relaxed text-stone-700">{lesson.parentNotes}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-brand/20 bg-brand/5 p-5">
        <h3 className="text-sm font-bold uppercase tracking-wide text-brand">For your caseworker packet</h3>
        <p className="mt-2 text-sm leading-relaxed text-stone-900">
          <strong>Progress metric:</strong> {lesson.progressMetric}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-stone-700">{lesson.documentationHint}</p>
      </section>

      {lesson.safetyWarning ? (
        <section className="rounded-2xl border border-amber-300 bg-amber-50 p-5" role="alert">
          <h3 className="font-bold text-amber-950">Safety note</h3>
          <p className="mt-2 text-sm leading-relaxed text-amber-900">{lesson.safetyWarning}</p>
        </section>
      ) : null}
    </div>
  );
}
