import { NextResponse } from "next/server";
import {
  createLocalCommunicationCard,
  getCommunicationCards,
  getCommunicationCategories,
  resolveProfilesForSessionUser,
  userCanAccessProfile,
} from "@family-support/data";
import { getSession } from "@/lib/auth/session";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("childProfileId") ?? searchParams.get("profileId") ?? undefined;

    if (profileId && !(await userCanAccessProfile(session, profileId))) {
      return NextResponse.json({ error: "You do not have access to this profile." }, { status: 403 });
    }

    if (!profileId) {
      const profiles = await resolveProfilesForSessionUser(session);
      if (!profiles.length) {
        return NextResponse.json({ cards: [], categories: await getCommunicationCategories() });
      }
      const cards = await getCommunicationCards(profiles[0].id);
      const categories = await getCommunicationCategories();
      return NextResponse.json({ cards, categories });
    }

    const cards = await getCommunicationCards(profileId);
    const categories = await getCommunicationCategories();
    return NextResponse.json({ cards, categories });
  } catch {
    return NextResponse.json({ error: "Failed to load cards" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

    const body = await request.json();
    if (!body.phrase || !body.category) {
      return NextResponse.json({ error: "Phrase and category are required." }, { status: 400 });
    }

    const childProfileId = typeof body.childProfileId === "string" ? body.childProfileId : null;
    if (!childProfileId) {
      return NextResponse.json({ error: "Profile is required." }, { status: 400 });
    }
    if (!(await userCanAccessProfile(session, childProfileId))) {
      return NextResponse.json({ error: "You do not have access to this profile." }, { status: 403 });
    }

    const card = createLocalCommunicationCard({
      childProfileId,
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
