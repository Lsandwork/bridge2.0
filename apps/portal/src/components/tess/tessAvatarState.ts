import type { TessState } from "./tessAnimationState";
import type { TessVoiceStatus } from "@/lib/tess/voice-client";
import {
  mapTessStateToCharacter,
  mapVoiceStatusToCharacter,
  type TessCharacterState,
} from "./tessCharacterState";

/** @deprecated Use TessCharacterState from tessCharacterState.ts */
export type TessAvatarState = "idle" | "listening" | "speaking" | "thinking" | "error";

export type { TessCharacterState };

/** Map rich Tess session state → legacy avatar state. */
export function mapTessStateToAvatar(state: TessState, hasError = false): TessAvatarState {
  const character = mapTessStateToCharacter(state, hasError);
  return mapCharacterToAvatar(character);
}

/** Map TessVoiceMode status → legacy avatar state. */
export function mapVoiceStatusToAvatar(status: TessVoiceStatus, hasError = false): TessAvatarState {
  const character = mapVoiceStatusToCharacter(status, hasError);
  return mapCharacterToAvatar(character);
}

export function mapCharacterToAvatar(state: TessCharacterState): TessAvatarState {
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

export function mapAvatarToCharacter(state: TessAvatarState): TessCharacterState {
  switch (state) {
    case "listening":
      return "listening";
    case "speaking":
      return "tessSpeaking";
    case "thinking":
      return "thinking";
    case "error":
      return "error";
    default:
      return "idle";
  }
}

export function avatarStatusLabel(state: TessAvatarState | TessCharacterState): string {
  switch (state) {
    case "listening":
    case "userSpeaking":
      return "I'm listening…";
    case "thinking":
    case "confused":
      return "Thinking…";
    case "speaking":
    case "tessSpeaking":
      return "Nuvio is speaking…";
    case "error":
      return "Let's try that again.";
    case "greeting":
      return "Hi there!";
    case "happy":
      return "I'm here with you";
    case "celebrating":
      return "Nice work!";
    case "sleeping":
      return "Resting quietly…";
    default:
      return "Ready when you are";
  }
}
