/** Production investor/presentation demo accounts — isolated from legacy Nathan/Sam seed data. */
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

/** Legacy seeded demo — only visible to these account IDs. */
export const LEGACY_DEMO_ACCOUNT_IDS = new Set(["u-parent", "u-therapist", "u-child", "u-admin"]);

export const DEMO_PROFILE_IDS = new Set(["cp-demo-jasper"]);

/** Legacy Nathan/Sam profiles — never shown to production (non-demo) users. */
export const LEGACY_DEMO_PROFILE_IDS = new Set(["cp1", "cp2"]);

export function isDemoAccountEmail(email: string): boolean {
  return DEMO_ACCOUNT_EMAILS.has(email.trim().toLowerCase());
}

export function isDemoAccountId(userId: string): boolean {
  return DEMO_ACCOUNT_IDS.has(userId) || LEGACY_DEMO_ACCOUNT_IDS.has(userId);
}

export function isLegacyDemoProfile(profileId: string): boolean {
  return LEGACY_DEMO_PROFILE_IDS.has(profileId);
}

export function shouldSeeLegacyDemoData(userId: string): boolean {
  return LEGACY_DEMO_ACCOUNT_IDS.has(userId);
}

export function shouldSeeInvestorDemoData(userId: string): boolean {
  return DEMO_ACCOUNT_IDS.has(userId);
}
