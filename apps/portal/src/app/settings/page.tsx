"use client";

import { useEffect, useState } from "react";
import { SignOutButton } from "@/components/SignOutButton";
import { useAuth } from "@/components/AuthProvider";
import { useLanguage } from "@/components/LanguageProvider";

type NotificationPrefs = {
  setupReminders: boolean;
  careTeamActivity: boolean;
  weeklySummary: boolean;
  goalRoutineReminders: boolean;
  safetyAlerts: boolean;
};

export default function SettingsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [mode, setMode] = useState("low_stimulation");
  const [featureLock, setFeatureLock] = useState({
    rewards: false,
    socialStories: false,
    advancedMode: true,
  });
  const [notifications, setNotifications] = useState<NotificationPrefs>({
    setupReminders: true,
    careTeamActivity: true,
    weeklySummary: true,
    goalRoutineReminders: true,
    safetyAlerts: true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch("/api/settings/notifications")
      .then((r) => r.json())
      .then((data) => {
        if (data.preferences) setNotifications(data.preferences);
      })
      .catch(() => undefined);
  }, [user]);

  const saveNotifications = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/settings/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notifications),
      });
      const data = await res.json();
      if (res.ok && data.preferences) {
        setNotifications(data.preferences);
        setSaved(true);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-4 p-6">
      <section className="card p-6">
        <h1 className="text-2xl font-bold text-stone-900">{t("parent.settings.title")}</h1>
        <p className="mt-3 text-sm text-stone-700">{t("common.safetyDisclaimer")}</p>
      </section>

      {user ? (
        <section className="card p-6">
          <h2 className="text-lg font-bold text-stone-900">{t("parent.settings.account")}</h2>
          <p className="mt-2 text-sm text-stone-600">{user.name}</p>
          <p className="text-sm text-stone-500">{user.email}</p>
          <div className="mt-4">
            <SignOutButton />
          </div>
        </section>
      ) : null}

      <section className="card p-6">
        <h2 className="text-lg font-bold text-stone-900">{t("parent.settings.profileMode")}</h2>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="mt-3 rounded-md border border-stone-300 bg-white p-2 "
        >
          <option value="child">{t("parent.settings.childMode")}</option>
          <option value="teen">{t("parent.settings.teenMode")}</option>
          <option value="adult">{t("parent.settings.adultMode")}</option>
          <option value="low_stimulation">{t("parent.settings.lowStim")}</option>
          <option value="high_contrast">{t("parent.settings.highContrast")}</option>
          <option value="simple">{t("parent.settings.simpleMode")}</option>
          <option value="advanced">{t("parent.settings.advancedMode")}</option>
        </select>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-bold text-stone-900">Notification preferences</h2>
        <p className="mt-2 text-sm text-stone-600">
          Choose the alerts Bridge should prioritize. Emergency plans must still live outside Bridge.
        </p>
        <div className="mt-4 space-y-3 text-sm">
          {[
            ["setupReminders", "Quick Setup reminders", "Remind me when goals, routines, notifications, or care-team setup are incomplete."],
            ["careTeamActivity", "Care-team activity", "Alert me when a therapist, caregiver, educator, or coordinator connects or updates shared support."],
            ["weeklySummary", "Weekly progress summaries", "Send a calm weekly summary when there is enough real activity to report."],
            ["goalRoutineReminders", "Goal and routine reminders", "Gentle nudges when routines or goals need attention."],
            ["safetyAlerts", "Safety and access alerts", "Notify me about safety flags, access-code use, and important account activity."],
          ].map(([key, label, description]) => (
            <label key={key} className="flex items-start gap-3 rounded-xl border border-stone-200 p-3">
              <input
                type="checkbox"
                checked={notifications[key as keyof typeof notifications]}
                onChange={(e) => setNotifications((p) => ({ ...p, [key]: e.target.checked }))}
                className="mt-1"
              />
              <span>
                <strong className="block text-stone-900">{label}</strong>
                <small className="block leading-5 text-stone-500">{description}</small>
              </span>
            </label>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button type="button" className="btn-primary px-4 py-2 text-sm" onClick={saveNotifications} disabled={saving}>
            {saving ? "Saving…" : "Save notification preferences"}
          </button>
          {saved ? <span className="text-sm font-semibold text-emerald-700">Saved</span> : null}
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-bold text-stone-900">{t("parent.settings.featureLocks")}</h2>
        <div className="mt-3 space-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={featureLock.rewards} onChange={(e) => setFeatureLock((p) => ({ ...p, rewards: e.target.checked }))} />
            {t("parent.settings.lockRewards")}
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={featureLock.socialStories} onChange={(e) => setFeatureLock((p) => ({ ...p, socialStories: e.target.checked }))} />
            {t("parent.settings.lockStories")}
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={featureLock.advancedMode} onChange={(e) => setFeatureLock((p) => ({ ...p, advancedMode: e.target.checked }))} />
            {t("parent.settings.lockAdvanced")}
          </label>
        </div>
      </section>
    </main>
  );
}
