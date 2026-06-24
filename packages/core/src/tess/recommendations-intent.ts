const RECOMMENDATION_PHRASES = [
  "recommend",
  "recommendation",
  "suggest",
  "best",
  "good",
  "top-rated",
  "top rated",
  "highly rated",
  "near me",
  "nearby",
  "close to",
  "around me",
  "in my area",
  "where should i",
  "what is a good",
  "what's a good",
  "find me",
  "who should i call",
  "looking for",
  "need a",
  "need an",
  "search for",
];

const CATEGORY_KEYWORDS = [
  "dentist",
  "doctor",
  "pediatric",
  "therapist",
  "speech therapist",
  "occupational therapist",
  "ot ",
  " ot",
  "aba",
  "psychologist",
  "psychiatrist",
  "clinic",
  "hospital",
  "restaurant",
  "activity",
  "activities",
  "program",
  "programs",
  "school",
  "daycare",
  "insurance",
  "haircut",
  "barber",
  "park",
  "playground",
  "provider",
  "service",
  "services",
  "business",
  "businesses",
  "resource",
  "resources",
  "support group",
  "support groups",
];

const HEALTHCARE_CATEGORIES = new Set([
  "dentist",
  "doctor",
  "pediatric",
  "therapist",
  "speech therapist",
  "occupational therapist",
  "aba",
  "psychologist",
  "psychiatrist",
  "clinic",
  "hospital",
  "insurance",
]);

const US_STATE_ABBR =
  /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z]{2})\b/;

const NEAR_LOCATION =
  /\b(?:in|near|around|close to|within)\s+([A-Za-z][A-Za-z\s.'-]{2,40}(?:,\s*[A-Z]{2})?)/i;

export function isRecommendationRequest(message: string): boolean {
  const lower = message.toLowerCase().trim();
  if (lower.length < 8) return false;

  const hasPhrase = RECOMMENDATION_PHRASES.some((p) => lower.includes(p));
  const hasCategory = CATEGORY_KEYWORDS.some((k) => lower.includes(k.trim()) || lower.includes(k));
  const hasLocationHint =
    lower.includes("near me") ||
    lower.includes("nearby") ||
    US_STATE_ABBR.test(message) ||
    NEAR_LOCATION.test(message);

  if (hasPhrase && (hasCategory || hasLocationHint)) return true;
  if (hasCategory && hasLocationHint) return true;

  const questionPatterns = [
    /what(?:'s| is) a good .+/i,
    /who(?:'s| is) the best .+/i,
    /find (?:me )?(?:a|an|some) .+/i,
    /can you recommend .+/i,
    /any good .+ (?:in|near|around)/i,
  ];
  return questionPatterns.some((p) => p.test(message));
}

export function extractLocation(message: string): string | undefined {
  const stateMatch = message.match(US_STATE_ABBR);
  if (stateMatch) return `${stateMatch[1]}, ${stateMatch[2]}`;

  const nearMatch = message.match(NEAR_LOCATION);
  if (nearMatch?.[1]) {
    const loc = nearMatch[1].trim().replace(/\?+$/, "");
    if (!/^(me|here|my area|town)$/i.test(loc)) return loc;
  }

  if (/\bnear me\b|\bnearby\b|\baround me\b/i.test(message)) {
    return undefined;
  }

  return undefined;
}

export function extractCategory(message: string): string | undefined {
  const lower = message.toLowerCase();
  const ordered = [
    ["pediatric dentist", "pediatric dentist"],
    ["child dentist", "pediatric dentist"],
    ["kids dentist", "pediatric dentist"],
    ["speech therapist", "speech therapist"],
    ["occupational therapist", "occupational therapist"],
    ["autism friendly", "autism friendly"],
    ["sensory friendly", "sensory friendly"],
    ["haircut", "haircut"],
    ["barber", "haircut"],
    ["aba", "ABA therapy"],
    ["dentist", "dentist"],
    ["doctor", "doctor"],
    ["pediatric", "pediatric"],
    ["therapist", "therapist"],
    ["psychologist", "psychologist"],
    ["psychiatrist", "psychiatrist"],
    ["restaurant", "restaurant"],
    ["daycare", "daycare"],
    ["school", "school"],
    ["clinic", "clinic"],
    ["insurance", "insurance"],
    ["park", "park"],
    ["playground", "playground"],
    ["activity", "activity"],
    ["program", "program"],
  ] as const;

  for (const [needle, category] of ordered) {
    if (lower.includes(needle)) return category;
  }
  return undefined;
}

export function extractUserNeeds(message: string): string[] {
  const lower = message.toLowerCase();
  const needs: string[] = [];
  if (/\b(child|children|kid|kids|pediatric|toddler|teen)\b/.test(lower)) needs.push("child");
  if (/\b(autis\w*|asd|neurodiverg\w*)\b/.test(lower)) needs.push("autism");
  if (/\b(sensory|sensory-friendly|sensory friendly)\b/.test(lower)) needs.push("sensory-friendly");
  if (/\b(anxious|anxiety|nervous|scared)\b/.test(lower)) needs.push("anxiety");
  if (/\b(insurance|medi-cal|medicaid|covered)\b/.test(lower)) needs.push("insurance");
  if (/\b(wheelchair|accessible|accessibility|ada)\b/.test(lower)) needs.push("accessibility");
  return needs;
}

export function isHealthcareRecommendation(category?: string, message?: string): boolean {
  const lower = (category ?? message ?? "").toLowerCase();
  return [...HEALTHCARE_CATEGORIES].some((k) => lower.includes(k));
}

export function buildSearchQuery(message: string, location?: string, category?: string): string {
  const cat = category ?? extractCategory(message) ?? message.replace(/\?+$/, "").trim();
  const loc = location ?? extractLocation(message);
  const needs = extractUserNeeds(message);

  const modifiers: string[] = [];
  if (needs.includes("child") || needs.includes("pediatric")) modifiers.push("pediatric");
  if (needs.includes("sensory-friendly")) modifiers.push("sensory friendly");
  if (needs.includes("autism")) modifiers.push("autism friendly");

  const base = [modifiers.join(" "), cat].filter(Boolean).join(" ").trim();
  if (loc) return `${base} ${loc}`.trim();
  return base || message.trim();
}
