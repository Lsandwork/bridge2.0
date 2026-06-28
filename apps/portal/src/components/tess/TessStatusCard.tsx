"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { PetSprite } from "@/components/pets/PetSprite";
import { useCompanionPet } from "@/components/pets/CompanionPetProvider";
import type { TessState } from "./tessAnimationState";
import { getTessStatusCopy } from "./tessAnimationState";
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
  audioLevel: _audioLevel = 0,
}: Props) {
  const { t } = useLanguage();
  const { state: petState } = useCompanionPet();
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
        <PetSprite
          species={petState?.pet?.species ?? "spark"}
          mood={characterState}
          size="md"
          motionLevel={petState?.pet?.settings.motionLevel}
        />
      </button>
    </div>
  );
}
