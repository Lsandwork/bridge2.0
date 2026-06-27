"use client";

import { useState } from "react";
import { Heart, Moon, PartyPopper, Sparkles, Target, X } from "lucide-react";
import type { CompanionPet } from "./CompanionPetProvider";
import { PetSprite } from "./PetSprite";
import { PetGrowthMeter } from "./PetGrowthMeter";
import { PetWardrobe } from "./PetWardrobe";
import { PetSettings } from "./PetSettings";
import { PetNotificationPrompt } from "./PetNotificationPrompt";

type PetPanelProps = {
  pet: CompanionPet;
  onClose: () => void;
  onHide: () => void;
  onAwardXp: (eventType: string, metadata?: Record<string, unknown>) => Promise<void>;
  onEquip: (slot: string, itemId: string) => Promise<void>;
  onUpdate: (patch: Partial<CompanionPet>) => Promise<void>;
};

const tabs = ["care", "wardrobe", "settings"] as const;

export function PetPanel({ pet, onClose, onHide, onAwardXp, onEquip, onUpdate }: PetPanelProps) {
  const [tab, setTab] = useState<(typeof tabs)[number]>("care");
  const [busy, setBusy] = useState<string | null>(null);

  async function run(label: string, fn: () => Promise<void>) {
    setBusy(label);
    try {
      await fn();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="pet-panel" role="dialog" aria-modal="false" aria-label={`${pet.name} companion panel`}>
      <div className="pet-panel__header">
        <div className="pet-panel__title">
          <PetSprite species={pet.species} mood={pet.mood} outfit={pet.activeOutfit} size="sm" motionLevel={pet.settings.motionLevel} />
          <div>
            <p className="pet-kicker">Your companion</p>
            <h2>{pet.name}</h2>
            <span>{pet.personality} · current mood: {pet.mood.replace(/_/g, " ")}</span>
          </div>
        </div>
        <button type="button" className="pet-icon-btn" onClick={onClose} aria-label="Close companion panel">
          <X className="h-4 w-4" />
        </button>
      </div>

      <PetGrowthMeter xp={pet.xp} stage={pet.growthStage} level={pet.level} />

      <div className="pet-panel__tabs" role="tablist" aria-label="Companion options">
        {tabs.map((item) => (
          <button key={item} type="button" className={tab === item ? "is-active" : ""} onClick={() => setTab(item)}>
            {item === "care" ? "Care" : item === "wardrobe" ? "Wardrobe" : "Settings"}
          </button>
        ))}
      </div>

      {tab === "care" ? (
        <div className="pet-panel__body">
          <PetNotificationPrompt />
          <div className="pet-action-grid">
            <button type="button" disabled={busy !== null} onClick={() => void run("encourage", () => onAwardXp("caregiver_encouragement", { source: "pet_panel" }))}>
              <Heart className="h-4 w-4" />
              Feed encouragement
              <span>+20 XP</span>
            </button>
            <button type="button" disabled={busy !== null} onClick={() => void run("calm", async () => { await onUpdate({ mood: "calm" }); await onAwardXp("emotional_regulation", { source: "pet_panel" }); })}>
              <Moon className="h-4 w-4" />
              Calm mode
              <span>Slow breathing</span>
            </button>
            <button type="button" disabled={busy !== null} onClick={() => void run("focus", () => onUpdate({ mood: "focus" }))}>
              <Target className="h-4 w-4" />
              Focus mode
              <span>One step</span>
            </button>
            <button type="button" disabled={busy !== null} onClick={() => void run("celebrate", () => onAwardXp("manual_celebrate", { source: "pet_panel" }))}>
              <PartyPopper className="h-4 w-4" />
              Celebrate win
              <span>tiny wins count</span>
            </button>
          </div>
          <div className="pet-panel__note">
            <Sparkles className="h-4 w-4" />
            <p>
              Nuvio pets are supportive only. They do not diagnose, treat, replace therapy, or replace emergency care.
            </p>
          </div>
        </div>
      ) : null}

      {tab === "wardrobe" ? <PetWardrobe outfit={pet.activeOutfit} onEquip={(slot, itemId) => void onEquip(slot, itemId)} /> : null}
      {tab === "settings" ? (
        <PetSettings
          pet={pet}
          onChange={(settings) => {
            void onUpdate({ settings });
          }}
        />
      ) : null}

      <div className="pet-panel__footer">
        <button type="button" className="pet-btn pet-btn--ghost" onClick={onHide}>
          Hide companion
        </button>
      </div>
    </div>
  );
}
