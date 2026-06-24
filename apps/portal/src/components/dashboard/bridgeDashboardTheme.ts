export const bridgeDashboardColors = {
  background: "#FAF8F5",
  surface: "#FFFFFF",
  textPrimary: "#17233C",
  textSecondary: "#66748A",
  lavender: "#A78BFA",
  softLavender: "#F0EAFF",
  blue: "#6EA8FE",
  softBlue: "#EAF4FF",
  mint: "#8DDCC6",
  softMint: "#EAFBF5",
  peach: "#FFB99A",
  softPeach: "#FFF0E8",
  yellow: "#FFD66B",
  softYellow: "#FFF7D7",
  border: "#E8E4DD",
} as const;

export type ScheduleColorKey = "blue" | "lavender" | "yellow" | "mint" | "peach";
export type MoodColorKey = ScheduleColorKey;

export const scheduleColorStyles: Record<
  ScheduleColorKey,
  { bg: string; border: string; icon: string }
> = {
  blue: { bg: bridgeDashboardColors.softBlue, border: "#C5DCFF", icon: bridgeDashboardColors.blue },
  lavender: {
    bg: bridgeDashboardColors.softLavender,
    border: "#DDD6FE",
    icon: bridgeDashboardColors.lavender,
  },
  yellow: { bg: bridgeDashboardColors.softYellow, border: "#FFEAA0", icon: "#EAB308" },
  mint: { bg: bridgeDashboardColors.softMint, border: "#B8F0DE", icon: bridgeDashboardColors.mint },
  peach: { bg: bridgeDashboardColors.softPeach, border: "#FFD4C2", icon: bridgeDashboardColors.peach },
};

export const moodColorStyles: Record<MoodColorKey, { bg: string; border: string }> = {
  mint: { bg: bridgeDashboardColors.softMint, border: "#B8F0DE" },
  blue: { bg: bridgeDashboardColors.softBlue, border: "#C5DCFF" },
  yellow: { bg: bridgeDashboardColors.softYellow, border: "#FFEAA0" },
  peach: { bg: bridgeDashboardColors.softPeach, border: "#FFD4C2" },
  lavender: { bg: bridgeDashboardColors.softLavender, border: "#DDD6FE" },
};

export const dashboardShadow = "0 8px 32px rgba(23, 35, 60, 0.06)";
export const dashboardRadius = "1.75rem";
