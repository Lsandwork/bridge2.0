"use client";

import { TessAnimatedCharacter } from "./TessAnimatedCharacter";
import type { TessAvatarState } from "./tessAvatarState";
import { mapAvatarToCharacter } from "./tessAvatarState";
import type { TessCharacterSize } from "./tessCharacterState";

export type { TessAvatarState };

export type TessAnimatedAvatarProps = {
  /** Control animation: idle | listening | speaking | thinking | error */
  state?: TessAvatarState;
  size?: "sm" | "md" | "lg" | "fullscreen";
  showWaves?: boolean;
  className?: string;
  onInteract?: () => void;
};

const SIZE_MAP: Record<NonNullable<TessAnimatedAvatarProps["size"]>, TessCharacterSize> = {
  sm: "sm",
  md: "md",
  lg: "lg",
  fullscreen: "fullscreen",
};

/**
 * Back-compat wrapper — delegates to TessAnimatedCharacter (state-aware avatar).
 * Map session flags via mapTessStateToCharacter for richer expressions.
 */
export function TessAnimatedAvatar({
  state = "idle",
  size = "md",
  showWaves = false,
  className = "",
  onInteract,
}: TessAnimatedAvatarProps) {
  return (
    <TessAnimatedCharacter
      state={mapAvatarToCharacter(state)}
      size={SIZE_MAP[size]}
      showWaves={showWaves}
      enableIdleWave={state === "idle"}
      className={className}
      onInteract={onInteract}
    />
  );
}
