import { getLibraryCourses } from "@family-support/data";
import { LibraryIndexClient } from "@/components/library/LibraryIndexClient";

export default function LibraryPage() {
  const courses = getLibraryCourses();
  return <LibraryIndexClient courses={courses} />;
}
