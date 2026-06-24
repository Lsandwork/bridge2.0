import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildRecommendationContextBlock, searchRecommendations } from "./recommendations";

describe("searchRecommendations", () => {
  const env = process.env;

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    process.env = { ...env };
    process.env.TESS_RECOMMENDATIONS_ENABLED = "true";
    delete process.env.GOOGLE_PLACES_API_KEY;
    delete process.env.YELP_API_KEY;
  });

  afterEach(() => {
    process.env = env;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns fallback guide when APIs are not configured", async () => {
    const result = await searchRecommendations({
      query: "What is good child dentist in Santa Monica, CA",
    });

    expect(result.isFallback).toBe(true);
    expect(result.items).toHaveLength(0);
    expect(result.fallbackGuide?.searchTerms.length).toBeGreaterThan(0);
    expect(result.fallbackGuide?.questionsToAsk.some((q) => /sensory|autistic/i.test(q))).toBe(true);
    expect(result.locationUsed).toBe("Santa Monica, CA");
  });

  it("does not invent providers when APIs are missing", async () => {
    const result = await searchRecommendations({
      query: "Find autism friendly haircut places near me",
    });
    expect(result.items).toHaveLength(0);
    expect(result.isFallback).toBe(true);
    expect(result.locationUsed).toBeUndefined();
  });

  it("returns ranked items when Google Places returns results", async () => {
    process.env.GOOGLE_PLACES_API_KEY = "test-key";

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        places: [
          {
            displayName: { text: "Smile Kids Dental" },
            formattedAddress: "123 Main St, Santa Monica, CA",
            nationalPhoneNumber: "(310) 555-0100",
            websiteUri: "https://example.com",
            googleMapsUri: "https://maps.google.com/?q=smile",
            rating: 4.8,
            userRatingCount: 120,
            businessStatus: "OPERATIONAL",
            primaryTypeDisplayName: { text: "Pediatric dentist" },
          },
          {
            displayName: { text: "Coastal Pediatric Dentistry" },
            formattedAddress: "456 Ocean Ave, Santa Monica, CA",
            rating: 4.6,
            userRatingCount: 85,
            businessStatus: "OPERATIONAL",
            primaryTypeDisplayName: { text: "Dentist" },
          },
        ],
      }),
    } as Response);

    const result = await searchRecommendations({
      query: "What is good child dentist in Santa Monica, CA",
    });

    expect(result.isFallback).toBe(false);
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0]?.name).toBeTruthy();
    expect(result.sourcesUsed).toEqual(["google_places"]);
    expect(result.sourcesUsed).not.toContain("yelp");
    expect(result.items.some((i) => i.cautions?.some((c) => /verify licensing/i.test(c)))).toBe(true);
  });

  it("runs with Google Places only and no YELP_API_KEY", async () => {
    process.env.GOOGLE_PLACES_API_KEY = "test-key";
    expect(process.env.YELP_API_KEY).toBeUndefined();

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        places: [
          {
            displayName: { text: "Santa Monica Pediatric Dental" },
            formattedAddress: "789 Pico Blvd, Santa Monica, CA",
            rating: 4.7,
            userRatingCount: 95,
            businessStatus: "OPERATIONAL",
            primaryTypeDisplayName: { text: "Pediatric dentist" },
          },
        ],
      }),
    } as Response);

    const result = await searchRecommendations({
      query: "What is a good child dentist in Santa Monica, CA?",
    });

    expect(result.isFallback).toBe(false);
    expect(result.sourcesUsed).toEqual(["google_places"]);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe("buildRecommendationContextBlock", () => {
  it("instructs model not to invent businesses in fallback mode", () => {
    const block = buildRecommendationContextBlock({
      items: [],
      sourcesUsed: [],
      searchedAt: new Date().toISOString(),
      isFallback: true,
      fallbackGuide: {
        searchTerms: ["pediatric dentist Santa Monica, CA"],
        screeningChecklist: ["Confirm open"],
        questionsToAsk: ["Do you have experience with autistic children?"],
        redFlags: ["Dismissive staff"],
        howToChoose: ["Call three options"],
      },
      queryUsed: "child dentist Santa Monica",
    });

    expect(block).toMatch(/Do NOT invent business names/i);
    expect(block).toMatch(/sensory|autistic/i);
  });

  it("requires grounded results only when items exist", () => {
    const block = buildRecommendationContextBlock({
      items: [
        {
          name: "Smile Kids Dental",
          source: "google_places",
          rating: 4.8,
          reviewCount: 120,
          reasons: ["Pediatric dentist"],
        },
      ],
      sourcesUsed: ["google_places"],
      searchedAt: new Date().toISOString(),
      isFallback: false,
      queryUsed: "pediatric dentist Santa Monica CA",
      locationUsed: "Santa Monica, CA",
    });

    expect(block).toMatch(/use ONLY these results/i);
    expect(block).toMatch(/verify licensing/i);
    expect(block).toMatch(/Google Places results/i);
    expect(block).not.toMatch(/Yelp/i);
    expect(block).toContain("Smile Kids Dental");
  });
});
