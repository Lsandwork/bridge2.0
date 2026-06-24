/** Paths for library illustrations in apps/portal/public/library/ */

const COURSE_COVER_ALT: Record<string, string> = {
  "understanding-autism":
    "Young child engaged in play-based learning with educational toys in a bright therapy-friendly room",
  "communication-support":
    "Parent guiding a child through communication and learning activities using a laptop at home",
  "daily-living-skills":
    "Child practicing structured daily living skills with visual crafts and step-by-step activities at a table",
  "emotional-regulation":
    "Children practicing calm, shared play with a sensory tool during a co-regulation activity",
  "sensory-support":
    "Child exploring tactile learning tools during a hands-on sensory and motor activity",
  "behavior-support":
    "Caregiver reviewing progress charts and behavior data on a tablet with clipboard notes",
  "social-stories":
    "Educator reading an illustrated story to a small group of children during circle time",
  "parent-coaching-plans":
    "Parent writing in a structured coaching plan and documentation packet at a desk",
  "crisis-overload-support":
    "Softly lit, uncluttered living room designed as a calm recovery space after overload",
};

export function getCourseCoverImage(courseSlug: string, courseTitle?: string): { src: string; alt: string } {
  return {
    src: `/library/${courseSlug}/cover.jpg`,
    alt: COURSE_COVER_ALT[courseSlug] ?? (courseTitle ? `${courseTitle} — parent education course` : "Course cover"),
  };
}

export function getLessonImage(
  courseSlug: string,
  lessonSlug: string,
  lessonTitle: string
): { src: string; alt: string } {
  return {
    src: `/library/${courseSlug}/${lessonSlug}.svg`,
    alt: `${lessonTitle} — lesson illustration`,
  };
}
