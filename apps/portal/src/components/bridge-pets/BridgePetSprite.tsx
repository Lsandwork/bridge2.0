"use client";

import Image from "next/image";
import type { BridgePetProfile } from "@/features/bridge-pets/petAssetManifest";

type BridgePetSpriteProps = {
  pet: BridgePetProfile;
  size?: "sm" | "md" | "lg" | "xl";
  mood?: "neutral" | "happy" | "focused" | "calm" | "encouraging";
  interactive?: boolean;
  className?: string;
};

const sizeClasses = {
  sm: "h-16 w-16",
  md: "h-28 w-28",
  lg: "h-40 w-40",
  xl: "h-56 w-56",
};

export function BridgePetSprite({
  pet,
  size = "md",
  mood = "neutral",
  interactive = false,
  className = "",
}: BridgePetSpriteProps) {
  const label = `${pet.name} Bridge PETS companion`;

  return (
    <div
      className={`bridge-pet-sprite grid place-items-center ${interactive ? "bridge-pet-sprite-interactive cursor-grab" : ""} ${sizeClasses[size]} ${className}`}
      style={
        {
          "--pet-primary": pet.primaryColor,
          "--pet-accent": pet.accentColor,
          position: "relative",
        } as React.CSSProperties
      }
      aria-label={label}
      role="img"
      data-mood={mood}
    >
      <span className="bridge-pet-glow" aria-hidden />
      {pet.spriteImage ? (
        <Image
          src={pet.spriteImage}
          alt={label}
          fill
          sizes={size === "xl" ? "224px" : size === "lg" ? "160px" : size === "md" ? "112px" : "64px"}
          className="bridge-pet-sprite-image"
          priority={size === "xl"}
        />
      ) : (
        <span className="bridge-pet-fallback" aria-hidden>
          <span className="bridge-pet-fallback-head">
            <span className="bridge-pet-fallback-eye bridge-pet-fallback-eye-left" />
            <span className="bridge-pet-fallback-eye bridge-pet-fallback-eye-right" />
          </span>
          <span className="bridge-pet-fallback-body" />
        </span>
      )}
      <span className="bridge-pet-shadow" aria-hidden />
    </div>
  );
}
