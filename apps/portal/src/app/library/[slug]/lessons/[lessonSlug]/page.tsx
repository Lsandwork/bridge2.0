import { getLibraryLesson } from "@family-support/data";
import { LessonDetailClient } from "@/components/library/LessonDetailClient";
import { notFound } from "next/navigation";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonSlug: string }>;
}) {
  const { slug, lessonSlug } = await params;
  const result = getLibraryLesson(slug, lessonSlug);
  if (!result) notFound();

  const lessonIndex = result.course.lessons.findIndex((l) => l.slug === lessonSlug);

  return (
    <LessonDetailClient course={result.course} lesson={result.lesson} lessonIndex={lessonIndex} />
  );
}
