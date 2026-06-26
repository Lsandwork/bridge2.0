"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TESS_CRISIS_DISCLAIMER, TESS_DISCLAIMER } from "@family-support/core";
import { LoadingBlock } from "@/components/StateBlock";

type Settings = {
  tessEnabled: boolean;
  voiceEnabled: boolean;
  speechToTextEnabled: boolean;
  textToSpeechEnabled: boolean;
  simpleLanguage: boolean;
  lowStimulation: boolean;
  teenAdultRespectfulMode: boolean;
  requireParentApproval: boolean;
  allowSavePhrases: boolean;
  allowRoutineSuggestions: boolean;
  allowTaskSuggestions: boolean;
  allowExerciseSuggestions: boolean;
  allowSocialStorySuggestions: boolean;
  allowRewardSuggestions: boolean;
  allowGoalSuggestions: boolean;
  dataRetentionDays: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  escalationEnabled: boolean;
};

export default function TessSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileId, setProfileId] = useState("");
  const [profiles, setProfiles] = useState<{ id: string; name: string }[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/profiles")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setProfiles(list);
        if (list[0]) setProfileId((current) => current || list[0].id);
      });
  }, []);

  useEffect(() => {
    if (!profileId) return;
    setLoading(true);
    fetch(`/api/tess/settings?childProfileId=${profileId}`)
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
      });
  }, [profileId]);

  const update = (patch: Partial<Settings>) => {
    if (!settings) return;
    setSettings({ ...settings, ...patch });
    setSaved(false);
  };

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    await fetch("/api/tess/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childProfileId: profileId, ...settings }),
    });
    setSaving(false);
    setSaved(true);
  };

  if (loading || !settings) return <LoadingBlock label="Loading Tess settings…" />;

  const toggles: { key: keyof Settings; label: string }[] = [
    { key: "tessEnabled", label: "Enable Tess" },
    { key: "voiceEnabled", label: "Enable voice" },
    { key: "speechToTextEnabled", label: "Speech-to-text" },
    { key: "textToSpeechEnabled", label: "Text-to-speech" },
    { key: "requireParentApproval", label: "Require parent approval for suggestions" },
    { key: "allowSavePhrases", label: "Allow phrase saving" },
    { key: "allowRoutineSuggestions", label: "Allow routine suggestions" },
    { key: "allowTaskSuggestions", label: "Allow task suggestions" },
    { key: "allowExerciseSuggestions", label: "Allow exercise suggestions" },
    { key: "allowSocialStorySuggestions", label: "Allow social story suggestions" },
    { key: "allowRewardSuggestions", label: "Allow reward suggestions" },
    { key: "allowGoalSuggestions", label: "Allow goal suggestions" },
    { key: "lowStimulation", label: "Low-stimulation default" },
    { key: "simpleLanguage", label: "Simple language default" },
    { key: "teenAdultRespectfulMode", label: "Teen/adult respectful mode" },
    { key: "escalationEnabled", label: "Safety escalation enabled" },
  ];

  return (
    <main className="mx-auto max-w-2xl p-6">
      <Link href="/tess" className="mb-4 flex items-center gap-1 text-sm font-bold text-[var(--brand)]">
        <ArrowLeft className="h-4 w-4" /> Back to Tess
      </Link>
      <h1 className="text-2xl font-extrabold">Tess Settings</h1>

      <p className="mt-4 rounded-xl bg-[var(--tess-lavender,#e8e4f8)] p-4 text-xs leading-relaxed">{TESS_DISCLAIMER}</p>
      <p className="mt-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-900">{TESS_CRISIS_DISCLAIMER}</p>

      <div className="mt-6 tess-card space-y-4 p-5">
        <label className="block text-sm font-bold">
          Profile
          <select
            className="mt-1 w-full rounded-xl border px-3 py-2"
            value={profileId}
            onChange={(e) => setProfileId(e.target.value)}
          >
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>{profile.name}</option>
            ))}
          </select>
        </label>

        {toggles.map(({ key, label }) => (
          <label key={key} className="flex items-center justify-between gap-3 text-sm font-semibold">
            {label}
            <input
              type="checkbox"
              checked={Boolean(settings[key])}
              onChange={(e) => update({ [key]: e.target.checked } as Partial<Settings>)}
            />
          </label>
        ))}

        <label className="block text-sm font-bold">
          Data retention (days)
          <input
            type="number"
            className="mt-1 w-full rounded-xl border px-3 py-2"
            value={settings.dataRetentionDays}
            onChange={(e) => update({ dataRetentionDays: Number(e.target.value) })}
          />
        </label>

        <label className="block text-sm font-bold">
          Emergency contact name
          <input
            className="mt-1 w-full rounded-xl border px-3 py-2"
            value={settings.emergencyContactName ?? ""}
            onChange={(e) => update({ emergencyContactName: e.target.value })}
          />
        </label>

        <label className="block text-sm font-bold">
          Emergency contact phone
          <input
            className="mt-1 w-full rounded-xl border px-3 py-2"
            value={settings.emergencyContactPhone ?? ""}
            onChange={(e) => update({ emergencyContactPhone: e.target.value })}
          />
        </label>

        <button type="button" className="btn-primary w-full py-3" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save settings"}
        </button>
        {saved ? <p className="text-center text-sm font-bold text-green-700">Settings saved.</p> : null}
      </div>
    </main>
  );
}
