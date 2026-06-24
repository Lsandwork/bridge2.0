import { NextRequest, NextResponse } from "next/server";
import { extractLocation, extractUserNeeds, isRecommendationRequest } from "@family-support/core";
import { getTessSession } from "@/lib/tess/session";
import { searchRecommendations } from "@/lib/tess/recommendations";

export async function POST(req: NextRequest) {
  try {
    getTessSession(req.headers);
    const body = (await req.json()) as {
      query?: string;
      location?: string;
      userNeeds?: string[];
      limit?: number;
    };

    const query = body.query?.trim();
    if (!query) {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    const result = await searchRecommendations({
      query,
      location: body.location ?? extractLocation(query),
      userNeeds: body.userNeeds ?? extractUserNeeds(query),
      limit: body.limit,
    });

    return NextResponse.json({
      items: result.items,
      sourcesUsed: result.sourcesUsed,
      searchedAt: result.searchedAt,
      isFallback: result.isFallback,
      fallbackGuide: result.fallbackGuide,
      locationUsed: result.locationUsed,
      queryUsed: result.queryUsed,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Recommendation search failed" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.trim();
  if (!query) {
    return NextResponse.json({ error: "q query parameter required" }, { status: 400 });
  }
  if (!isRecommendationRequest(query)) {
    return NextResponse.json({ isRecommendationRequest: false, items: [] });
  }
  const result = await searchRecommendations({ query });
  return NextResponse.json({
    isRecommendationRequest: true,
    items: result.items,
    sourcesUsed: result.sourcesUsed,
    searchedAt: result.searchedAt,
    isFallback: result.isFallback,
  });
}
