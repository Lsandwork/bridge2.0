import type { RecommendationItem } from "@/lib/tess/recommendations-types";

export type TessViewMode = "fullscreen" | "chat";
export type TessInputMode = "text" | "talk";

export const DEFAULT_TESS_VOICE_ENABLED = true;
export const DEFAULT_TESS_VIEW_MODE: TessViewMode = "fullscreen";

export const TESS_VOICE_STORAGE_KEY = "bridge-tess-voice-enabled";
export const TESS_VIEW_MODE_STORAGE_KEY = "bridge-tess-view-mode";

export type TessMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  recommendations?: RecommendationItem[];
  recommendationMeta?: {
    sourcesUsed?: string[];
    isFallback?: boolean;
  };
};
