import { getLibraryCourse } from "@family-support/data";
import { CourseCurriculumClient } from "@/components/library/CourseCurriculumClient";
import { notFound } from "next/navigation";

export default async function LibraryCoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = getLibraryCourse(slug);
  if (!course) notFound();
  return <CourseCurriculumClient course={course} />;
}
