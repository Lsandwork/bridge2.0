export type RecommendationSource = "google_places" | "yelp" | "web" | "manual";

export type RecommendationItem = {
  name: string;
  source: RecommendationSource;
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
  /** Internal: how many providers matched this business */
  matchedSources?: number;
};

export type RecommendationSearchInput = {
  query: string;
  location?: string;
  category?: string;
  userNeeds?: string[];
  limit?: number;
};

export type RecommendationFallbackGuide = {
  searchTerms: string[];
  screeningChecklist: string[];
  questionsToAsk: string[];
  redFlags: string[];
  howToChoose: string[];
};

export type RecommendationSearchResult = {
  items: RecommendationItem[];
  sourcesUsed: RecommendationSource[];
  searchedAt: string;
  isFallback: boolean;
  fallbackGuide?: RecommendationFallbackGuide;
  locationUsed?: string;
  queryUsed?: string;
};
