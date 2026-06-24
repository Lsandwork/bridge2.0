export type ScorableRecommendation = {
  name: string;
  source: "google_places" | "yelp" | "web" | "manual";
  rating?: number;
  reviewCount?: number;
  address?: string;
  phone?: string;
  website?: string;
  mapsUrl?: string;
  yelpUrl?: string;
  categories?: string[];
  reviewSnippets?: string[];
  reasons: string[];
  cautions?: string[];
  matchedSources?: number;
};

export function scoreRecommendation(
  item: ScorableRecommendation,
  userQuery: string,
  userNeeds: string[] = []
): number {
  const query = userQuery.toLowerCase();
  let score = 0;

  if (item.rating != null) score += item.rating * 20;
  if (item.reviewCount != null) {
    score += Math.min(20, Math.log10(item.reviewCount + 1) * 10);
    if (item.reviewCount < 3 && (item.rating ?? 0) >= 4.5) score -= 8;
  }

  const haystack = [
    item.name,
    ...(item.categories ?? []),
    ...(item.reviewSnippets ?? []),
    ...(item.reasons ?? []),
  ]
    .join(" ")
    .toLowerCase();

  const keywords = query.split(/\s+/).filter((w) => w.length > 3);
  let relevance = 0;
  for (const word of keywords) {
    if (haystack.includes(word)) relevance += 3;
  }
  score += Math.min(30, relevance);

  if (/\b(pediatric|child|kid|family)\b/.test(haystack) && /\b(child|pediatric|kid|dentist|doctor)\b/.test(query)) {
    score += 8;
  }
  if (userNeeds.includes("autism") && /\bautis\w*|asd|special needs|neurodiverg\w*/i.test(haystack)) score += 10;
  if (userNeeds.includes("sensory-friendly") && /\bsensory|quiet|calm|gentle/i.test(haystack)) score += 8;

  if (item.website) score += 3;
  if (item.phone) score += 3;
  if (item.mapsUrl || item.address) score += 2;
  if ((item.matchedSources ?? 1) > 1) score += 12;

  return score;
}

export function rankRecommendations<T extends ScorableRecommendation>(
  items: T[],
  userQuery: string,
  userNeeds: string[] = [],
  limit = 5
): T[] {
  return [...items]
    .map((item) => ({ item, score: scoreRecommendation(item, userQuery, userNeeds) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item);
}
