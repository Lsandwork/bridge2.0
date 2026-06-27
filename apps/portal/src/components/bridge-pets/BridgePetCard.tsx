"use client";

import Image from "next/image";
import Link from "next/link";
import type { BridgePetProfile } from "@/features/bridge-pets/petAssetManifest";
import { BridgePetSprite } from "./BridgePetSprite";

type BridgePetCardProps = {
  pet: BridgePetProfile;
  selectedSlug?: string | null;
  onSelect: (slug: string) => void;
  selecting?: boolean;
};

export function BridgePetCard({ pet, selectedSlug, onSelect, selecting }: BridgePetCardProps) {
  const selected = selectedSlug === pet.slug;
  const visibleTags = [...new Set([...pet.audienceTags, ...pet.supportTags])].slice(0, 3);

  return (
    <article
      className={`bridge-pets-card relative overflow-hidden rounded-3xl border bg-slate-950/90 p-4 shadow-2xl shadow-black/25 ${
        selected ? "bridge-pets-card-selected border-yellow-300" : "border-white/10"
      }`}
      style={
        {
          "--pet-primary": pet.primaryColor,
          "--pet-accent": pet.accentColor,
        } as React.CSSProperties
      }
    >
      <div className="bridge-pets-card-top flex items-start justify-between gap-3">
        <div>
          <p className="bridge-pets-kicker text-[10px] font-black uppercase tracking-[0.18em] text-violet-300">Bridge PETS</p>
          <h2 className="mt-1 text-2xl font-black" style={{ color: pet.primaryColor }}>{pet.name}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-300">{pet.descriptor}</p>
        </div>
        <BridgePetSprite pet={pet} size="md" interactive mood={selected ? "happy" : "neutral"} />
      </div>

      {pet.cardImage ? (
        <div className="bridge-pets-card-art relative mt-4 h-60 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
          <Image src={pet.cardImage} alt={`${pet.name} character card`} fill sizes="(max-width: 768px) 100vw, 360px" className="object-cover" />
        </div>
      ) : pet.boardImage ? (
        <div className="bridge-pets-card-board relative mt-4 h-60 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
          <Image src={pet.boardImage} alt={`${pet.name} asset board preview`} fill sizes="(max-width: 768px) 100vw, 360px" className="object-cover object-left-top" />
        </div>
      ) : null}

      <div className="bridge-pets-mini-row mt-4 flex flex-wrap gap-2" aria-label={`${pet.name} pose states`}>
        {pet.poses.slice(0, 3).map((pose) => (
          <span key={pose} className="grid min-w-20 justify-items-center rounded-2xl border border-dashed border-white/15 bg-black/25 p-2 text-[11px] font-bold text-slate-300">
            <BridgePetSprite pet={pet} size="sm" />
            {pose}
          </span>
        ))}
      </div>

      <div className="bridge-pets-icon-row mt-4 flex flex-wrap gap-2" aria-label={`${pet.name} accessories`}>
        {pet.iconImages.slice(0, 2).map((icon) => (
          <Image key={icon} src={icon} alt="" width={32} height={32} aria-hidden />
        ))}
        {visibleTags.map((tag) => (
          <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-black text-slate-200">{tag}</span>
        ))}
      </div>

      <div className="bridge-pets-card-actions mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSelect(pet.slug)}
          disabled={selecting}
          className="bridge-pets-primary-action rounded-full bg-gradient-to-r from-yellow-300 to-violet-500 px-4 py-2 text-sm font-black text-slate-950 disabled:opacity-60"
          aria-label={`Choose ${pet.name} as your Bridge PETS companion`}
        >
          {selected ? "Selected" : selecting ? "Choosing..." : "Select"}
        </button>
        <Link href={`/bridge-pets/${pet.slug}`} className="bridge-pets-secondary-action rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white" aria-label={`Preview ${pet.name}`}>
          Preview
        </Link>
      </div>
    </article>
  );
}
