import { NextResponse } from "next/server";
import {
  awardBridgePetActivity,
  getBridgePetsAdminOverview,
  getSelectedBridgePet,
  isAdminRole,
  listBridgePets,
  selectBridgePetForUser,
  setBridgePetActive,
  updateBridgePetCatalogItem,
  type BridgePetActivityType,
} from "@family-support/data";
import { getSession } from "@/lib/auth/session";

const activityTypes = new Set<BridgePetActivityType>([
  "check_in",
  "routine_complete",
  "goal_complete",
  "focus_session",
  "calm_reset",
  "reward_earned",
  "selection",
]);

function cleanList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value
    .map((item) => String(item ?? "").trim())
    .filter(Boolean)
    .slice(0, 12);
}

export async function GET(request: Request) {
  const session = await getSession();
  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section") ?? "catalog";

  if (section === "selected") {
    if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    return NextResponse.json({ selected: await getSelectedBridgePet(session.id) });
  }

  if (section === "admin") {
    if (!session || !isAdminRole(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(await getBridgePetsAdminOverview());
  }

  return NextResponse.json({ pets: await listBridgePets({ includeInactive: Boolean(session && isAdminRole(session.role)) }) });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = await request.json();
  const action = String(body.action ?? "");

  if (action === "select") {
    const slug = String(body.slug ?? "").trim().toLowerCase();
    if (!slug) return NextResponse.json({ error: "Bridge Pet slug required." }, { status: 400 });
    const selected = await selectBridgePetForUser({
      userId: session.id,
      slug,
      nickname: typeof body.nickname === "string" ? body.nickname.slice(0, 40) : undefined,
    });
    return NextResponse.json({ selected });
  }

  if (action === "activity") {
    const activityType = String(body.activityType ?? "") as BridgePetActivityType;
    if (!activityTypes.has(activityType) || activityType === "selection") {
      return NextResponse.json({ error: "Unsupported Bridge PETS activity." }, { status: 400 });
    }
    const result = await awardBridgePetActivity({
      userId: session.id,
      activityType,
      metadata: typeof body.metadata === "object" && body.metadata ? body.metadata : {},
    });
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }

  if (action === "toggle-active") {
    if (!isAdminRole(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json(await setBridgePetActive(String(body.slug ?? ""), Boolean(body.isActive)));
  }

  if (action === "update-catalog") {
    if (!isAdminRole(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const result = await updateBridgePetCatalogItem(String(body.slug ?? ""), {
      description: typeof body.description === "string" ? body.description.slice(0, 400) : undefined,
      audienceTags: cleanList(body.audienceTags),
      supportTags: cleanList(body.supportTags),
      personalityTraits: cleanList(body.personalityTraits),
      primaryColor: typeof body.primaryColor === "string" ? body.primaryColor.slice(0, 20) : undefined,
      accentColor: typeof body.accentColor === "string" ? body.accentColor.slice(0, 20) : undefined,
    });
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }

  return NextResponse.json({ error: "Unknown Bridge PETS action." }, { status: 400 });
}
