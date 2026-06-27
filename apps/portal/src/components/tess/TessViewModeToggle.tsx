"use client";

import { useLanguage } from "@/components/LanguageProvider";
import type { TessViewMode } from "./tessTypes";

type Props = {
  mode: TessViewMode;
  onChange: (mode: TessViewMode) => void;
  compact?: boolean;
};

export function TessViewModeToggle({ mode, onChange, compact }: Props) {
  const { t } = useLanguage();

  return (
    <div
      className={`tess-view-toggle ${compact ? "tess-view-toggle--compact" : ""}`}
      role="group"
      aria-label="Nuvio viewing mode"
    >
      <button
        type="button"
        className={`tess-view-toggle__btn ${mode === "fullscreen" ? "tess-view-toggle__btn--active" : ""}`}
        aria-pressed={mode === "fullscreen"}
        aria-label={t("tess.companion.fullscreenMode")}
        onClick={() => onChange("fullscreen")}
      >
        {t("tess.companion.modeTess")}
      </button>
      <button
        type="button"
        className={`tess-view-toggle__btn ${mode === "chat" ? "tess-view-toggle__btn--active" : ""}`}
        aria-pressed={mode === "chat"}
        aria-label={t("tess.companion.chatMode")}
        onClick={() => onChange("chat")}
      >
        {t("tess.companion.modeChat")}
      </button>
    </div>
  );
}
