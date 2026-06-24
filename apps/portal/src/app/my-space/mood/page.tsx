"use client";

import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useProfile } from "@/components/ProfileProvider";

const EMOTION_KEYS = [
  "mood.emotion.happy",
  "mood.emotion.calm",
  "mood.emotion.anxious",
  "mood.emotion.sad",
  "mood.emotion.overwhelmed",
  "mood.emotion.excited",
] as const;

const SENSORY = [
  { id: "loud", labelKey: "mood.sensory.loud" },
  { id: "bright", labelKey: "mood.sensory.bright" },
  { id: "pressure", labelKey: "mood.sensory.pressure" },
  { id: "movement", labelKey: "mood.sensory.movement" },
  { id: "quiet", labelKey: "mood.sensory.quiet" },
  { id: "okay", labelKey: "mood.sensory.okay" },
] as const;

export default function MySpaceMoodPage() {
  const { activeProfile } = useProfile();
  const { t } = useLanguage();
  const [emotionKey, setEmotionKey] = useState<string | null>(null);
  const [sensory, setSensory] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState(false);

  const toggleSensory = (id: string) => {
    setSensory((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const save = async () => {
    if (!activeProfile) return;
    if (emotionKey) {
      await fetch("/api/bridge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "check-in",
          childProfileId: activeProfile.id,
          type: "emotion",
          value: t(emotionKey),
        }),
      });
    }
    for (const id of sensory) {
      const item = SENSORY.find((s) => s.id === id);
      if (!item) continue;
      await fetch("/api/bridge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "check-in",
          childProfileId: activeProfile.id,
          type: "sensory",
          value: t(item.labelKey),
        }),
      });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (!activeProfile) {
    return (
      <main className="mx-auto max-w-md p-8 text-center">
        <p className="font-bold">{t("myspace.pickProfile")}</p>
      </main>
    );
  }

  return (
    <main className="ms-page ms-page-pad-bottom mx-auto max-w-lg px-4 py-5">
      <section className="ms-card p-5">
        <h2 className="font-extrabold">{t("mood.feelTitle")}</h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {EMOTION_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              className={`rounded-2xl py-3 text-sm font-extrabold ${emotionKey === key ? "bg-[var(--ms-accent)] text-white" : "bg-[var(--ms-accent-soft)]"}`}
              onClick={() => setEmotionKey(key)}
            >
              {t(key)}
            </button>
          ))}
        </div>
      </section>

      <section className="ms-card mt-4 p-5">
        <h2 className="font-extrabold">{t("mood.sensoryTitle")}</h2>
        <div className="mt-3 space-y-2">
          {SENSORY.map((s) => (
            <label key={s.id} className="flex cursor-pointer items-center gap-3 rounded-xl bg-[var(--ms-accent-soft)] p-3 font-bold">
              <input type="checkbox" checked={sensory.has(s.id)} onChange={() => toggleSensory(s.id)} className="h-5 w-5" />
              {t(s.labelKey)}
            </label>
          ))}
        </div>
      </section>

      <button type="button" className="ms-btn ms-btn-primary mt-5 w-full text-lg" onClick={save}>
        {saved ? t("mood.saved") : t("mood.save")}
      </button>

      <button
        type="button"
        className="ms-btn mt-3 w-full border-4 border-amber-400 bg-amber-50 text-lg font-extrabold text-amber-900"
        onClick={() => {
          if (activeProfile) {
            fetch("/api/bridge", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "check-in",
                childProfileId: activeProfile.id,
                type: "sensory",
                value: t("mood.break"),
                notes: "Take a Break button pressed",
              }),
            });
          }
          alert(t("mood.breakAlert"));
        }}
      >
        {t("mood.break")}
      </button>
    </main>
  );
}
