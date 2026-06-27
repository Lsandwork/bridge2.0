"use client";

import { useState } from "react";
import Link from "next/link";
import { Dice5, Gift, Heart, MessageCircle, Mic, Moon, PartyPopper, RotateCcw, Sparkles, Target, Trophy, X, Zap } from "lucide-react";
import { pickStressReliefActivity, nuvioAgeLabel, nextNuvioAgeStage, nuvioPointEvents, type StressReliefActivity } from "@family-support/data";
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
  onResetPosition: () => void;
};

const tabs = ["chat", "talk", "play", "rewards", "calm", "settings"] as const;

export function PetPanel({ pet, onClose, onHide, onAwardXp, onEquip, onUpdate, onResetPosition }: PetPanelProps) {
  const [tab, setTab] = useState<(typeof tabs)[number]>("chat");
  const [busy, setBusy] = useState<string | null>(null);
  const [resetActivity, setResetActivity] = useState<StressReliefActivity | null>(null);

  async function run(label: string, fn: () => Promise<void>) {
    setBusy(label);
    try {
      await fn();
    } finally {
      setBusy(null);
    }
  }

  async function stressedOutReset() {
    const activity = pickStressReliefActivity(Date.now() + pet.xp);
    setResetActivity(activity);
    await onUpdate({ mood: "overwhelmed_support" });
    await onAwardXp("stress_relief_reset", {
      source: activity.source,
      activityId: activity.id,
      activityTitle: activity.title,
      category: activity.category,
      pointsAwarded: activity.pointsAwarded,
      noDailyLimit: true,
    });
    window.localStorage.setItem("nuvio_pet_last_stress_reset", JSON.stringify({ activity, at: new Date().toISOString() }));
  }

  async function play(eventType: string, mood: CompanionPet["mood"], metadata?: Record<string, unknown>) {
    await onUpdate({ mood });
    await onAwardXp(eventType, { source: "nuvio_pet_panel", ...metadata });
  }

  const nextStage = nextNuvioAgeStage(pet.xp);
  const pointsToNext = nextStage ? Math.max(0, nextStage.minPoints - pet.xp) : 0;

  return (
    <div className="pet-panel" role="dialog" aria-modal="false" aria-label="Nuvio Pet panel">
      <div className="pet-panel__header">
        <div className="pet-panel__title">
          <PetSprite species={pet.species} mood={pet.mood} outfit={pet.activeOutfit} size="sm" motionLevel={pet.settings.motionLevel} />
          <div>
            <p className="pet-kicker">Nuvio Pet</p>
            <h2>{pet.name}</h2>
            <span>{nuvioAgeLabel(pet.growthStage)} · {pet.personality} · mood: {pet.mood.replace(/_/g, " ")}</span>
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
            {item === "chat" ? "Chat" : item === "talk" ? "Talk" : item === "play" ? "Play" : item === "rewards" ? "Rewards" : item === "calm" ? "Calm" : "Settings"}
          </button>
        ))}
      </div>

      {tab === "chat" ? (
        <div className="pet-panel__body">
          <PetNotificationPrompt />
          <button type="button" className="pet-stress-btn" disabled={busy !== null} onClick={() => void run("stress", stressedOutReset)}>
            <Zap className="h-5 w-5" />
            <span>
              Stressed Out?
              <small>Take a reset with Nuvio · +20 points · no daily cap</small>
            </span>
          </button>
          {resetActivity ? (
            <div className="pet-reset-result" role="status">
              <strong>+20 points — Nuvio is growing!</strong>
              <p>Let’s try this: {resetActivity.title}. You earned +20 points for taking a reset with Nuvio.</p>
            </div>
          ) : null}
          <div className="pet-action-grid">
            <Link href="/tess/chat" className="pet-action-link">
              <MessageCircle className="h-4 w-4" />
              Talk to Nuvio
              <span>chat, type, or voice</span>
            </Link>
            <Link href="/my-space/tess/voice" className="pet-action-link">
              <Mic className="h-4 w-4" />
              Voice with Nuvio
              <span>talk-back when available</span>
            </Link>
            <button type="button" disabled={busy !== null} onClick={() => void run("talk", () => play("talk_to_nuvio", "talking", { action: "quick_chat" }))}>
              <Heart className="h-4 w-4" />
              Encourage me
              <span>+{nuvioPointEvents.talk_to_nuvio.points} points</span>
            </button>
          </div>
          <div className="pet-panel__note">
            <Sparkles className="h-4 w-4" />
            <p>
              Nuvio Pet is supportive only. It does not diagnose, treat, replace therapy, or replace emergency care.
            </p>
          </div>
        </div>
      ) : null}

      {tab === "talk" ? (
        <div className="pet-panel__body">
          <div className="pet-panel__section-title">
            <span>Talk with Nuvio</span>
            <small>Voice uses the existing Nuvio voice system when available and falls back to typed chat.</small>
          </div>
          <div className="pet-action-grid">
            <Link href="/tess/chat" className="pet-action-link"><MessageCircle className="h-4 w-4" /> Open chat <span>typed support</span></Link>
            <Link href="/my-space/tess/voice" className="pet-action-link"><Mic className="h-4 w-4" /> Open voice <span>listen and talk back</span></Link>
            <button type="button" disabled={busy !== null} onClick={() => void run("listen", () => onUpdate({ mood: "listening" }))}><Sparkles className="h-4 w-4" /> Listening pulse <span>sensory-safe animation</span></button>
            <button type="button" disabled={busy !== null} onClick={() => void run("thinking", () => onUpdate({ mood: "thinking" }))}><Target className="h-4 w-4" /> Thinking mode <span>calm pause</span></button>
          </div>
        </div>
      ) : null}

      {tab === "play" ? (
        <div className="pet-panel__body">
          <div className="pet-action-grid">
            <button type="button" disabled={busy !== null} onClick={() => void run("wheel", () => play("daily_reset_wheel", "excited", { game: "daily_reset_wheel" }))}><Dice5 className="h-4 w-4" /> Daily Reset Wheel <span>+{nuvioPointEvents.daily_reset_wheel.points} points</span></button>
            <button type="button" disabled={busy !== null} onClick={() => void run("mystery", () => play("mystery_reward", "celebrating", { game: "mystery_reward" }))}><Gift className="h-4 w-4" /> Mystery Reward <span>bonus points</span></button>
            <button type="button" disabled={busy !== null} onClick={() => void run("dance", () => play("play_with_nuvio", "happy", { interaction: "dance" }))}><PartyPopper className="h-4 w-4" /> Dance <span>+{nuvioPointEvents.play_with_nuvio.points} points</span></button>
            <button type="button" disabled={busy !== null} onClick={() => void run("highfive", () => play("play_with_nuvio", "celebrating", { interaction: "high_five" }))}><Sparkles className="h-4 w-4" /> High five <span>quick connection</span></button>
            <button type="button" disabled={busy !== null} onClick={() => void run("family", () => play("family_challenge_complete", "happy", { challenge: "family_check_in" }))}><Heart className="h-4 w-4" /> Family challenge <span>+{nuvioPointEvents.family_challenge_complete.points} points</span></button>
            <button type="button" disabled={busy !== null} onClick={() => void run("calmchallenge", () => play("calm_activity_complete", "calm", { challenge: "calm_reset" }))}><Moon className="h-4 w-4" /> Calm challenge <span>+{nuvioPointEvents.calm_activity_complete.points} points</span></button>
          </div>
        </div>
      ) : null}

      {tab === "rewards" ? (
        <div className="pet-panel__body">
          <div className="pet-rewards-card">
            <Trophy className="h-5 w-5" />
            <div>
              <strong>{pet.xp} lifetime points</strong>
              <p>{nextStage ? `${pointsToNext} points to ${nextStage.label}` : "Champion stage reached — keep growing beyond the badge."}</p>
            </div>
          </div>
          <PetWardrobe outfit={pet.activeOutfit} onEquip={(slot, itemId) => void onEquip(slot, itemId)} />
        </div>
      ) : null}

      {tab === "calm" ? (
        <div className="pet-panel__body">
          <button type="button" className="pet-stress-btn" disabled={busy !== null} onClick={() => void run("stress-calm", stressedOutReset)}>
            <Zap className="h-5 w-5" />
            <span>Stressed Out?<small>Get a supportive reset idea and +20 points.</small></span>
          </button>
          <div className="pet-action-grid">
            <button type="button" disabled={busy !== null} onClick={() => void run("breathing", async () => { await onUpdate({ mood: "calm" }); await onAwardXp("emotional_regulation", { source: "nuvio_pet_calm", activity: "breathing" }); })}><Moon className="h-4 w-4" /> 2-minute breathing <span>slow reset</span></button>
            <button type="button" disabled={busy !== null} onClick={() => void run("focus", () => onUpdate({ mood: "focus" }))}><Target className="h-4 w-4" /> Focus mode <span>one step</span></button>
          </div>
        </div>
      ) : null}

      {tab === "settings" ? (
        <div className="pet-panel__body">
          <PetSettings
            pet={pet}
            onChange={(settings) => {
              void onUpdate({ settings });
            }}
          />
          <button type="button" className="pet-btn pet-btn--ghost" onClick={onResetPosition}>
            <RotateCcw className="h-4 w-4" /> Reset position
          </button>
        </div>
      ) : null}

      <div className="pet-panel__footer">
        <button type="button" className="pet-btn pet-btn--ghost" onClick={onHide}>
          Hide companion
        </button>
      </div>
    </div>
  );
}
