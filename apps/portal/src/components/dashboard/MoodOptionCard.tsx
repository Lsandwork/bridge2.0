import { moodColorStyles } from "./bridgeDashboardTheme";
import type { MoodOption } from "./dashboardMockData";

type Props = {
  option: MoodOption;
  label: string;
  selected: boolean;
  onSelect: () => void;
};

export function MoodOptionCard({ option, label, selected, onSelect }: Props) {
  const colors = moodColorStyles[option.color];

  return (
    <button
      type="button"
      className={`bridge-mood-option ${selected ? "bridge-mood-option--selected" : ""}`}
      style={{ background: colors.bg, borderColor: selected ? undefined : colors.border }}
      aria-pressed={selected}
      aria-label={label}
      onClick={onSelect}
    >
      <span className="bridge-mood-option__emoji" aria-hidden>
        {option.icon}
      </span>
      <span>{label}</span>
    </button>
  );
}
