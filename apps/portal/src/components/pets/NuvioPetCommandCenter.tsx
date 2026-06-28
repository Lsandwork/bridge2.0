"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Gamepad2, Gift, Headphones, Mic, RotateCcw, Settings, Sparkles, Trophy, WandSparkles, Zap, type LucideIcon } from "lucide-react";
import { PARENT_QUICK_PROMPTS } from "@family-support/core";
import { nextNuvioAgeStage, nuvioAgeLabel, nuvioPointEvents, pickStressReliefActivity, type StressReliefActivity } from "@family-support/data";
import { TessScreen } from "@/components/tess/TessScreen";
import { useCompanionPet } from "./CompanionPetProvider";
import { PetGrowthMeter } from "./PetGrowthMeter";
import { PetSetupWizard } from "./PetSetupWizard";
import { PetSprite } from "./PetSprite";
import { PetWardrobe } from "./PetWardrobe";

type ProfileOption = { id: string; name: string };

export function NuvioPetCommandCenter({
  profileId,
  profiles,
  onProfileChange,
  initialPrompt,
  startTalk,
}: {
  profileId: string;
  profiles: ProfileOption[];
  onProfileChange: (id: string) => void;
  initialPrompt?: string | null;
  startTalk?: boolean;
}) {
  const { state, createPet, updatePet, awardXp, equipItem } = useCompanionPet();
  const pet = state?.pet ?? null;
  const [drawer, setDrawer] = useState<"growth" | "style" | "rewards" | "games" | "settings">("style");
  const [busy, setBusy] = useState<string | null>(null);
  const [resetActivity, setResetActivity] = useState<StressReliefActivity | null>(null);
  const [celebration, setCelebration] = useState<string | null>(null);

  const quickActions = useMemo(() => {
    if (!initialPrompt) return PARENT_QUICK_PROMPTS;
    return [
      {
        id: "requested-prompt",
        label: "Start request",
        prompt: initialPrompt,
        tone: "supportive" as const,
      },
      ...PARENT_QUICK_PROMPTS,
    ];
  }, [initialPrompt]);

  async function run(label: string, eventType: string, metadata?: Record<string, unknown>) {
    if (!pet) return;
    setBusy(label);
    try {
      await updatePet({ mood: eventType.includes("calm") || eventType.includes("stress") ? "calm" : "celebrating" });
      await awardXp(eventType, { source: "nuvio_command_center", ...metadata });
      setCelebration(`+${nuvioPointEvents[eventType as keyof typeof nuvioPointEvents]?.points ?? "bonus"} points added`);
      window.setTimeout(() => setCelebration(null), 2600);
    } finally {
      setBusy(null);
    }
  }

  async function stressedOutReset() {
    if (!pet) return;
    const activity = pickStressReliefActivity(Date.now() + pet.xp);
    setResetActivity(activity);
    await run("stress", "stressed_out_reset", {
      activityId: activity.id,
      activityTitle: activity.title,
      category: activity.category,
      noDailyLimit: true,
    });
  }

  if (!pet) {
    return (
      <main className="nuvio-command nuvio-command--setup">
        <div className="nuvio-command__setup-card">
          <p className="nuvio-command__eyebrow">Nuvio Companion</p>
          <h1>Choose your companion to begin.</h1>
          <p>Your pet starts at zero points and grows only from your real Bridge activity.</p>
          <PetSetupWizard
            onCreate={(input) => createPet(input)}
            onSkip={() => undefined}
          />
        </div>
      </main>
    );
  }

  const nextStage = nextNuvioAgeStage(pet.xp);
  const pointsToNext = nextStage ? Math.max(0, nextStage.minPoints - pet.xp) : 500;

  return (
    <main className="nuvio-command">
      <section className="nuvio-command__hero" aria-label="Nuvio command center">
        <div className="nuvio-command__hero-top">
          <Link href="/dashboard" className="nuvio-command__back">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <div className="nuvio-command__profile-tools">
            {profiles.length ? (
              <select
                value={profileId}
                onChange={(event) => onProfileChange(event.target.value)}
                aria-label="Choose profile"
              >
                {profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>{profile.name}</option>
                ))}
              </select>
            ) : null}
          </div>
        </div>

        <div className="nuvio-command__pet-stage">
          <div className="nuvio-command__pet-glow" aria-hidden />
          <PetSprite species={pet.species} mood={pet.mood} outfit={pet.activeOutfit} size="lg" motionLevel={pet.settings.motionLevel} />
          <div>
            <p className="nuvio-command__eyebrow">Nuvio Companion</p>
            <h1>Talk to Nuvio</h1>
            <p>
              {nuvioAgeLabel(pet.growthStage)} · Level {pet.level} · {pet.xp} lifetime points
            </p>
          </div>
        </div>

        <div className="nuvio-command__actions" aria-label="Nuvio quick actions">
          <button type="button" disabled={busy !== null} onClick={stressedOutReset}>
            <Zap className="h-4 w-4" /> Stressed Out? <span>+20 every time</span>
          </button>
          <button type="button" disabled={busy !== null} onClick={() => void run("voice", "voice_chat")}>
            <Mic className="h-4 w-4" /> Voice warm-up <span>+5</span>
          </button>
          <button type="button" disabled={busy !== null} onClick={() => void run("play", "play_interaction", { interaction: "pet_tap" })}>
            <Sparkles className="h-4 w-4" /> Play <span>bond + grow</span>
          </button>
          <button type="button" disabled={busy !== null} onClick={() => void run("reset", "daily_reset_wheel")}>
            <RotateCcw className="h-4 w-4" /> Reset Wheel <span>daily tool</span>
          </button>
        </div>

        {resetActivity ? (
          <div className="nuvio-command__reset" role="status">
            <strong>{resetActivity.title}</strong>
            <span>{resetActivity.category} · approved reset idea</span>
          </div>
        ) : null}
        {celebration ? <div className="nuvio-command__celebration" role="status">{celebration}</div> : null}
      </section>

      <section className="nuvio-command__chat" aria-label="Nuvio chat and voice">
        <TessScreen
          childProfileId={profileId}
          quickActions={quickActions}
          mode="parent_assistant"
          defaultInputMode={startTalk ? "talk" : "text"}
          embedded
          placeholder="Ask Nuvio about routines, goals, sensory supports, next steps, or how to reset…"
        />
      </section>

      <aside className="nuvio-command__drawer" aria-label="Nuvio pet customization and rewards">
        <div className="nuvio-command__drawer-tabs" role="tablist" aria-label="Nuvio companion sections">
          {([
            { id: "style", Icon: WandSparkles, label: "Style" },
            { id: "growth", Icon: Trophy, label: "Growth" },
            { id: "rewards", Icon: Gift, label: "Rewards" },
            { id: "games", Icon: Gamepad2, label: "Games" },
            { id: "settings", Icon: Settings, label: "Settings" },
          ] satisfies Array<{ id: typeof drawer; Icon: LucideIcon; label: string }>).map(({ id, Icon, label }) => (
            <button key={String(id)} type="button" className={drawer === id ? "is-active" : ""} onClick={() => setDrawer(id as typeof drawer)}>
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        {drawer === "style" ? (
          <div className="nuvio-command__drawer-body">
            <div className="nuvio-command__section-head">
              <span>Locker + accessories</span>
              <small>Equip original Bridge items. Licensed sports/team gear only appears after official approval.</small>
            </div>
            <PetWardrobe outfit={pet.activeOutfit} onEquip={(slot, itemId) => void equipItem(slot, itemId)} />
          </div>
        ) : null}

        {drawer === "growth" ? (
          <div className="nuvio-command__drawer-body">
            <div className="nuvio-command__section-head">
              <span>Growth journey</span>
              <small>Baby → Young → Teen → Adult → Champion → Legendary</small>
            </div>
            <PetGrowthMeter xp={pet.xp} stage={pet.growthStage} level={pet.level} />
            <div className="nuvio-command__stats-grid">
              <span><strong>{pet.xp}</strong>Lifetime points</span>
              <span><strong>{pointsToNext}</strong>To next stage</span>
              <span><strong>{nuvioAgeLabel(pet.growthStage)}</strong>Current stage</span>
              <span><strong>No cap</strong>Keep growing</span>
            </div>
          </div>
        ) : null}

        {drawer === "rewards" ? (
          <div className="nuvio-command__drawer-body">
            <div className="nuvio-command__section-head">
              <span>Rewards + redeem</span>
              <small>Rewards unlock from healthy engagement and care-team-approved milestones.</small>
            </div>
            <div className="nuvio-command__reward-list">
              {["Starter Bandana", "Calm Hoodie", "Focus Glasses", "Explorer Pack", "Tiny Wins Badge"].map((item, index) => (
                <button key={item} type="button" onClick={() => void run("redeem", "redeem_reward", { item })}>
                  <Gift className="h-4 w-4" />
                  <span>{item}</span>
                  <small>{index < pet.level ? "Unlocked" : `Unlocks near level ${index + 1}`}</small>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {drawer === "games" ? (
          <div className="nuvio-command__drawer-body">
            <div className="nuvio-command__section-head">
              <span>Games + calm tools</span>
              <small>Simple, respectful interactions that support momentum without toddler styling.</small>
            </div>
            <div className="nuvio-command__game-grid">
              <button type="button" disabled={busy !== null} onClick={() => void run("breathing", "breathing_exercise")}><Headphones className="h-4 w-4" /> Breathing</button>
              <button type="button" disabled={busy !== null} onClick={() => void run("journal", "journal_prompt")}><Sparkles className="h-4 w-4" /> Journal</button>
              <button type="button" disabled={busy !== null} onClick={() => void run("gratitude", "gratitude_prompt")}><Trophy className="h-4 w-4" /> Gratitude</button>
              <button type="button" disabled={busy !== null} onClick={() => void run("confidence", "confidence_challenge")}><Zap className="h-4 w-4" /> Confidence</button>
            </div>
          </div>
        ) : null}

        {drawer === "settings" ? (
          <div className="nuvio-command__drawer-body">
            <div className="nuvio-command__section-head">
              <span>Companion settings</span>
              <small>Your custom name is kept here, not on the floating launcher.</small>
            </div>
            <label className="nuvio-command__field">
              Companion name
              <input
                value={pet.name}
                onChange={(event) => void updatePet({ name: event.target.value || "Spark" })}
              />
            </label>
            <button type="button" onClick={() => void updatePet({ mood: "idle" })}>Return to idle</button>
          </div>
        ) : null}
      </aside>
    </main>
  );
}
