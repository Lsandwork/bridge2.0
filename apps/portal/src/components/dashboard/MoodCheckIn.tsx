"use client";

import { useLanguage } from "@/components/LanguageProvider";
import type { MoodOption } from "./dashboardMockData";
import { MoodOptionCard } from "./MoodOptionCard";

type Props = {
  options: MoodOption[];
  selectedId: string | null;
  onSelect: (option: MoodOption) => void;
  savedLabel?: string | null;
};

export function MoodCheckIn({ options, selectedId, onSelect, savedLabel }: Props) {
  const { t } = useLanguage();

  return (
    <section className="bridge-card" aria-labelledby="mood-checkin-title">
      <h2 id="mood-checkin-title" className="bridge-card__title">
        <span aria-hidden>❤️</span>
        {t("home.howFeeling")}
      </h2>
      <p className="bridge-card__subtitle">{t("home.moodSubtitle")}</p>

      {savedLabel ? (
        <p className="rounded-xl bg-[#EAFBF5] px-4 py-3 text-center text-sm font-bold text-[#065F46]" role="status">
          {t("home.savedMood", { label: savedLabel })}
        </p>
      ) : (
        <div className="bridge-mood-grid" role="group" aria-label={t("home.howFeeling")}>
          {options.map((option) => (
            <MoodOptionCard
              key={option.id}
              option={option}
              label={t(option.labelKey)}
              selected={selectedId === option.id}
              onSelect={() => onSelect(option)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
