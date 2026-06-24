import type { ReactNode } from "react";

const icons: Record<string, ReactNode> = {
  "understanding-autism": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-7 w-7">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4l2.5 2.5" strokeLinecap="round" />
    </svg>
  ),
  "communication-support": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-7 w-7">
      <path d="M8 10h8M8 14h5" strokeLinecap="round" />
      <rect x="3" y="5" width="18" height="14" rx="3" />
    </svg>
  ),
  "daily-living-skills": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-7 w-7">
      <path d="M4 20V8l8-4 8 4v12" strokeLinejoin="round" />
      <path d="M9 20v-6h6v6" />
    </svg>
  ),
  "emotional-regulation": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-7 w-7">
      <path d="M12 21c4-3 7-6 7-10a7 7 0 10-14 0c0 4 3 7 7 10z" strokeLinejoin="round" />
    </svg>
  ),
  "sensory-support": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-7 w-7">
      <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  ),
  "behavior-support": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-7 w-7">
      <path d="M4 18V6l8-3 8 3v12l-8 3-8-3z" strokeLinejoin="round" />
      <path d="M12 9v6M9 12h6" strokeLinecap="round" />
    </svg>
  ),
  "social-stories": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-7 w-7">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" strokeLinecap="round" />
    </svg>
  ),
  "parent-coaching-plans": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-7 w-7">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 8h10M7 12h10M7 16h6" strokeLinecap="round" />
    </svg>
  ),
  "crisis-overload-support": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-7 w-7">
      <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
      <path d="M10.3 3.6L2.6 17.5A2 2 0 004.4 20h15.2a2 2 0 001.8-2.5L13.7 3.6a2 2 0 00-3.4 0z" strokeLinejoin="round" />
    </svg>
  ),
};

export function CourseIcon({ courseSlug }: { courseSlug: string }) {
  return <span className="text-brand">{icons[courseSlug] ?? icons["understanding-autism"]}</span>;
}
