import { scheduleColorStyles } from "./bridgeDashboardTheme";
import type { ScheduleItem } from "./dashboardMockData";

type Props = {
  item: ScheduleItem;
};

export function ScheduleTimelineItem({ item }: Props) {
  const colors = scheduleColorStyles[item.color];

  return (
    <div
      className={`bridge-schedule-item ${item.status === "current" ? "bridge-schedule-item--current" : ""}`}
      aria-label={`${item.time}, ${item.title}, ${item.status}`}
    >
      <span className="bridge-schedule-item__time">{item.time}</span>
      <div
        className="bridge-schedule-item__icon-wrap"
        style={{ background: colors.bg, borderColor: colors.border }}
      >
        <span aria-hidden>{item.icon}</span>
      </div>
      <span className="bridge-schedule-item__title">{item.title}</span>
      <span
        className={`bridge-schedule-item__status ${
          item.status === "completed"
            ? "bridge-schedule-item__status--done"
            : item.status === "current"
              ? "bridge-schedule-item__status--current"
              : "bridge-schedule-item__status--upcoming"
        }`}
        aria-hidden
      >
        {item.status === "completed" ? "✓" : item.status === "current" ? "●" : ""}
      </span>
    </div>
  );
}
