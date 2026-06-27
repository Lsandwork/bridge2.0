"use client";

import { useLanguage } from "@/components/LanguageProvider";
import type { TessState } from "./tessAnimationState";
import { getTessStatusCopy } from "./tessAnimationState";
import { TessAnimatedCharacter } from "./TessAnimatedCharacter";
import { mapTessStateToCharacter } from "./tessCharacterState";

type Props = {
  state: TessState;
  userName?: string;
  onCompanionTap?: () => void;
  hasError?: boolean;
  isDancing?: boolean;
  audioLevel?: number;
};

export function TessStatusCard({
  state,
  userName = "friend",
  onCompanionTap,
  hasError,
  isDancing = false,
  audioLevel = 0,
}: Props) {
  const { t } = useLanguage();
  const copy = getTessStatusCopy(state, userName, t);
  const characterState = mapTessStateToCharacter(state, hasError, { isDancing });

  return (
    <div className="tess-status-card" aria-live="polite" aria-atomic="true">
      <div className="tess-status-card__copy" key={state}>
        <p className="tess-status-card__line1">{copy.line1}</p>
        <p className="tess-status-card__line2">{copy.line2}</p>
      </div>
      <button
        type="button"
        className="tess-status-card__companion-btn"
        onClick={onCompanionTap}
        aria-label="Nuvio support companion"
      >
        <TessAnimatedCharacter
          state={characterState}
          size="md"
          showWaves
          enableIdleWave={state === "idle" && !isDancing}
          audioLevel={audioLevel}
          onInteract={onCompanionTap}
        />
      </button>
    </div>
  );
}
