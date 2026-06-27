"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Brain, CheckCircle2, Flame, Gift, Heart, PawPrint, RotateCcw } from "lucide-react";
import { getBridgePetProfile } from "@/features/bridge-pets/petAssetManifest";
import { BridgePetSprite } from "./BridgePetSprite";

type SelectedPet = {
  id: string;
  petSlug: string;
  petName: string;
  growthStage: "baby" | "child" | "teen" | "adult";
  xp: number;
  level: number;
  mood: string;
};

const actionMap = [
  { label: "Check in", activityType: "check_in", icon: CheckCircle2 },
  { label: "Start routine", activityType: "routine_complete", icon: RotateCcw },
  { label: "Focus mode", activityType: "focus_session", icon: Brain },
  { label: "Calm reset", activityType: "calm_reset", icon: Heart },
  { label: "Rewards", activityType: "reward_earned", icon: Gift },
];

export function BridgePetDashboardWidget() {
  const [selected, setSelected] = useState<SelectedPet | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/bridge-pets?section=selected", { credentials: "include", cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setSelected(data?.selected ?? null))
      .catch(() => setSelected(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  async function runActivity(activityType: string) {
    setMessage(null);
    const res = await fetch("/api/bridge-pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      cache: "no-store",
      body: JSON.stringify({ action: "activity", activityType }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setMessage(data.error ?? "Choose a companion first.");
      return;
    }
    setSelected(data.pet);
    setMessage(`+${data.xpAwarded} XP added from real activity.`);
  }

  if (loading) {
    return <section className="bridge-pet-dashboard-widget bridge-pet-dashboard-loading">Loading Bridge PETS...</section>;
  }

  if (!selected) {
    return (
      <section className="bridge-pet-dashboard-widget">
        <div>
          <p className="bridge-pets-kicker"><PawPrint className="h-4 w-4" /> Bridge PETS</p>
          <h2>Choose a companion for daily support.</h2>
          <p>Your companion starts at zero and grows only when you complete real check-ins, routines, goals, focus, and reset sessions.</p>
        </div>
        <Link href="/bridge-pets" className="bridge-pets-primary-action">Choose companion</Link>
      </section>
    );
  }

  const profile = getBridgePetProfile(selected.petSlug);
  const progress = Math.min(100, Math.round((selected.xp / 650) * 100));
  const mood = selected.mood === "calm" || selected.mood === "focused" || selected.mood === "happy" ? selected.mood : "encouraging";

  return (
    <section className="bridge-pet-dashboard-widget" style={{ "--pet-primary": profile?.primaryColor ?? "#8b5cf6", "--pet-accent": profile?.accentColor ?? "#facc15" } as React.CSSProperties}>
      <div className="bridge-pet-dashboard-main">
        {profile ? <BridgePetSprite pet={profile} size="lg" interactive mood={mood as never} /> : null}
        <div>
          <p className="bridge-pets-kicker"><PawPrint className="h-4 w-4" /> Bridge PETS companion</p>
          <h2>{selected.petName}</h2>
          <p>
            Stage: <strong>{selected.growthStage}</strong> · Level {selected.level} · Mood {selected.mood}
          </p>
          <div className="bridge-pet-progress" aria-label={`${selected.petName} growth progress ${progress}%`}>
            <span style={{ width: `${progress}%` }} />
          </div>
          <p className="bridge-pet-encouragement">
            <Flame className="h-4 w-4" /> Small consistent wins help your companion grow with you.
          </p>
          {message ? <p className="bridge-pets-status-message">{message}</p> : null}
        </div>
      </div>
      <div className="bridge-pet-dashboard-actions">
        {actionMap.map((action) => {
          const Icon = action.icon;
          return (
            <button key={action.activityType} type="button" onClick={() => runActivity(action.activityType)}>
              <Icon className="h-4 w-4" /> {action.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
