"use client";

import { Headphones, MessageSquare } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

type InputMode = "text" | "talk";

type Props = {
  mode: InputMode;
  onChange: (mode: InputMode) => void;
};

export function TessModeToggle({ mode, onChange }: Props) {
  const { t } = useLanguage();

  return (
    <div className="tess-mode-toggle" role="group" aria-label="Chat input mode">
      <button
        type="button"
        className={`tess-mode-toggle__btn ${mode === "text" ? "tess-mode-toggle__btn--active" : ""}`}
        aria-pressed={mode === "text"}
        aria-label="Switch to Type mode"
        onClick={() => onChange("text")}
      >
        <MessageSquare className="h-3 w-3" aria-hidden />
        {t("tess.chat.type")}
      </button>
      <button
        type="button"
        className={`tess-mode-toggle__btn ${mode === "talk" ? "tess-mode-toggle__btn--active" : ""}`}
        aria-pressed={mode === "talk"}
        aria-label="Switch to Talk mode"
        onClick={() => onChange("talk")}
      >
        <Headphones className="h-3 w-3" aria-hidden />
        {t("tess.chat.talk")}
      </button>
    </div>
  );
}
