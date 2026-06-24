import type { RecommendationItem } from "../recommendations-types";

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.nationalPhoneNumber",
  "places.websiteUri",
  "places.googleMapsUri",
  "places.rating",
  "places.userRatingCount",
  "places.businessStatus",
  "places.primaryTypeDisplayName",
  "places.types",
].join(",");

type GooglePlace = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  googleMapsUri?: string;
  rating?: number;
  userRatingCount?: number;
  businessStatus?: string;
  primaryTypeDisplayName?: { text?: string };
  types?: string[];
};

function normalizeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function normalizeBusinessKey(name: string) {
  return normalizeName(name);
}

function mapPlace(place: GooglePlace): RecommendationItem | null {
  const name = place.displayName?.text?.trim();
  if (!name) return null;
  if (place.businessStatus && place.businessStatus !== "OPERATIONAL") return null;

  const categories = [
    place.primaryTypeDisplayName?.text,
    ...(place.types ?? []).slice(0, 3).map((t) => t.replace(/_/g, " ")),
  ].filter(Boolean) as string[];

  const reasons: string[] = [];
  if (place.rating != null && place.userRatingCount != null) {
    reasons.push(`Google rating ${place.rating.toFixed(1)} from ${place.userRatingCount} reviews`);
  }
  if (place.primaryTypeDisplayName?.text) {
    reasons.push(`Listed as ${place.primaryTypeDisplayName.text}`);
  }

  return {
    name,
    source: "google_places",
    rating: place.rating,
    reviewCount: place.userRatingCount,
    address: place.formattedAddress,
    phone: place.nationalPhoneNumber,
    website: place.websiteUri,
    mapsUrl: place.googleMapsUri,
    categories,
    reasons,
    matchedSources: 1,
  };
}

export async function searchGooglePlaces(textQuery: string): Promise<RecommendationItem[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!apiKey) return [];

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify({
      textQuery,
      maxResultCount: 10,
      languageCode: "en",
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error("Google Places search failed:", res.status, errText.slice(0, 200));
    return [];
  }

  const data = (await res.json()) as { places?: GooglePlace[] };
  return (data.places ?? [])
    .map(mapPlace)
    .filter((item): item is RecommendationItem => item != null)
    .filter((item) => {
      if ((item.rating ?? 0) < 3.2 && (item.reviewCount ?? 0) >= 5) return false;
      return true;
    });
}

export { normalizeName };
