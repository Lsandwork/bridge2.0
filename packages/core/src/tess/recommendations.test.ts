import { describe, expect, it } from "vitest";
import {
  buildSearchQuery,
  extractCategory,
  extractLocation,
  extractUserNeeds,
  isHealthcareRecommendation,
  isRecommendationRequest,
} from "./recommendations-intent";
import { rankRecommendations, scoreRecommendation } from "./recommendation-scoring";

describe("isRecommendationRequest", () => {
  it("detects dentist recommendation in Santa Monica", () => {
    expect(isRecommendationRequest("What is a good child dentist in Santa Monica, CA?")).toBe(true);
  });

  it("detects autism friendly haircut search", () => {
    expect(isRecommendationRequest("Find autism friendly haircut places near me")).toBe(true);
  });

  it("detects speech therapist query", () => {
    expect(isRecommendationRequest("Who is the best speech therapist near Santa Monica?")).toBe(true);
  });

  it("does not flag routine chat", () => {
    expect(isRecommendationRequest("I need a break please")).toBe(false);
  });
});

describe("extractLocation", () => {
  it("parses City, ST", () => {
    expect(extractLocation("good dentist in Santa Monica, CA")).toBe("Santa Monica, CA");
  });
});

describe("extractCategory", () => {
  it("finds pediatric dentist category", () => {
    expect(extractCategory("good child dentist in Santa Monica")).toBe("pediatric dentist");
  });
});

describe("extractUserNeeds", () => {
  it("finds child and sensory needs", () => {
    const needs = extractUserNeeds("autism friendly sensory dentist for my child");
    expect(needs).toContain("child");
    expect(needs).toContain("autism");
    expect(needs).toContain("sensory-friendly");
  });
});

describe("buildSearchQuery", () => {
  it("builds localized pediatric dentist query", () => {
    const q = buildSearchQuery("What is a good child dentist in Santa Monica, CA?");
    expect(q.toLowerCase()).toContain("pediatric");
    expect(q.toLowerCase()).toContain("dentist");
    expect(q).toContain("Santa Monica, CA");
  });
});

describe("isHealthcareRecommendation", () => {
  it("flags dentist as healthcare", () => {
    expect(isHealthcareRecommendation("pediatric dentist")).toBe(true);
  });
});

describe("scoreRecommendation", () => {
  it("ranks higher-rated items with more reviews", () => {
    const high = scoreRecommendation(
      { name: "A", source: "google_places", rating: 4.8, reviewCount: 200, reasons: ["pediatric dentist"] },
      "pediatric dentist Santa Monica",
      ["child"]
    );
    const low = scoreRecommendation(
      { name: "B", source: "google_places", rating: 3.5, reviewCount: 2, reasons: ["dentist"] },
      "pediatric dentist Santa Monica",
      ["child"]
    );
    expect(high).toBeGreaterThan(low);
  });

  it("boosts cross-source matches", () => {
    const merged = scoreRecommendation(
      {
        name: "Smile Kids",
        source: "google_places",
        rating: 4.6,
        reviewCount: 80,
        reasons: ["pediatric"],
        matchedSources: 2,
      },
      "child dentist Santa Monica",
      ["child"]
    );
    const single = scoreRecommendation(
      {
        name: "Smile Kids",
        source: "google_places",
        rating: 4.6,
        reviewCount: 80,
        reasons: ["pediatric"],
        matchedSources: 1,
      },
      "child dentist Santa Monica",
      ["child"]
    );
    expect(merged).toBeGreaterThan(single);
  });
});

describe("rankRecommendations", () => {
  it("returns top items by score", () => {
    const ranked = rankRecommendations(
      [
        { name: "Low", source: "yelp", rating: 3.2, reviewCount: 5, reasons: [] },
        { name: "High", source: "google_places", rating: 4.9, reviewCount: 150, reasons: ["pediatric dentist"] },
      ],
      "pediatric dentist Santa Monica CA",
      ["child"],
      1
    );
    expect(ranked[0]?.name).toBe("High");
  });
});

describe("recommendation response policy", () => {
  it("healthcare queries should trigger recommendation intent", () => {
    const msg = "What is good child dentist in Santa Monica, CA";
    expect(isRecommendationRequest(msg)).toBe(true);
    expect(isHealthcareRecommendation(extractCategory(msg), msg)).toBe(true);
    expect(extractLocation(msg)).toBe("Santa Monica, CA");
  });
});
