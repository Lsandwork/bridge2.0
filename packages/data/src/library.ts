import {
  filterLibraryCourses,
  getLibraryCourse,
  getLibraryLesson,
  libraryCourses,
  type LibraryCourse,
  type LibraryFilter,
  type LibraryLesson,
} from "@family-support/core";

export type { LibraryCourse, LibraryFilter, LibraryLesson };

export function getLibraryCourses() {
  return libraryCourses;
}

export function getLibraryCoursesFiltered(filter: LibraryFilter) {
  return filterLibraryCourses(filter);
}

export { getLibraryCourse, getLibraryLesson };
