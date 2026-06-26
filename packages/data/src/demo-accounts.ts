/** Known investor demo accounts — any @demo.com email is treated as demo. */
export const DEMO_ACCOUNT_EMAILS = new Set([
  "caregiver@demo.com",
  "casemanager@demo.com",
  "user@demo.com",
]);

export const DEMO_ACCOUNT_IDS = new Set([
  "u-demo-caregiver",
  "u-demo-casemanager",
  "u-demo-user",
]);

/** Investor demo child profile — isolated from legacy cp1/cp2 seed rows. */
export const DEMO_PROFILE_IDS = new Set(["cp-demo-jasper"]);

/** Legacy Nathan/Sam profiles — never exposed to real Supabase users. */
export const LEGACY_DEMO_PROFILE_IDS = new Set(["cp1", "cp2"]);

/** @deprecated Legacy local demo auth IDs — no longer used for login. */
export const LEGACY_DEMO_ACCOUNT_IDS = new Set(["u-parent", "u-therapist", "u-child", "u-admin"]);

export const DEMO_PASSWORD = "password123";

export function isDemoAccountEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith("@demo.com");
}

export function isDemoAccountId(userId: string): boolean {
  return DEMO_ACCOUNT_IDS.has(userId);
}

export function isLegacyDemoProfile(profileId: string): boolean {
  return LEGACY_DEMO_PROFILE_IDS.has(profileId);
}

export function shouldSeeLegacyDemoData(_userId: string): boolean {
  return false;
}

export function shouldSeeInvestorDemoData(userId: string): boolean {
  return DEMO_ACCOUNT_IDS.has(userId);
}
