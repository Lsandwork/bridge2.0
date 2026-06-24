"use client";

import { type TessQuickAction } from "@family-support/core";
import { useLanguage } from "@/components/LanguageProvider";
import { QUICK_ACTION_EMOJI } from "./tessAnimationState";

type Props = {
  actions: TessQuickAction[];
  activeId?: string | null;
  disabled?: boolean;
  onAction: (action: TessQuickAction) => void;
};

export function TessQuickActions({ actions, activeId, disabled, onAction }: Props) {
  const { t } = useLanguage();

  if (!actions.length) return null;

  return (
    <div className="tess-quick-grid">
      <p className="tess-quick-grid__title">{t("tess.companion.quickTitle")}</p>
      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          className={`tess-quick-btn ${activeId === action.id ? "tess-quick-btn--active" : ""}`}
          disabled={disabled}
          onClick={() => onAction(action)}
          aria-label={action.label}
        >
          <span aria-hidden>{QUICK_ACTION_EMOJI[action.id] ?? "💬"}</span>
          {action.label}
        </button>
      ))}
      <p className="tess-quick-footer">{t("tess.companion.quickFooter")}</p>
    </div>
  );
}
