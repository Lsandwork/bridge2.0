import type { MoodColorKey, ScheduleColorKey } from "./bridgeDashboardTheme";

export type DashboardUser = {
  name: string;
  initial: string;
  stars: number;
  greeting: string;
  encouragement: string;
};

export type ScheduleStatus = "completed" | "current" | "upcoming";

export type ScheduleItem = {
  id: string;
  time: string;
  title: string;
  icon: string;
  status: ScheduleStatus;
  color: ScheduleColorKey;
};

export type MoodOption = {
  id: string;
  label: string;
  icon: string;
  color: MoodColorKey;
  value: string;
  labelKey: string;
};

export type FeatureCard = {
  id: string;
  title: string;
  description: string;
  icon: string;
  gradient: [string, string];
  href: string;
};

export type NavItem = {
  id: string;
  label: string;
  icon: string;
  href: string;
  labelKey: string;
  useTessIcon?: boolean;
};

export const defaultDashboardUser: DashboardUser = {
  name: "Nathan",
  initial: "N",
  stars: 11,
  greeting: "Good afternoon",
  encouragement: "You're doing great. One step at a time.",
};

export const scheduleItems: ScheduleItem[] = [
  {
    id: "morning",
    time: "8:00 AM",
    title: "Morning routine",
    icon: "☀️",
    status: "completed",
    color: "blue",
  },
  {
    id: "learning",
    time: "9:00 AM",
    title: "Learning time",
    icon: "📖",
    status: "current",
    color: "lavender",
  },
  {
    id: "snack",
    time: "11:00 AM",
    title: "Snack",
    icon: "🍎",
    status: "upcoming",
    color: "yellow",
  },
  {
    id: "break",
    time: "11:30 AM",
    title: "Break",
    icon: "🌿",
    status: "upcoming",
    color: "mint",
  },
  {
    id: "activity",
    time: "1:00 PM",
    title: "Activity time",
    icon: "🧩",
    status: "upcoming",
    color: "peach",
  },
];

export const moodOptions: MoodOption[] = [
  { id: "great", label: "Great", icon: "😄", color: "mint", value: "Great", labelKey: "home.mood.great" },
  { id: "good", label: "Good", icon: "🙂", color: "blue", value: "Good", labelKey: "home.mood.good" },
  { id: "okay", label: "Okay", icon: "😐", color: "yellow", value: "Okay", labelKey: "home.mood.okay" },
  { id: "hard", label: "Hard", icon: "🙁", color: "peach", value: "Hard", labelKey: "home.mood.hard" },
  {
    id: "overwhelmed",
    label: "Overwhelmed",
    icon: "😰",
    color: "lavender",
    value: "Overwhelmed",
    labelKey: "home.mood.overwhelmed",
  },
];

export const featureCards: FeatureCard[] = [
  {
    id: "communicate",
    title: "Communicate",
    description: "Share, ask, and connect in a way that's right for you.",
    icon: "💬",
    gradient: ["#A78BFA", "#C4B5FD"],
    href: "/my-space/communicate",
  },
  {
    id: "sensory",
    title: "Sensory",
    description: "Find what helps you feel calm and comfortable.",
    icon: "🌈",
    gradient: ["#67E8F9", "#99F6E4"],
    href: "/my-space/mood",
  },
];

export const navItems: NavItem[] = [
  { id: "home", label: "Home", icon: "🏠", href: "/my-space", labelKey: "myspace.home" },
  { id: "games", label: "Games", icon: "🎮", href: "/my-space/games", labelKey: "nav.games" },
  { id: "videos", label: "Videos", icon: "▶️", href: "/my-space/videos", labelKey: "myspace.videos" },
  { id: "rewards", label: "Rewards", icon: "🎁", href: "/my-space/rewards", labelKey: "nav.rewards" },
  { id: "talk", label: "Talk", icon: "💬", href: "/my-space/communicate", labelKey: "myspace.talk" },
  { id: "tess", label: "Nuvio", icon: "", href: "/my-space/tess/chat", labelKey: "myspace.tess", useTessIcon: true },
  { id: "mood", label: "Mood", icon: "😊", href: "/my-space/mood", labelKey: "myspace.mood" },
];

export function buildDashboardUser(
  name: string,
  stars: number,
  greeting: string
): DashboardUser {
  return {
    name,
    initial: name.trim().charAt(0).toUpperCase() || "B",
    stars,
    greeting,
    encouragement: defaultDashboardUser.encouragement,
  };
}
