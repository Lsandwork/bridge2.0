import type { SupportPathwayId } from "@/lib/support-pathways";

export const ONBOARDING_INTAKE_KEY = "bridge-onboarding-intake";

export type OnboardingSetupRole = "self" | "family" | "professional";

export type OnboardingIntake = {
  pathwayId: SupportPathwayId;
  setupRole: OnboardingSetupRole;
  safetyAcceptedAt: string;
};

export function readOnboardingIntake(): OnboardingIntake | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ONBOARDING_INTAKE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OnboardingIntake;
  } catch {
    return null;
  }
}

export function writeOnboardingIntake(intake: OnboardingIntake): void {
  window.localStorage.setItem(ONBOARDING_INTAKE_KEY, JSON.stringify(intake));
}

export function clearOnboardingIntake(): void {
  window.localStorage.removeItem(ONBOARDING_INTAKE_KEY);
}
