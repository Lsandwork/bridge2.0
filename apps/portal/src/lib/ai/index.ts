import { createAnthropicProvider } from "./providers/anthropic";
import { createGeminiProvider } from "./providers/gemini";
import { createOpenAIProvider } from "./providers/openai";
import type { AIProvider } from "./types";

export function getAIProvider(): AIProvider {
  const provider = (process.env.AI_PROVIDER ?? "gemini").toLowerCase();
  switch (provider) {
    case "openai":
      return createOpenAIProvider();
    case "anthropic":
      return createAnthropicProvider();
    case "gemini":
    default:
      return createGeminiProvider();
  }
}

/** Voice STT/TTS — uses OpenAI when available even if chat provider is Gemini */
export function getVoiceProvider(): AIProvider {
  const voiceProvider = (process.env.TESS_VOICE_PROVIDER ?? "").toLowerCase();
  if (voiceProvider === "openai" || (!voiceProvider && process.env.OPENAI_API_KEY)) {
    return createOpenAIProvider();
  }
  if (voiceProvider === "anthropic") return createAnthropicProvider();
  if (voiceProvider === "gemini") return createGeminiProvider();
  return getAIProvider();
}

export type { AIProvider, AIChatMessage, AIChatOptions, AIChatResult } from "./types";
