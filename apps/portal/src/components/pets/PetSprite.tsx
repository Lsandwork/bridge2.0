"use client";

import type { CSSProperties } from "react";
import { petById } from "@/lib/pets/petConfig";
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
  const pet = petById(species);
  const cls = motionLevel === "off" ? "" : petAnimationClasses[(mood as keyof typeof petAnimationClasses) ?? "idle"] ?? petAnimationClasses.idle;
  return (
    <div
      className={`pet-sprite pet-sprite--${size} ${cls}`}
      style={{ "--pet-primary": pet.colors[0], "--pet-secondary": pet.colors[1] } as CSSProperties}
      aria-hidden
    >
      <svg viewBox="0 0 140 140" role="img" aria-label={pet.name}>
        <defs>
          <linearGradient id={`pet-grad-${pet.id}`} x1="20" y1="10" x2="120" y2="130">
            <stop stopColor={pet.colors[1]} />
            <stop offset="1" stopColor={pet.colors[0]} />
          </linearGradient>
        </defs>
        <ellipse cx="70" cy="126" rx="34" ry="8" fill="rgba(15,23,42,.16)" />
        <path className="pet-tail" d="M108 82c18-5 21 15 7 20" fill="none" stroke={pet.colors[0]} strokeWidth="10" strokeLinecap="round" />
        <circle cx="70" cy="70" r="43" fill={`url(#pet-grad-${pet.id})`} />
        <circle cx="52" cy="62" r="6" fill="#111827" />
        <circle cx="88" cy="62" r="6" fill="#111827" />
        <circle className="pet-blink" cx="52" cy="62" r="7" fill={pet.colors[1]} />
        <circle className="pet-blink" cx="88" cy="62" r="7" fill={pet.colors[1]} />
        <path d={mood === "calm" ? "M55 82c8 6 22 6 30 0" : "M53 81c9 12 25 12 34 0"} fill="none" stroke="#111827" strokeWidth="5" strokeLinecap="round" />
        <circle cx="40" cy="76" r="7" fill="rgba(255,255,255,.35)" />
        <circle cx="100" cy="76" r="7" fill="rgba(255,255,255,.35)" />
        {species?.includes("cat") || species?.includes("fox") ? (
          <>
            <path d="M39 33l10-22 11 22" fill={pet.colors[0]} />
            <path d="M81 33l11-22 10 22" fill={pet.colors[0]} />
          </>
        ) : null}
        {species?.includes("robot") ? <rect x="45" y="23" width="50" height="15" rx="7" fill="#e2e8f0" /> : null}
        {outfit?.head === "wizard-hat" ? <path d="M51 35l20-35 20 35z" fill="#8b5cf6" /> : null}
        {outfit?.face === "focus-glasses" ? <path d="M44 62h18m16 0h18m-34 0h16" stroke="#111827" strokeWidth="4" strokeLinecap="round" /> : null}
        {outfit?.body === "calm-hoodie" || outfit?.body === "cozy-pajamas" || outfit?.body === "service-hero-vest" ? (
          <path d="M38 98c14 15 50 15 64 0v14c-16 12-48 12-64 0z" fill={outfit.body === "service-hero-vest" ? "#166534" : outfit.body === "calm-hoodie" ? "#38bdf8" : "#c4b5fd"} />
        ) : null}
        {outfit?.neck === "starter-bandana" ? <path d="M49 96h42l-21 20z" fill="#7c3aed" /> : null}
        {outfit?.badge === "star-badge" ? <text x="91" y="101" fontSize="18">⭐</text> : null}
      </svg>
      <span className="pet-sprite__emoji">{pet.emoji}</span>
    </div>
  );
}
