"use client";

import { useState } from "react";
import { SignOutButton } from "@/components/SignOutButton";
import { useAuth } from "@/components/AuthProvider";
import { useLanguage } from "@/components/LanguageProvider";

export default function SettingsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [mode, setMode] = useState("low_stimulation");
  const [featureLock, setFeatureLock] = useState({
    rewards: false,
    socialStories: false,
    advancedMode: true,
  });

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
