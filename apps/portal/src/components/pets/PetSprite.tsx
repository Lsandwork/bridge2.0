"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { getNuvioPetProfile } from "@/lib/pets/nuvioPetCatalog";
import { petAnimationClasses } from "@/lib/pets/petAnimations";

export function PetSprite({
  species,
  mood,
  outfit,
  size = "md",
  motionLevel = "low",
}: {
  species?: string;
  mood?: string;
  outfit?: Record<string, string>;
  size?: "sm" | "md" | "lg";
  motionLevel?: string;
}) {
  const pet = getNuvioPetProfile(species);
  const cls = motionLevel === "off" ? "" : petAnimationClasses[(mood as keyof typeof petAnimationClasses) ?? "idle"] ?? petAnimationClasses.idle;
  return (
    <div
      className={`pet-sprite pet-sprite--${size} ${cls}`}
      style={{ "--pet-primary": pet.primaryColor, "--pet-secondary": pet.accentColor } as CSSProperties}
      role="img"
      aria-label={`${pet.name} Nuvio Pet`}
    >
      <span className="pet-sprite__glow" aria-hidden />
      <Image
        src={pet.spriteImage}
        alt=""
        fill
        sizes={size === "lg" ? "128px" : size === "md" ? "96px" : "64px"}
        className="pet-sprite__image"
        priority={size === "lg"}
      />
      {outfit?.badge === "star-badge" ? <span className="pet-sprite__badge" aria-hidden>★</span> : null}
    </div>
  );
}
