import { NextResponse } from "next/server";
import { createLocalCommunicationCard, getCommunicationCards, getCommunicationCategories } from "@family-support/data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId") ?? undefined;
    const cards = await getCommunicationCards(profileId);
    const categories = await getCommunicationCategories();
    return NextResponse.json({ cards, categories });
  } catch {
    return NextResponse.json({ error: "Failed to load cards" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.phrase || !body.category) {
      return NextResponse.json({ error: "Phrase and category are required." }, { status: 400 });
    }
    const card = createLocalCommunicationCard({
      childProfileId: body.childProfileId ?? "cp1",
      category: body.category,
      phrase: body.phrase,
      isFavorite: Boolean(body.isFavorite),
    });
    return NextResponse.json(card, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create card" },
      { status: 500 }
    );
  }
}
