"use client";

import { useMemo } from "react";
import {
  CHARACTER_STATUS,
  type TessCharacterIntensity,
  type TessCharacterState,
} from "@/components/tess/tessCharacterState";

export type TessCharacterStateInput = {
  error?: string | null;
  isListening?: boolean;
  isRecording?: boolean;
  isUserSpeaking?: boolean;
  isThinking?: boolean;
  isTessSpeaking?: boolean;
  isTyping?: boolean;
  isWaving?: boolean;
  isGreeting?: boolean;
  isHappy?: boolean;
  isCelebrating?: boolean;
  isConfused?: boolean;
  isSleeping?: boolean;
  isDancing?: boolean;
  isWinking?: boolean;
};

type Result = {
  characterState: TessCharacterState;
  statusText: string;
  intensity: TessCharacterIntensity;
};

/** State-aware animation — maps session flags to TessCharacterState. */
export function useTessCharacterState(input: TessCharacterStateInput): Result {
  const {
    error,
    isListening,
    isRecording,
    isUserSpeaking,
    isThinking,
    isTessSpeaking,
    isTyping,
    isWaving,
    isGreeting,
    isHappy,
    isCelebrating,
    isConfused,
    isSleeping,
    isDancing,
    isWinking,
  } = input;

  return useMemo(() => {
    let characterState: TessCharacterState = "idle";
    let intensity: TessCharacterIntensity = "normal";

    if (error) {
      characterState = "error";
      intensity = "calm";
    } else if (isDancing) {
      characterState = "dancing";
      intensity = "expressive";
    } else if (isSleeping) {
      characterState = "sleeping";
      intensity = "calm";
    } else if (isCelebrating) {
      characterState = "celebrating";
      intensity = "expressive";
    } else if (isHappy) {
      characterState = "happy";
      intensity = "expressive";
    } else if (isTessSpeaking) {
      characterState = "tessSpeaking";
      intensity = "normal";
    } else if (isThinking || isConfused) {
      characterState = isConfused ? "confused" : "thinking";
      intensity = "calm";
    } else if (isUserSpeaking) {
      characterState = "userSpeaking";
      intensity = "normal";
    } else if (isRecording || isListening || isTyping) {
      characterState = "listening";
      intensity = "normal";
    } else if (isWinking) {
      characterState = "winking";
      intensity = "expressive";
    } else if (isWaving) {
      characterState = "waving";
      intensity = "expressive";
    } else if (isGreeting) {
      characterState = "greeting";
      intensity = "expressive";
    }

    return {
      characterState,
      statusText: CHARACTER_STATUS[characterState],
      intensity,
    };
  }, [
    error,
    isListening,
    isRecording,
    isUserSpeaking,
    isThinking,
    isTessSpeaking,
    isTyping,
    isWaving,
    isGreeting,
    isHappy,
    isCelebrating,
    isConfused,
    isSleeping,
    isDancing,
    isWinking,
  ]);
}
