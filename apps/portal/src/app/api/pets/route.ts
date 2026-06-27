import { NextResponse } from "next/server";
import {
  awardCompanionPetXp,
  createCompanionPet,
  getCompanionPetState,
  getPetAdminDiagnostics,
  schedulePetNotification,
  starterPetSpecies,
  updateCompanionPet,
  userCanAccessProfile,
  type PetEventType,
} from "@family-support/data";
import { getSession } from "@/lib/auth/session";

const eventTypes = new Set<PetEventType>([
  "routine_complete",
  "goal_complete",
  "emotional_regulation",
  "mood_check_in",
  "communication_card",
  "caregiver_encouragement",
  "therapist_goal_approved",
  "daily_streak",
  "returning_after_hard_day",
  "manual_celebrate",
  "pet_created",
]);

async function canUseProfile(session: { id: string; role: string }, profileId?: string | null) {
  if (!profileId) return true;
  return userCanAccessProfile(session as never, profileId);
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  if (searchParams.get("admin") === "diagnostics") {
    if (session.role !== "admin" && session.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(await getPetAdminDiagnostics());
  }

  const profileId = searchParams.get("profileId");
  if (!(await canUseProfile(session, profileId))) {
    return NextResponse.json({ error: "You do not have access to this profile." }, { status: 403 });
  }

  return NextResponse.json(await getCompanionPetState(session.id, profileId));
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = await request.json();
  const action = String(body.action ?? "");
  const profileId = typeof body.profileId === "string" ? body.profileId : null;
  if (!(await canUseProfile(session, profileId))) {
    return NextResponse.json({ error: "You do not have access to this profile." }, { status: 403 });
  }

  switch (action) {
    case "create": {
      const species = String(body.species ?? "star_pup");
      const pet = await createCompanionPet({
        userId: session.id,
        childProfileId: profileId,
        name: String(body.name ?? "Nuvio Buddy").slice(0, 40),
        species: starterPetSpecies.includes(species as never) ? species : "star_pup",
        personality: String(body.personality ?? "gentle").slice(0, 40),
        settings: body.settings ?? {},
      });
      return NextResponse.json({ pet, state: await getCompanionPetState(session.id, profileId) });
    }
    case "award-xp": {
      if (!eventTypes.has(body.eventType)) {
        return NextResponse.json({ error: "Unsupported pet event." }, { status: 400 });
      }
      const result = await awardCompanionPetXp({
        userId: session.id,
        childProfileId: profileId,
        eventType: body.eventType,
        metadata: body.metadata ?? {},
      });
      return NextResponse.json({ ...result, state: await getCompanionPetState(session.id, profileId) });
    }
    case "update":
    case "equip":
    case "settings": {
      if (!body.petId) return NextResponse.json({ error: "petId required." }, { status: 400 });
      const pet = await updateCompanionPet({
        userId: session.id,
        petId: String(body.petId),
        patch: {
          name: body.name,
          mood: body.mood,
          activeOutfit: body.activeOutfit,
          settings: body.settings,
        },
      });
      return NextResponse.json({ pet, state: await getCompanionPetState(session.id, profileId) });
    }
    case "schedule-notification": {
      if (!body.petId || !body.message || !body.scheduledFor) {
        return NextResponse.json({ error: "petId, message, and scheduledFor required." }, { status: 400 });
      }
      return NextResponse.json(await schedulePetNotification({
        userId: session.id,
        petId: String(body.petId),
        notificationType: String(body.notificationType ?? "pet_check_in"),
        message: String(body.message).slice(0, 240),
        scheduledFor: String(body.scheduledFor),
      }));
    }
    case "sync": {
      return NextResponse.json({ ok: true, state: await getCompanionPetState(session.id, profileId) });
    }
    default:
      return NextResponse.json({ error: "Unknown pet action." }, { status: 400 });
  }
}
