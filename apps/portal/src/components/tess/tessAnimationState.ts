export type TessState =
  | "idle"
  | "waving"
  | "listening"
  | "typing"
  | "thinking"
  | "speaking"
  | "comforting"
  | "celebrating";

export const COMFORTING_QUICK_IDS = new Set([
  "help",
  "break",
  "space",
  "overwhelmed",
  "sad",
  "mad",
  "scared",
  "pain",
  "stop",
  "quiet",
]);

export const CELEBRATING_QUICK_IDS = new Set(["yes", "routine", "schedule"]);

export function quickActionTessState(actionId: string): TessState | null {
  if (COMFORTING_QUICK_IDS.has(actionId)) return "comforting";
  if (CELEBRATING_QUICK_IDS.has(actionId)) return "celebrating";
  return null;
}

export function resolveTessState(params: {
  override: TessState | null;
  isWaving: boolean;
  isRecording: boolean;
  isThinking: boolean;
  isSpeaking: boolean;
  hasInput: boolean;
  isTalkMode: boolean;
}): TessState {
  if (params.override) return params.override;
  if (params.isRecording) return "listening";
  if (params.isSpeaking) return "speaking";
  if (params.isThinking) return "thinking";
  if (params.hasInput) return "typing";
  if (params.isWaving) return "waving";
  if (params.isTalkMode) return "listening";
  return "idle";
}

export type TessStatusCopy = {
  line1: string;
  line2: string;
};

export function getTessStatusCopy(
  state: TessState,
  userName: string,
  t: (key: string, params?: Record<string, string>) => string
): TessStatusCopy {
  const name = userName || "friend";
  switch (state) {
    case "waving":
      return {
        line1: t("tess.companion.waving.line1"),
        line2: t("tess.companion.waving.line2"),
      };
    case "typing":
      return {
        line1: t("tess.companion.typing.line1"),
        line2: t("tess.companion.typing.line2"),
      };
    case "listening":
      return {
        line1: t("tess.companion.listening.line1"),
        line2: t("tess.companion.listening.line2Talk"),
      };
    case "thinking":
      return {
        line1: t("tess.companion.thinking.line1"),
        line2: t("tess.companion.thinking.line2"),
      };
    case "speaking":
      return {
        line1: t("tess.companion.speaking.line1"),
        line2: t("tess.companion.speaking.line2Alt"),
      };
    case "comforting":
      return {
        line1: t("tess.companion.comforting.line1", { name }),
        line2: t("tess.companion.comforting.line2Alt"),
      };
    case "celebrating":
      return {
        line1: t("tess.companion.celebrating.line1", { name }),
        line2: t("tess.companion.celebrating.line2Alt"),
      };
    default:
      return {
        line1: t("tess.companion.idle.line1", { name }),
        line2: t("tess.companion.idle.line2"),
      };
  }
}

/** Visual duration when TTS is off but we still show speaking motion */
export function speakingVisualDurationMs(text: string): number {
  return Math.min(6000, Math.max(1800, text.length * 45));
}

export const QUICK_ACTION_EMOJI: Record<string, string> = {
  help: "🛟",
  break: "🌿",
  space: "🌍",
  overwhelmed: "🌧️",
  sad: "😢",
  mad: "😠",
  scared: "👻",
  pain: "💗",
  stop: "🛑",
  yes: "✅",
  no: "❌",
  quiet: "🔇",
  movement: "🏃",
  schedule: "📅",
  routine: "☀️",
  "tell-parent": "👨‍👩‍👧",
  emergency: "🚨",
};
