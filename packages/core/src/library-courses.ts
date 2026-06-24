import { parentLibraryCategories } from "./parent-library-categories";
import { getCourseCoverImage, getLessonImage } from "./library-images";

export const LIBRARY_LEGAL_NOTICE =
  "Family Support provides parent education, skill-building guides, and documentation tools. It does not diagnose, treat, or replace licensed medical, behavioral health, speech, occupational, or educational services. Coverage and authorization decisions are made solely by payers, regional centers, schools, and state agencies — never by this platform.";

export const LIBRARY_SERVICE_DESCRIPTION =
  "Structured parent/caregiver training and home-program lesson plans designed for families supporting autistic children, teens, and adults. Content aligns with common prior-authorization documentation formats used by Medi-Cal managed care plans, California regional centers, Medicaid HCBS waivers, and private insurers.";

export type LibraryFilter =
  | "All"
  | "Foundations"
  | "Communication"
  | "Daily Living"
  | "Regulation"
  | "Coaching Plans"
  | "Safety";

export type AccessTier = "included" | "insurance_packet" | "coaching_intensive";

export type DocumentationHint = {
  label: string;
  detail: string;
  /** Common billing / service codes payers may recognize — verify with your provider */
  referenceCodes?: string[];
};

export type { CoverageOption } from "./pricing";
export { coverageOptions } from "./pricing";

export type LibraryLesson = {
  slug: string;
  title: string;
  durationMinutes: number;
  summary: string;
  isFreePreview: boolean;
  imageUrl: string;
  imageAlt: string;
  purpose: string;
  ageLevel: string;
  materials: string[];
  steps: string[];
  promptGuide: string;
  fadeGuide: string;
  rewardIdea: string;
  parentNotes: string;
  safetyWarning?: string;
  /** For caseworker / therapist review packets */
  progressMetric: string;
  documentationHint: string;
};

export type LibraryCourse = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  filter: Exclude<LibraryFilter, "All">;
  accessTier: AccessTier;
  accent: string;
  coverImageUrl: string;
  coverImageAlt: string;
  lessonCount: number;
  lessons: LibraryLesson[];
  documentation: DocumentationHint;
};

const filterMap: Record<string, Exclude<LibraryFilter, "All">> = {
  "understanding-autism": "Foundations",
  "communication-support": "Communication",
  "daily-living-skills": "Daily Living",
  "emotional-regulation": "Regulation",
  "sensory-support": "Regulation",
  "behavior-support": "Regulation",
  "social-stories": "Communication",
  "parent-coaching-plans": "Coaching Plans",
  "crisis-overload-support": "Safety",
};

const subtitleMap: Record<string, string> = {
  "understanding-autism": "Build a shared language and strength-based foundation at home",
  "communication-support": "AAC, modeling, and daily communication routines that respect autonomy",
  "daily-living-skills": "Step-by-step home programs for hygiene, meals, and independence",
  "emotional-regulation": "Co-regulation tools, calm-down menus, and recovery after hard moments",
  "sensory-support": "Profile your child's sensory needs and adjust the environment",
  "behavior-support": "ABC tracking, replacement skills, and demand reduction",
  "social-stories": "Plain-language stories for doctors, school, transitions, and boundaries",
  "parent-coaching-plans": "Multi-week structured plans with daily parent actions and tracking",
  "crisis-overload-support": "Safety-first overload response — not a substitute for crisis care",
};

const descriptionMap: Record<string, string> = {
  "understanding-autism":
    "Nine modules covering communication differences, sensory processing, executive function, and respectful support across the lifespan. Written for parents who need clear explanations they can share with grandparents, babysitters, and school teams.",
  "communication-support":
    "Hands-on lesson plans for wait-and-watch, two-choice offers, AAC integration, and reducing question overload. Each lesson includes fade prompts so you know when to step back.",
  "daily-living-skills":
    "Morning routines, hygiene, snacks, laundry, and community safety — broken into small steps with visual supports. Designed for progress tracking that caseworkers and therapists can review.",
  "emotional-regulation":
    "Label emotions, read body signals, build a calm-down menu, and practice repair conversations. Includes heavy-work and breathing modules with safety notes.",
  "sensory-support":
    "Complete a sensory profile, plan a sensory diet, and adjust clothing, food, noise, and visual clutter. Track patterns before changing behavior expectations.",
  "behavior-support":
    "Find function, log ABC data, teach replacement skills, and avoid shame-based compliance. Aligns with positive behavior support principles used in IEP and IFSP planning.",
  "social-stories":
    "Ready-to-customize story frameworks for school, work, medical visits, haircuts, and plan changes. Each lesson includes photo placeholders and sentence stems.",
  "parent-coaching-plans":
    "7-, 14-, and 30-day plans with daily parent actions, child activities, tracking prompts, and reward suggestions. Exportable for regional center service coordinators.",
  "crisis-overload-support":
    "Early warning signs, demand reduction, safe break routines, and when to call 911 or a crisis line. Required reading before accessing other safety modules.",
};

const documentationMap: Record<string, DocumentationHint> = {
  "understanding-autism": {
    label: "Psychoeducation / family training",
    detail: "Supports caregiver education goals commonly documented in IFSPs, IEPs, and person-centered plans.",
    referenceCodes: ["H0034 (varies by state)", "S5110 (family training — verify locally)"],
  },
  "communication-support": {
    label: "Communication partner training",
    detail: "Documents parent implementation of AAC and naturalistic communication strategies between SLP sessions.",
    referenceCodes: ["92507 (speech therapy family training — when billed by SLP)", "97156 (ABA family guidance — when part of authorized ABA)"],
  },
  "daily-living-skills": {
    label: "Adaptive daily living home program",
    detail: "Tracks ADL skill acquisition for OT/PT coordination and regional center IPP documentation.",
    referenceCodes: ["97530 (OT — verify treating provider)", "H2014 (skill-building — some waivers)"],
  },
  "emotional-regulation": {
    label: "Self-regulation coaching at home",
    detail: "Co-regulation and coping skill practice between therapy sessions.",
    referenceCodes: ["97153/97155/97156 (when part of authorized behavioral health plan)"],
  },
  "sensory-support": {
    label: "Sensory integration home program",
    detail: "Environmental modifications and sensory diet tracking for OT collaboration.",
    referenceCodes: ["97530 (OT — verify treating provider)"],
  },
  "behavior-support": {
    label: "Positive behavior support home implementation",
    detail: "ABC data collection and replacement skill teaching aligned with BSP/BIP goals.",
    referenceCodes: ["97156 (family adaptive behavior treatment guidance)", "H2019 (behavioral health day — some programs)"],
  },
  "social-stories": {
    label: "Social narrative / transition preparation",
    detail: "Preparation for community and medical settings; supports generalization goals.",
    referenceCodes: ["97156", "92507 (when SLP-authored narrative is part of plan)"],
  },
  "parent-coaching-plans": {
    label: "Structured multi-week caregiver coaching",
    detail: "Daily action logs suitable for regional center quarterly reports and Medi-Cal managed care re-authorizations.",
    referenceCodes: ["S5110", "H0034", "97156"],
  },
  "crisis-overload-support": {
    label: "Safety planning and crisis prevention education",
    detail: "Caregiver safety training — not crisis intervention billing. Document as psychoeducation.",
    referenceCodes: ["H0034", "S5110"],
  },
};

const accessTierMap: Record<string, AccessTier> = {
  "understanding-autism": "included",
  "communication-support": "insurance_packet",
  "daily-living-skills": "insurance_packet",
  "emotional-regulation": "insurance_packet",
  "sensory-support": "insurance_packet",
  "behavior-support": "insurance_packet",
  "social-stories": "included",
  "parent-coaching-plans": "coaching_intensive",
  "crisis-overload-support": "included",
};

const accentMap: Record<string, string> = {
  "understanding-autism": "#4A6670",
  "communication-support": "#2D6A7E",
  "daily-living-skills": "#5C7A6B",
  "emotional-regulation": "#6B5B7A",
  "sensory-support": "#7A6B5C",
  "behavior-support": "#5C6B7A",
  "social-stories": "#2D6A7E",
  "parent-coaching-plans": "#8B6914",
  "crisis-overload-support": "#8B4513",
};

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function buildLesson(title: string, courseSlug: string, index: number): LibraryLesson {
  const isCrisis = courseSlug === "crisis-overload-support";
  const isCoaching = courseSlug === "parent-coaching-plans";
  const duration = isCoaching ? 20 + (index % 3) * 5 : 12 + (index % 4) * 3;
  const slug = slugify(title);
  const image = getLessonImage(courseSlug, slug, title);

  return {
    slug,
    title,
    durationMinutes: duration,
    imageUrl: image.src,
    imageAlt: image.alt,
    summary: isCrisis
      ? `Safety-first guidance for ${title.toLowerCase()} during sensory or emotional overload.`
      : isCoaching
        ? `Day ${index + 1} action plan: ${title.toLowerCase()} with tracking prompts for your caseworker packet.`
        : `Practical home lesson: ${title.toLowerCase()} with step-by-step prompts and fade guidance.`,
    isFreePreview: index === 0,
    purpose: `Help your family implement "${title}" with dignity, predictability, and measurable progress.`,
    ageLevel: "Adjust visuals and prompts to developmental level — works across childhood, teen, and adult profiles.",
    materials: ["Printed or digital visual schedule", "Communication board or AAC device", "Timer", "Preferred reward item"],
    steps: [
      "Tell your child what will happen before you start (30–60 seconds preview).",
      "Use one clear prompt at a time. Wait 5–8 seconds before repeating.",
      "Offer a break card or gesture before frustration builds.",
      "Log completion and note what worked — this feeds your progress report.",
      "Celebrate effort with a short preferred activity, not a lecture.",
    ],
    promptGuide: "Start with full physical or gestural support. Fade only after 3 calm, successful repetitions.",
    fadeGuide: "Move from hand-over-hand → gestural → independent. Never fade during overload.",
    rewardIdea: "Immediate, short, child-chosen activity (2–5 minutes).",
    parentNotes: "Note sleep, hunger, sensory load, and transition timing in your log — patterns matter more than single sessions.",
    progressMetric: isCoaching
      ? "Daily parent action completed (Y/N) + child participation level (0–3 scale)"
      : "Skill steps completed independently / with support (track per session)",
    documentationHint: documentationMap[courseSlug]?.detail ?? "Log sessions for your care team review packet.",
    ...(isCrisis
      ? {
          safetyWarning:
            "If anyone is at immediate risk of harm, call 911 or your local crisis line. This module supports overload response at home — it is not emergency clinical care.",
        }
      : {}),
  };
}

export const libraryFilters: LibraryFilter[] = [
  "All",
  "Foundations",
  "Communication",
  "Daily Living",
  "Regulation",
  "Coaching Plans",
  "Safety",
];

export const libraryCourses: LibraryCourse[] = parentLibraryCategories.map((cat) => {
  const lessons = cat.articles.map((title, i) => buildLesson(title, cat.slug, i));
  const cover = getCourseCoverImage(cat.slug, cat.title);
  return {
    slug: cat.slug,
    title: cat.title,
    subtitle: subtitleMap[cat.slug] ?? `Structured lessons for ${cat.title.toLowerCase()}`,
    description: descriptionMap[cat.slug] ?? `Evidence-informed ${cat.title.toLowerCase()} course for home implementation.`,
    filter: filterMap[cat.slug] ?? "Foundations",
    accessTier: accessTierMap[cat.slug] ?? "insurance_packet",
    accent: accentMap[cat.slug] ?? "#2D6A7E",
    coverImageUrl: cover.src,
    coverImageAlt: cover.alt,
    lessonCount: lessons.length,
    lessons,
    documentation: documentationMap[cat.slug] ?? {
      label: "Caregiver training",
      detail: "Home program documentation for your care team.",
    },
  };
});

export function getLibraryCourse(slug: string) {
  return libraryCourses.find((c) => c.slug === slug) ?? null;
}

export function getLibraryLesson(courseSlug: string, lessonSlug: string) {
  const course = getLibraryCourse(courseSlug);
  if (!course) return null;
  const lesson = course.lessons.find((l) => l.slug === lessonSlug);
  if (!lesson) return null;
  return { course, lesson };
}

export function filterLibraryCourses(filter: LibraryFilter) {
  if (filter === "All") return libraryCourses;
  return libraryCourses.filter((c) => c.filter === filter);
}

export function accessTierLabel(tier: AccessTier) {
  switch (tier) {
    case "included":
      return "Included with free account";
    case "insurance_packet":
      return "Insurance documentation included";
    case "coaching_intensive":
      return "Coaching plan — authorization recommended";
  }
}
