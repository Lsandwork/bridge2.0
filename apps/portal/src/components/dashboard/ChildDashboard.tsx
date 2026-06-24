"use client";

import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useProfile } from "@/components/ProfileProvider";
import {
  buildDashboardUser,
  featureCards,
  moodOptions,
  scheduleItems,
  type MoodOption,
} from "./dashboardMockData";
import { HeroCard } from "./HeroCard";
import { DailyScheduleCard } from "./DailyScheduleCard";
import { MoodCheckIn } from "./MoodCheckIn";
import { FeatureActionCard } from "./FeatureActionCard";
import { TessFloatingButton } from "./TessFloatingButton";
import { AccessibilityToggles } from "./AccessibilityToggles";

type Props = {
  profileId: string;
  profileName: string;
  calmActive: boolean;
  contrastActive: boolean;
  onCalmChange: (active: boolean) => void;
  onContrastChange: (active: boolean) => void;
  showSwitchProfile?: boolean;
  onSwitchProfile?: () => void;
};

export function ChildDashboard({
  profileId,
  profileName,
  calmActive,
  contrastActive,
  onCalmChange,
  onContrastChange,
  showSwitchProfile,
  onSwitchProfile,
}: Props) {
  const { t } = useLanguage();
  const [selectedMoodId, setSelectedMoodId] = useState<string | null>(null);
  const [savedMoodLabel, setSavedMoodLabel] = useState<string | null>(null);
  const [stars, setStars] = useState(11);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? t("home.morning") : hour < 17 ? t("home.afternoon") : t("home.evening"));
  }, [t]);

  useEffect(() => {
    fetch(`/api/rewards?profileId=${profileId}`)
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.balance === "number") setStars(data.balance);
      })
      .catch(() => {
        /* keep mock default */
      });
  }, [profileId]);

  const user = useMemo(
    () => buildDashboardUser(profileName, stars, greeting || t("home.afternoon")),
    [profileName, stars, greeting, t]
  );

  const handleMoodSelect = async (option: MoodOption) => {
    setSelectedMoodId(option.id);
    const label = t(option.labelKey);
    try {
      await fetch("/api/bridge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "check-in",
          childProfileId: profileId,
          type: "emotion",
          value: option.value,
        }),
      });
      setSavedMoodLabel(label);
      window.setTimeout(() => {
        setSavedMoodLabel(null);
        setSelectedMoodId(null);
      }, 2500);
    } catch {
      setSavedMoodLabel(label);
    }
  };

  return (
    <div className="bridge-dashboard bridge-dashboard-page mx-auto max-w-lg px-4 pb-4">
      <h1 className="bridge-dashboard__greeting mt-4">
        {t("myspace.hi", { name: profileName })} 👋
      </h1>

      <AccessibilityToggles
        calmActive={calmActive}
        contrastActive={contrastActive}
        onCalmChange={onCalmChange}
        onContrastChange={onContrastChange}
        showSwitchProfile={showSwitchProfile}
        onSwitchProfile={onSwitchProfile}
      />

      <HeroCard user={{ ...user, encouragement: t("home.encouragement") }} />

      <DailyScheduleCard items={scheduleItems} />

      <MoodCheckIn
        options={moodOptions}
        selectedId={selectedMoodId}
        onSelect={handleMoodSelect}
        savedLabel={savedMoodLabel}
      />

      <div className="bridge-feature-grid">
        {featureCards.map((card) => (
          <FeatureActionCard
            key={card.id}
            card={card}
            title={card.id === "communicate" ? t("home.communicate") : t("home.sensory")}
            description={card.id === "communicate" ? t("home.communicateDesc") : t("home.sensoryDesc")}
          />
        ))}
      </div>

      <TessFloatingButton />
    </div>
  );
}
