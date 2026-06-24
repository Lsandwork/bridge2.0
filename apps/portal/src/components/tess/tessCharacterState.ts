import type { TessState } from "./tessAnimationState";
import type { TessVoiceStatus } from "@/lib/tess/voice-client";

/** State-aware avatar expressions for adaptive companion behavior. */
export type TessCharacterState =
  | "idle"
  | "greeting"
  | "listening"
  | "userSpeaking"
  | "thinking"
  | "tessSpeaking"
  | "happy"
  | "celebrating"
  | "confused"
  | "error"
  | "sleeping"
  | "waving"
  | "winking"
  | "dancing";

export type TessCharacterIntensity = "calm" | "normal" | "expressive";

export type TessCharacterSize = "sm" | "md" | "lg" | "xl" | "fullscreen";

export const CHARACTER_STATUS: Record<TessCharacterState, string> = {
  idle: "Ready when you are",
  greeting: "Hi there!",
  listening: "I'm listening…",
  userSpeaking: "I hear you…",
  thinking: "Thinking…",
  tessSpeaking: "Tess is speaking…",
  happy: "I'm here with you",
  celebrating: "Nice work!",
  confused: "Hmm, let me think…",
  error: "Let's try that again.",
  sleeping: "Resting quietly…",
  waving: "Hi there!",
  winking: "Hi friend!",
  dancing: "Let's dance together!",
};

/** Map rich Tess session state → character animation state. */
export function mapTessStateToCharacter(
  state: TessState,
  hasError = false,
  options?: { isUserSpeaking?: boolean; isDancing?: boolean }
): TessCharacterState {
  if (hasError) return "error";
  if (options?.isDancing) return "dancing";
  if (options?.isUserSpeaking && (state === "listening" || state === "typing")) return "userSpeaking";
  switch (state) {
    case "waving":
      return "waving";
    case "listening":
    case "typing":
      return "listening";
    case "thinking":
      return "thinking";
    case "speaking":
      return "tessSpeaking";
    case "comforting":
      return "happy";
    case "celebrating":
      return "celebrating";
    default:
      return "idle";
  }
}

/** Map TessVoiceMode status → character animation state. */
export function mapVoiceStatusToCharacter(
  status: TessVoiceStatus,
  hasError = false,
  options?: { isUserSpeaking?: boolean; isDancing?: boolean }
): TessCharacterState {
  if (hasError) return "error";
  if (options?.isDancing) return "dancing";
  if (options?.isUserSpeaking && status === "recording") return "userSpeaking";
  switch (status) {
    case "recording":
      return "listening";
    case "transcribing":
    case "thinking":
      return "thinking";
    case "speaking":
      return "tessSpeaking";
    default:
      return "idle";
  }
}

/** Legacy avatar state bridge for gradual migration. */
export function mapCharacterToLegacyAvatar(state: TessCharacterState): string {
  switch (state) {
    case "listening":
    case "userSpeaking":
    case "greeting":
      return "listening";
    case "tessSpeaking":
      return "speaking";
    case "thinking":
    case "confused":
      return "thinking";
    case "error":
      return "error";
    default:
      return "idle";
  }
}
