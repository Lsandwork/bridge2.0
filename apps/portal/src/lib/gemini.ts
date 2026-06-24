import { GoogleGenerativeAI } from "@google/generative-ai";
import { SAFETY_DISCLAIMER } from "@family-support/core";

/** Default Gemini model — gemini-2.0-flash was retired; override with GEMINI_MODEL in .env.local */
export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

export function getGeminiModelName(): string {
  return process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
}

const SYSTEM_PROMPT = `You are Bridge AI, a supportive assistant for families supporting autistic children, teens, and adults.

Rules:
- Provide practical, dignity-centered suggestions for routines, social stories, exercises, rewards, and communication supports.
- Never diagnose, prescribe treatment, or claim medical/clinical authority.
- Always remind parents to review and adapt suggestions to their child's needs.
- Use clear numbered steps when building routines or exercises.
- Keep language plain, warm, and actionable.

Safety disclaimer (include briefly when giving care advice):
${SAFETY_DISCLAIMER}`;

function getClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("Tess AI is temporarily unavailable. Please try again later.");
  }
  return new GoogleGenerativeAI(key);
}

function getModel() {
  return getClient().getGenerativeModel({ model: getGeminiModelName() });
}

export async function geminiChat(
  message: string,
  context?: { childName?: string; ageGroup?: string; supportNotes?: string }
) {
  const model = getModel();

  const contextBlock = context
    ? `\nChild context: ${context.childName ?? "unspecified"}, age group: ${context.ageGroup ?? "unspecified"}. Notes: ${context.supportNotes ?? "none"}.`
    : "";

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: `${SYSTEM_PROMPT}${contextBlock}\n\nParent request:\n${message}` }] }],
  });

  return result.response.text();
}

export async function geminiWeeklySummary(data: {
  childName: string;
  tasksCompleted: number;
  tasksTotal: number;
  routinesCompleted: number;
  routinesTotal: number;
  checkIns: number;
  topEmotions: { label: string; count: number }[];
  recentNotes?: string;
}) {
  const model = getModel();

  const prompt = `${SYSTEM_PROMPT}

Generate a concise weekly progress summary for a parent to review and approve. 2-3 short paragraphs. Highlight patterns, celebrate wins, and suggest 1-2 gentle next steps (e.g., sensory breaks, routine tweaks). Do not use markdown headers.

Data for ${data.childName}:
- Tasks: ${data.tasksCompleted}/${data.tasksTotal} completed
- Routines: ${data.routinesCompleted}/${data.routinesTotal} completed
- Check-ins this week: ${data.checkIns}
- Top emotions: ${data.topEmotions.map((e) => `${e.label} (${e.count})`).join(", ") || "none logged"}
${data.recentNotes ? `- Notes: ${data.recentNotes}` : ""}`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function geminiQuickAction(
  action: "routine" | "social-story" | "exercise" | "reward" | "summary",
  prompt: string,
  context?: { childName?: string; ageGroup?: string }
) {
  const actionLabels: Record<string, string> = {
    routine: "step-by-step daily routine",
    "social-story": "social story with simple sentences and visual cue suggestions",
    exercise: "skill-building exercise with goal, steps, prompts, and reward idea",
    reward: "motivating reward ideas appropriate for point systems",
    summary: "brief progress summary",
  };

  const model = getModel();

  const fullPrompt = `${SYSTEM_PROMPT}

Create a ${actionLabels[action]} based on this parent request.
Child: ${context?.childName ?? "child"}, age group: ${context?.ageGroup ?? "unspecified"}.

Request: ${prompt}

Format with numbered steps where appropriate. End with a one-line reminder that a parent should review before using.`;

  const result = await model.generateContent(fullPrompt);
  return result.response.text();
}
