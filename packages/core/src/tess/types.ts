import { z } from "zod";

export const TESS_DISCLAIMER =
  "Nuvio is an AI educational support companion. Nuvio does not diagnose, treat, cure, or replace doctors, therapists, speech therapy, occupational therapy, ABA, school services, clinical care, or emergency services. Nuvio provides supportive tools, education, routines, communication help, and skill-building guidance. Parents and caregivers should review AI suggestions before use.";

export const TESS_CRISIS_DISCLAIMER =
  "Nuvio is not an emergency service. If there is immediate danger, call emergency services or contact a trusted adult right now.";

export const tessConversationModeSchema = z.enum([
  "text",
  "voice",
  "calm",
  "communication_builder",
  "routine_helper",
  "skill_practice",
  "parent_assistant",
]);

export const tessSuggestionTypeSchema = z.enum([
  "routine",
  "task",
  "communication_card",
  "social_story",
  "exercise",
  "reward",
  "goal",
  "parent_summary",
  "report_note",
  "sensory_plan",
  "calm_plan",
]);

export const tessSuggestionStatusSchema = z.enum([
  "pending",
  "approved",
  "edited",
  "rejected",
  "archived",
]);

export const tessRiskLevelSchema = z.enum(["low", "medium", "high", "urgent"]);

export const tessRoleScopeSchema = z.enum([
  "child",
  "teen",
  "adult",
  "parent",
  "caregiver",
  "therapist",
  "admin",
  "global",
]);

export type TessConversationMode = z.infer<typeof tessConversationModeSchema>;
export type TessSuggestionType = z.infer<typeof tessSuggestionTypeSchema>;
export type TessSuggestionStatus = z.infer<typeof tessSuggestionStatusSchema>;
export type TessRiskLevel = z.infer<typeof tessRiskLevelSchema>;
export type TessRoleScope = z.infer<typeof tessRoleScopeSchema>;

export type TessQuickAction = {
  id: string;
  label: string;
  prompt: string;
  category?: string;
};

export const CHILD_QUICK_BUTTONS: TessQuickAction[] = [
  { id: "help", label: "I need help", prompt: "I need help" },
  { id: "break", label: "I need a break", prompt: "I need a break" },
  { id: "space", label: "I need space", prompt: "I need space" },
  { id: "overwhelmed", label: "I am overwhelmed", prompt: "I am overwhelmed" },
  { id: "sad", label: "I feel sad", prompt: "I feel sad" },
  { id: "mad", label: "I feel mad", prompt: "I feel mad" },
  { id: "scared", label: "I feel scared", prompt: "I feel scared" },
  { id: "pain", label: "I am in pain", prompt: "I am in pain" },
  { id: "stop", label: "Stop", prompt: "Stop" },
  { id: "yes", label: "Yes", prompt: "Yes" },
  { id: "no", label: "No", prompt: "No" },
  { id: "quiet", label: "I want quiet", prompt: "I want quiet" },
  { id: "movement", label: "I want movement", prompt: "I want movement" },
  { id: "schedule", label: "Show my schedule", prompt: "What is on my schedule today?" },
  { id: "routine", label: "Start my routine", prompt: "Help me start my routine" },
  { id: "tell-parent", label: "Tell my parent", prompt: "I want to send a message to my parent" },
  { id: "emergency", label: "Emergency card", prompt: "I need emergency help" },
];

export const PARENT_QUICK_PROMPTS: TessQuickAction[] = [
  { id: "bedtime", label: "Build bedtime routine", prompt: "Help me build a bedtime routine for my child with anxiety" },
  { id: "dentist-story", label: "Dentist social story", prompt: "Create a social story for a dentist visit" },
  { id: "brushing", label: "Brushing teeth exercise", prompt: "Make a brushing teeth exercise with visual supports" },
  { id: "sensory-log", label: "Understand sensory log", prompt: "Help me understand recent sensory log patterns without diagnosing" },
  { id: "transition-cards", label: "Transition communication cards", prompt: "Suggest communication cards for transitions" },
  { id: "easier", label: "Make exercise easier", prompt: "Make the assigned exercise easier with smaller steps" },
  { id: "teen-appropriate", label: "Teen/adult appropriate", prompt: "Make this content teen/adult appropriate and respectful" },
  { id: "weekly", label: "Summarize this week", prompt: "Summarize this week's progress based on logged data" },
  { id: "therapist-questions", label: "Questions for therapist", prompt: "What should I ask the therapist at our next meeting?" },
];
