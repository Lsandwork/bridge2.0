"use client";

import { useLanguage } from "@/components/LanguageProvider";

type Props = {
  calmActive: boolean;
  contrastActive: boolean;
  onCalmChange: (active: boolean) => void;
  onContrastChange: (active: boolean) => void;
  showSwitchProfile?: boolean;
  onSwitchProfile?: () => void;
};

export function AccessibilityToggles({
  calmActive,
  contrastActive,
  onCalmChange,
  onContrastChange,
  showSwitchProfile,
  onSwitchProfile,
}: Props) {
  const { t } = useLanguage();

  return (
    <div className="bridge-access-toggles" role="group" aria-label="Accessibility options">
      <button
        type="button"
        className={`bridge-toggle-chip ${calmActive ? "bridge-toggle-chip--active" : ""}`}
        aria-pressed={calmActive}
        aria-label={t("myspace.calm")}
        onClick={() => onCalmChange(!calmActive)}
      >
        <span className="bridge-toggle-chip__icon" aria-hidden>
          🌿
        </span>
        {t("myspace.calm")}
        {calmActive ? (
          <span className="bridge-toggle-chip__check" aria-hidden>
            ✓
          </span>
        ) : null}
      </button>

      <button
        type="button"
        className={`bridge-toggle-chip ${contrastActive ? "bridge-toggle-chip--active" : ""}`}
        aria-pressed={contrastActive}
        aria-label={t("myspace.contrast")}
        onClick={() => onContrastChange(!contrastActive)}
      >
        <span className="bridge-toggle-chip__icon" aria-hidden>
          ◐
        </span>
        {t("myspace.contrast")}
        {contrastActive ? (
          <span className="bridge-toggle-chip__check" aria-hidden>
            ✓
          </span>
        ) : null}
      </button>

      {showSwitchProfile && onSwitchProfile ? (
        <button
          type="button"
          className="bridge-toggle-chip min-h-[2.75rem] text-[var(--bd-muted)]"
          onClick={onSwitchProfile}
        >
          {t("myspace.switch")}
        </button>
      ) : null}
    </div>
  );
}
