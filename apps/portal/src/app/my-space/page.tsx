"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { useAuth } from "@/components/AuthProvider";
import { useProfile } from "@/components/ProfileProvider";
import { ChildDashboard } from "@/components/dashboard/ChildDashboard";

export default function MySpaceHomePage() {
  const { user } = useAuth();
  const { profiles, activeProfile, setActiveProfileId, profilesLoading, lowStimulation, setLowStimulation, highContrast, setHighContrast } =
    useProfile();
  const { t } = useLanguage();
  const showSwitchProfile = user?.role !== "child_user";

  if (!activeProfile) {
    if (profilesLoading) {
      return (
        <main className="mx-auto max-w-lg px-4 py-10 text-center">
          <p className="text-lg font-bold text-[var(--bd-muted)]">{t("myspace.loadingProfiles")}</p>
        </main>
      );
    }

    return (
      <main className="bridge-dashboard mx-auto max-w-lg px-4 py-10">
        <h1 className="text-center text-2xl font-extrabold text-[var(--bd-text)]">{t("myspace.whoUsing")}</h1>
        {profiles.length === 0 ? (
          <p className="mt-6 text-center text-[var(--bd-muted)]">{t("myspace.noProfiles")}</p>
        ) : (
          <div className="mt-8 space-y-3">
            {profiles.map((p) => (
              <button
                key={p.id}
                type="button"
                className="bridge-card flex w-full items-center gap-4 p-5 text-left transition active:scale-[0.99]"
                onClick={() => setActiveProfileId(p.id)}
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0EAFF] text-3xl">
                  {p.ageGroup === "child" ? "🧒" : p.ageGroup === "teen" ? "🧑" : "🧑‍🦱"}
                </span>
                <div>
                  <p className="text-xl font-extrabold text-[var(--bd-text)]">{p.name}</p>
                  <p className="text-sm capitalize text-[var(--bd-muted)]">{p.ageGroup}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    );
  }

  return (
    <ChildDashboard
      profileId={activeProfile.id}
      profileName={activeProfile.name}
      calmActive={lowStimulation}
      contrastActive={highContrast}
      onCalmChange={setLowStimulation}
      onContrastChange={setHighContrast}
      showSwitchProfile={showSwitchProfile}
      onSwitchProfile={() => setActiveProfileId(null)}
    />
  );
}
