"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import type { ScheduleItem } from "./dashboardMockData";
import { ScheduleTimelineItem } from "./ScheduleTimelineItem";

type Props = {
  items: ScheduleItem[];
  onViewSchedule?: () => void;
};

export function DailyScheduleCard({ items, onViewSchedule }: Props) {
  const { t } = useLanguage();

  return (
    <section className="bridge-card" aria-labelledby="daily-schedule-title">
      <div className="bridge-card__head">
        <h2 id="daily-schedule-title" className="bridge-card__title">
          <span aria-hidden>📅</span>
          {t("home.dailySchedule")}
        </h2>
        <Link
          href="/routines"
          className="bridge-card__link"
          onClick={onViewSchedule}
          aria-label={t("home.viewSchedule")}
        >
          {t("home.viewSchedule")} →
        </Link>
      </div>
      <div className="bridge-schedule-scroll" role="list">
        {items.map((item) => (
          <div key={item.id} role="listitem">
            <ScheduleTimelineItem item={item} />
          </div>
        ))}
      </div>
    </section>
  );
}
