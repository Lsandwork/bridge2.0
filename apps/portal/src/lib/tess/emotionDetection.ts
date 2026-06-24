/**
 * Emotion-aware support flow — detect when a gentle dance break may help.
 * Safety concerns take priority over dance prompts.
 */

const DANCE_TRIGGERS = [
  /\bfeel(ing)?\s+(down|sad|low|bad|awful|terrible|horrible|rough|blue)\b/i,
  /\b(i'?m|i am)\s+(sad|upset|stressed|anxious|overwhelmed|frustrated|lonely|tired|exhausted|burned?\s*out|dysregulated|overloaded)\b/i,
  /\b(so|really|very)\s+(sad|stressed|anxious|overwhelmed|upset|frustrated)\b/i,
  /\brough\s+day\b/i,
  /\bhard\s+day\b/i,
  /\bcan'?t\s+cope\b/i,
  /\btoo\s+much\b/i,
  /\bneed\s+a\s+break\b/i,
  /\bfeeling\s+overwhelmed\b/i,
  /\bemotionally\s+(tired|drained|spent)\b/i,
];

const SAFETY_CONCERNS = [
  /\b(kill|hurt)\s+(myself|me)\b/i,
  /\b(want|going)\s+to\s+die\b/i,
  /\bsuicid(e|al)\b/i,
  /\bself[- ]?harm\b/i,
  /\b(end|take)\s+my\s+life\b/i,
  /\b(don'?t|do not)\s+want\s+to\s+live\b/i,
  /\babus(e|ed|ing)\b/i,
  /\bbeing\s+unsafe\b/i,
  /\b(emergency|911|999)\b/i,
  /\b(can'?t|cannot)\s+breathe\b/i,
  /\bheart\s+attack\b/i,
  /\bsevere\s+pain\b/i,
  /\bunconscious\b/i,
];

export function detectSupportiveDanceTrigger(text: string): boolean {
  const normalized = text.trim();
  if (!normalized) return false;
  return DANCE_TRIGGERS.some((pattern) => pattern.test(normalized));
}

export function detectEmergencySafetyConcern(text: string): boolean {
  const normalized = text.trim();
  if (!normalized) return false;
  return SAFETY_CONCERNS.some((pattern) => pattern.test(normalized));
}

export function detectFeelingBetter(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  if (!normalized) return false;
  return (
    /\bi'?m\s+good\b/.test(normalized) ||
    /\bfeel(ing)?\s+better\b/.test(normalized) ||
    /\bi'?m\s+ok(ay)?\b/.test(normalized) ||
    /\bthat\s+helped\b/.test(normalized) ||
    /\bstop\s+danc(e|ing)\b/.test(normalized)
  );
}
