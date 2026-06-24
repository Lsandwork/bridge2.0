import { z } from "zod";

export const SAFETY_DISCLAIMER =
  "This app provides supportive tools, education, routines, and skill-building exercises. It does not diagnose, treat, or replace doctors, therapists, speech therapy, occupational therapy, ABA, school services, or clinical care.";

export const roleSchema = z.enum([
  "child_user",
  "parent_guardian",
  "caregiver_therapist_teacher",
  "admin",
  "super_admin",
]);

export type AppRole = z.infer<typeof roleSchema>;

export const modeSchema = z.enum([
  "child",
  "teen",
  "adult",
  "low_stimulation",
  "high_contrast",
  "simple",
  "advanced",
]);

export { parentLibraryCategories } from "./parent-library-categories";

export const exerciseTemplateSchema = z.object({
  title: z.string().min(3),
  category: z.enum([
    "communication",
    "life_skill",
    "sensory",
    "emotional_regulation",
    "social_story",
    "school_skill",
    "job_skill",
    "safety_skill",
    "hygiene_skill",
  ]),
  goal: z.string().min(3),
  steps: z.array(z.string().min(1)).min(1),
  promptLevel: z.string().min(1),
  timerMinutes: z.number().int().min(1).max(120),
  visualsEnabled: z.boolean(),
  rewardIdea: z.string().min(1),
  difficulty: z.enum(["easy", "moderate", "advanced"]),
  frequency: z.enum(["daily", "weekly", "custom"]),
  notes: z.string().optional(),
});

export type ExerciseTemplateInput = z.infer<typeof exerciseTemplateSchema>;

export { getCourseCoverImage, getLessonImage } from "./library-images";

export {
  PRICING_LEGAL_NOTICE,
  coverageOptions,
  medicalApprovalTypes,
  payerTypeOptions,
  pricingFaqs,
  pricingPlans,
  payerPlans,
  reimbursementBenchmarks,
  type CoverageOption,
  type MedicalApprovalType,
  type PayerPlan,
  type PayerType,
  type PricingPlan,
  type ReimbursementBenchmark,
} from "./pricing";

export {
  LIBRARY_LEGAL_NOTICE,
  LIBRARY_SERVICE_DESCRIPTION,
  accessTierLabel,
  filterLibraryCourses,
  getLibraryCourse,
  getLibraryLesson,
  libraryCourses,
  libraryFilters,
  type AccessTier,
  type DocumentationHint,
  type LibraryCourse,
  type LibraryFilter,
  type LibraryLesson,
} from "./library-courses";

export {
  spectrumGames,
  gamesForAgeGroup,
  getGame,
  categoryLabels,
  categoryColors,
  type GameCategory,
  type SpectrumGame,
} from "./rewards-games";

export {
  DEFAULT_REWARDS_POLICY,
  earnedMessage,
  evaluateGameEarn,
  getNextRewardProgress,
  practiceMessage,
  type GameEarnOutcome,
  type PracticeReason,
  type RewardsPolicy,
} from "./rewards-policy";

export {
  CHILD_QUICK_BUTTONS,
  PARENT_QUICK_PROMPTS,
  TESS_CRISIS_DISCLAIMER,
  TESS_DISCLAIMER,
  tessConversationModeSchema,
  tessRiskLevelSchema,
  tessRoleScopeSchema,
  tessSuggestionStatusSchema,
  tessSuggestionTypeSchema,
} from "./tess/types";
export type {
  TessConversationMode,
  TessQuickAction,
  TessRiskLevel,
  TessRoleScope,
  TessSuggestionStatus,
  TessSuggestionType,
} from "./tess/types";
export {
  buildSearchQuery,
  extractCategory,
  extractLocation,
  extractUserNeeds,
  isHealthcareRecommendation,
  isRecommendationRequest,
} from "./tess/recommendations-intent";
export { rankRecommendations, scoreRecommendation, type ScorableRecommendation } from "./tess/recommendation-scoring";
export { buildTessSystemPrompt, TESS_GLOBAL_SYSTEM_PROMPT, TESS_RECOMMENDATIONS_PROMPT, TESS_SAFETY_PROMPT } from "./tess/prompts";
export { checkTessSafety, TESS_CRISIS_RESPONSE, TESS_SAFETY_FALLBACK, type SafetyCheckResult } from "./tess/safety";

export {
  SUPPORTED_LOCALES,
  localeLabels,
  localeSpeechCodes,
  rtlLocales,
  translate,
  translateCategory,
  translatePhrase,
  translateWithParams,
  PHRASE_TO_I18N_KEY,
  isRtl,
  type Locale,
  type TranslateFn,
} from "./i18n";

export {
  getLocalizedCoverageOptions,
  getLocalizedLibraryCourse,
  getLocalizedAccessTierLabel,
  getLocalizedLibraryFilter,
  getLocalizedMedicalApprovalTypes,
  getLocalizedPayerPlans,
  getLocalizedPayerTypeOptions,
  getLocalizedPricingFaqs,
  getLocalizedPricingPlans,
  getLocalizedReimbursementBenchmarks,
} from "./site-content-i18n";

export {
  filterVideoCatalog,
  getVideoById,
  getVideoByYoutubeId,
  videoCatalog,
  type VideoCatalogItem,
} from "./video-catalog";

export const defaultCommunicationCategories = [
  "Food",
  "Bathroom",
  "Feelings",
  "Pain",
  "Help",
  "People",
  "Places",
  "Activities",
  "Yes / No",
  "Stop",
  "Break",
  "I need space",
  "I am overwhelmed",
  "I need help",
] as const;
