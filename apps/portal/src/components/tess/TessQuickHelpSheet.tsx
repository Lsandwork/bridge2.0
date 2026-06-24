"use client";

import { X } from "lucide-react";
import { type TessQuickAction } from "@family-support/core";
import { useLanguage } from "@/components/LanguageProvider";
import { QUICK_ACTION_EMOJI } from "./tessAnimationState";

type Props = {
  open: boolean;
  actions: TessQuickAction[];
  activeId?: string | null;
  disabled?: boolean;
  onClose: () => void;
  onAction: (action: TessQuickAction) => void;
};

export function TessQuickHelpSheet({ open, actions, activeId, disabled, onClose, onAction }: Props) {
  const { t } = useLanguage();

  if (!open) return null;

  return (
    <div className="tess-quick-sheet" role="dialog" aria-modal="true" aria-labelledby="tess-quick-sheet-title">
      <button type="button" className="tess-quick-sheet__backdrop" aria-label={t("tess.companion.closeQuickHelp")} onClick={onClose} />
      <div className="tess-quick-sheet__panel">
        <div className="tess-quick-sheet__head">
          <h2 id="tess-quick-sheet-title" className="tess-quick-sheet__title">
            {t("tess.companion.quickTitle")}
          </h2>
          <button type="button" className="tess-quick-sheet__close" onClick={onClose} aria-label={t("tess.companion.closeQuickHelp")}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="tess-quick-sheet__grid">
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              className={`tess-quick-sheet__btn ${activeId === action.id ? "tess-quick-sheet__btn--active" : ""}`}
              disabled={disabled}
              onClick={() => onAction(action)}
              aria-label={action.label}
            >
              <span aria-hidden>{QUICK_ACTION_EMOJI[action.id] ?? "💬"}</span>
              {action.label}
            </button>
          ))}
        </div>
        <p className="tess-quick-sheet__footer">{t("tess.companion.quickFooter")}</p>
      </div>
    </div>
  );
}
