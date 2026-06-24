"use client";

import type { TessCharacterState } from "./tessCharacterState";
import { CHARACTER_STATUS } from "./tessCharacterState";

type Props = {
  state: TessCharacterState;
  text?: string;
  className?: string;
};

/** Calm status label below the state-aware avatar. */
export function TessStatusLabel({ state, text, className = "" }: Props) {
  const label = text ?? CHARACTER_STATUS[state];
  return (
    <p className={`tess-char-status ${className}`.trim()} role="status" aria-live="polite">
      {label}
    </p>
  );
}
