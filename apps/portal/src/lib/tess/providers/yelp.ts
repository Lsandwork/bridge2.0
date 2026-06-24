import type { RecommendationItem } from "../recommendations-types";
import { normalizeBusinessKey } from "./googlePlaces";

type YelpBusiness = {
  id: string;
  name: string;
  rating?: number;
  review_count?: number;
  display_phone?: string;
  url?: string;
  categories?: { title: string }[];
  location?: { display_address?: string[] };
};

type YelpReview = {
  text: string;
  rating: number;
};

async function fetchYelpReviews(businessId: string, apiKey: string): Promise<string[]> {
  try {
    const res = await fetch(`https://api.yelp.com/v3/businesses/${encodeURIComponent(businessId)}/reviews`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { reviews?: YelpReview[] };
    return (data.reviews ?? [])
      .slice(0, 3)
      .map((r) => r.text.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function mapBusiness(b: YelpBusiness, snippets: string[]): RecommendationItem {
  const reasons: string[] = [];
  if (b.rating != null && b.review_count != null) {
    reasons.push(`Yelp rating ${b.rating.toFixed(1)} from ${b.review_count} reviews`);
  }
  if (snippets[0]) {
    reasons.push(`Review highlight: "${snippets[0].slice(0, 120)}${snippets[0].length > 120 ? "…" : ""}"`);
  }

  return {
    name: b.name,
    source: "yelp",
    rating: b.rating,
    reviewCount: b.review_count,
    address: b.location?.display_address?.join(", "),
    phone: b.display_phone,
    yelpUrl: b.url,
    website: b.url,
    categories: b.categories?.map((c) => c.title),
    reviewSnippets: snippets,
    reasons,
    matchedSources: 1,
  };
}

export async function searchYelp(term: string, location: string): Promise<RecommendationItem[]> {
  const apiKey = process.env.YELP_API_KEY?.trim();
  if (!apiKey) return [];

  try {
    const params = new URLSearchParams({
      term,
      location,
      limit: "10",
      sort_by: "rating",
    });

    const res = await fetch(`https://api.yelp.com/v3/businesses/search?${params}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      console.error("Yelp search failed:", res.status);
      return [];
    }

    const data = (await res.json()) as { businesses?: YelpBusiness[] };
    const businesses = data.businesses ?? [];

    const items: RecommendationItem[] = [];
    for (const b of businesses.slice(0, 8)) {
      const snippets = await fetchYelpReviews(b.id, apiKey);
      items.push(mapBusiness(b, snippets));
    }

    return items.filter((item) => (item.rating ?? 0) >= 3 || (item.reviewCount ?? 0) < 5);
  } catch (error) {
    console.error("Yelp search error:", error instanceof Error ? error.message : error);
    return [];
  }
}

export function mergeRecommendationItems(
  googleItems: RecommendationItem[],
  yelpItems: RecommendationItem[]
): RecommendationItem[] {
  const merged = new Map<string, RecommendationItem>();

  for (const item of googleItems) {
    merged.set(normalizeBusinessKey(item.name), { ...item });
  }

  for (const yelp of yelpItems) {
    const key = normalizeBusinessKey(yelp.name);
    const existing = merged.get(key);
    if (existing) {
      merged.set(key, {
        ...existing,
        source: existing.source,
        rating: existing.rating ?? yelp.rating,
        reviewCount: Math.max(existing.reviewCount ?? 0, yelp.reviewCount ?? 0),
        phone: existing.phone ?? yelp.phone,
        website: existing.website ?? yelp.website,
        yelpUrl: yelp.yelpUrl,
        categories: [...new Set([...(existing.categories ?? []), ...(yelp.categories ?? [])])],
        reviewSnippets: [...(existing.reviewSnippets ?? []), ...(yelp.reviewSnippets ?? [])].slice(0, 3),
        reasons: [...existing.reasons, ...yelp.reasons.filter((r) => !existing.reasons.includes(r))],
        matchedSources: 2,
      });
    } else {
      merged.set(key, { ...yelp });
    }
  }

  return [...merged.values()];
}
