import { NextResponse } from "next/server";
import {
  companionFanGearItems,
  fanGearCollections,
  getCompanionPetState,
  listSportsPartners,
  unlockEligiblePetItems,
  updateCompanionPet,
  type PetItem,
} from "@family-support/data";
import { getSession } from "@/lib/auth/session";

function isFanGear(item: PetItem) {
  return item.theme === "fan_gear" || item.unlockRule?.collection === "fan_gear";
}

function slotForItem(item: PetItem) {
  const slot = item.assetConfig?.slot;
  return typeof slot === "string" ? slot : item.itemType;
}

function isUnlocked(item: PetItem, unlockedIds: Set<string>, xp: number, level: number) {
  const requiredXp = typeof item.unlockRule?.xp === "number" ? item.unlockRule.xp : item.unlockLevel * 75;
  return unlockedIds.has(item.id) || item.unlockLevel <= level || xp >= requiredXp;
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const [state, partners] = await Promise.all([
    getCompanionPetState(session.id),
    listSportsPartners(),
  ]);

  return NextResponse.json({
    state,
    partners,
    collections: fanGearCollections,
    items: state.items.filter(isFanGear).length > 0 ? state.items.filter(isFanGear) : companionFanGearItems,
    licensingNotice:
      "Bridge Pets fan gear uses original Bridge-owned placeholder assets. Official sports marks require written license approval before use.",
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const action = String(body.action ?? "");
  const current = await getCompanionPetState(session.id);
  const pet = current.pet;
  if (!pet) {
    return NextResponse.json({ error: "Create your companion before equipping fan gear." }, { status: 409 });
  }

  if (action === "sync-unlocks") {
    await unlockEligiblePetItems(session.id, pet.xp);
    const state = await getCompanionPetState(session.id);
    return NextResponse.json({ ok: true, state, items: state.items.filter(isFanGear) });
  }

  if (action === "equip") {
    const itemId = String(body.itemId ?? "");
    const currentFanGear = current.items.filter(isFanGear);
    const item = (currentFanGear.length > 0 ? currentFanGear : companionFanGearItems).find((row) => row.id === itemId && isFanGear(row) && row.isActive);
    if (!item) return NextResponse.json({ error: "Fan gear item not found." }, { status: 404 });

    await unlockEligiblePetItems(session.id, pet.xp);
    const refreshed = await getCompanionPetState(session.id);
    const unlockedIds = new Set(refreshed.inventory.map((row) => row.itemId));
    if (!isUnlocked(item, unlockedIds, pet.xp, pet.level)) {
      return NextResponse.json({ error: "This fan gear has not been unlocked yet." }, { status: 403 });
    }

    const slot = slotForItem(item);
    const nextOutfit = { ...(pet.activeOutfit ?? {}), [slot]: item.id };
    const updated = await updateCompanionPet({
      userId: session.id,
      petId: pet.id,
      patch: {
        activeOutfit: nextOutfit,
        mood: slot === "aura" || slot === "badge" ? "celebrating" : "happy",
      },
    });

    return NextResponse.json({
      ok: Boolean(updated),
      pet: updated,
      state: await getCompanionPetState(session.id),
    });
  }

  return NextResponse.json({ error: "Unknown fan gear action." }, { status: 400 });
}
