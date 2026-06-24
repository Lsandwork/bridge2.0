import {
  buildSearchQuery,
  extractCategory,
  extractLocation,
  extractUserNeeds,
  isHealthcareRecommendation,
  rankRecommendations,
} from "@family-support/core";
import type {
  RecommendationFallbackGuide,
  RecommendationItem,
  RecommendationSearchInput,
  RecommendationSearchResult,
  RecommendationSource,
} from "./recommendations-types";
import { searchGooglePlaces } from "./providers/googlePlaces";
import { mergeRecommendationItems, searchYelp } from "./providers/yelp";

function recommendationsEnabled() {
  return process.env.TESS_RECOMMENDATIONS_ENABLED !== "false";
}

function maxResults() {
  const n = Number(process.env.TESS_RECOMMENDATION_MAX_RESULTS ?? 5);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 10) : 5;
}

function sourceAttributionForPrompt(sourcesUsed: RecommendationSource[]): string {
  if (sourcesUsed.length === 1 && sourcesUsed[0] === "google_places") {
    return 'Open with options worth checking based on Google Places results. Do not mention other review sites or platforms.';
  }
  if (sourcesUsed.includes("google_places") && sourcesUsed.includes("yelp")) {
    return "Open noting recommendations combine Google Places and Yelp data where available.";
  }
  return `Attribute results to: ${sourcesUsed.join(", ") || "available sources"}.`;
}

function buildFallbackGuide(
  query: string,
  location?: string,
  category?: string,
  userNeeds: string[] = []
): RecommendationFallbackGuide {
  const loc = location ?? "your area";
  const cat = category ?? "provider";
  const modifiers: string[] = [];
  if (userNeeds.includes("child")) modifiers.push("pediatric");
  if (userNeeds.includes("autism")) modifiers.push("autism friendly");
  if (userNeeds.includes("sensory-friendly")) modifiers.push("sensory friendly");

  const searchTerms = [
    `${modifiers.join(" ")} ${cat} ${loc}`.trim(),
    `${cat} reviews ${loc}`.trim(),
    userNeeds.includes("autism") ? `autism friendly ${cat} ${loc}`.trim() : "",
    userNeeds.includes("sensory-friendly") ? `sensory friendly ${cat} ${loc}`.trim() : "",
  ].filter(Boolean);

  const isHealthcare = isHealthcareRecommendation(category, query);

  return {
    searchTerms,
    screeningChecklist: [
      "Confirm the business is open and accepting new patients or clients.",
      "Check recent Google reviews from the last 12 months.",
      "Verify they serve your child's age group.",
      isHealthcare ? "Confirm active licensing with your state dental/medical board." : "Confirm services match what you need.",
      "Ask about accessibility, wait times, and cancellation policy.",
    ],
    questionsToAsk: [
      "Do you have experience with autistic children or children with sensory sensitivities?",
      "Can we schedule a quiet first visit or tour before the appointment?",
      "Do you allow breaks, headphones, comfort items, or parent support during the visit?",
      "Do you accept my insurance? What will I owe out of pocket?",
      "What happens if my child becomes overwhelmed during the visit?",
      isHealthcare ? "Are you licensed and in good standing? Can you share your NPI or license number?" : "What should we bring to the first visit?",
    ],
    redFlags: [
      "Pressure to commit before you can ask questions.",
      "No clear answer about experience with anxious or sensory-sensitive children.",
      "Dismissive attitude toward accommodations or parent presence.",
      "Reviews mentioning rushed visits, poor communication, or billing surprises.",
    ],
    howToChoose: [
      "Shortlist 3 options and call each — comfort on the phone often predicts the visit experience.",
      "Prefer places that offer tours, gradual desensitization, or flexible pacing when sensory needs matter.",
      "Match insurance and location, but prioritize staff who listen and explain clearly.",
      "Trust your child's reaction after a first visit — fit matters more than star ratings alone.",
    ],
  };
}

export function buildRecommendationContextBlock(result: RecommendationSearchResult): string {
  if (result.isFallback && result.fallbackGuide) {
    const g = result.fallbackGuide;
    return `
LIVE LOCAL SEARCH: Not connected — use fallback guidance only. Do NOT invent business names.

Search terms to suggest:
${g.searchTerms.map((t) => `- ${t}`).join("\n")}

Screening checklist:
${g.screeningChecklist.map((t) => `- ${t}`).join("\n")}

Questions to ask when calling:
${g.questionsToAsk.map((t) => `- ${t}`).join("\n")}

Red flags:
${g.redFlags.map((t) => `- ${t}`).join("\n")}

How to choose:
${g.howToChoose.map((t) => `- ${t}`).join("\n")}

Tell the user Google Places search is not connected yet, then provide the above guidance without making up names.
`.trim();
  }

  if (result.items.length === 0) {
    return `
LIVE LOCAL SEARCH: No results returned for "${result.queryUsed ?? "query"}". Do NOT invent businesses.
Provide search terms, screening checklist, questions to ask, red flags, and how to choose — without fake names.
`.trim();
  }

  return `
GROUNDED LOCAL RECOMMENDATIONS — use ONLY these results. Do not invent businesses, ratings, phones, websites, or review quotes.

Sources: ${result.sourcesUsed.join(", ")}
Searched at: ${result.searchedAt}
Query: ${result.queryUsed}
Location: ${result.locationUsed ?? "unspecified"}

Results JSON:
${JSON.stringify(result.items, null, 2)}

Response rules:
- ${sourceAttributionForPrompt(result.sourcesUsed)}
- List 3–5 options with name, why it may fit, rating/review count when available, and address/phone/website/maps when available.
- Do NOT claim autism-specialized unless review snippets or categories support it.
- End with "Best questions to ask when you call" including sensory/insurance questions.
${
  isHealthcareRecommendation(extractCategory(result.queryUsed ?? ""), result.queryUsed)
    ? '- Include: "Please verify licensing, insurance coverage, availability, and whether they are the right fit for your child\'s needs."'
    : ""
}
`.trim();
}

export async function searchRecommendations(
  input: RecommendationSearchInput
): Promise<RecommendationSearchResult> {
  const searchedAt = new Date().toISOString();
  const limit = input.limit ?? maxResults();
  const userNeeds = input.userNeeds ?? extractUserNeeds(input.query);
  const category = input.category ?? extractCategory(input.query);
  const location = input.location ?? extractLocation(input.query);
  const queryUsed = buildSearchQuery(input.query, location, category);

  if (!recommendationsEnabled()) {
    return {
      items: [],
      sourcesUsed: [],
      searchedAt,
      isFallback: true,
      fallbackGuide: buildFallbackGuide(input.query, location, category, userNeeds),
      locationUsed: location,
      queryUsed,
    };
  }

  const hasGoogle = Boolean(process.env.GOOGLE_PLACES_API_KEY?.trim());

  if (!hasGoogle) {
    return {
      items: [],
      sourcesUsed: [],
      searchedAt,
      isFallback: true,
      fallbackGuide: buildFallbackGuide(input.query, location, category, userNeeds),
      locationUsed: location,
      queryUsed,
    };
  }

  const sourcesUsed: RecommendationSource[] = [];
  const googleItems = await searchGooglePlaces(queryUsed);
  if (googleItems.length) sourcesUsed.push("google_places");

  const hasYelp = Boolean(process.env.YELP_API_KEY?.trim());
  let yelpItems: RecommendationItem[] = [];
  if (hasYelp && location) {
    try {
      yelpItems = await searchYelp(category ?? input.query, location);
      if (yelpItems.length) sourcesUsed.push("yelp");
    } catch {
      // Yelp is optional enrichment — never block Google-only results
    }
  }

  const merged =
    yelpItems.length > 0 ? mergeRecommendationItems(googleItems, yelpItems) : googleItems;
  const ranked = rankRecommendations(merged, input.query, userNeeds, limit);

  if (ranked.length === 0) {
    return {
      items: [],
      sourcesUsed,
      searchedAt,
      isFallback: true,
      fallbackGuide: buildFallbackGuide(input.query, location, category, userNeeds),
      locationUsed: location,
      queryUsed,
    };
  }

  const healthcare = isHealthcareRecommendation(category, input.query);
  const withCautions = ranked.map((item) => ({
    ...item,
    cautions: healthcare
      ? [
          ...(item.cautions ?? []),
          "Please verify licensing, insurance coverage, availability, and whether they are the right fit for your child's needs.",
        ]
      : item.cautions,
  }));

  return {
    items: withCautions,
    sourcesUsed,
    searchedAt,
    isFallback: false,
    locationUsed: location,
    queryUsed,
  };
}
