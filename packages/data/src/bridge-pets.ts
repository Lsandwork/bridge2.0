import { createSupabaseAdminClient } from "./supabase-server";

export type BridgePetCatalogItem = {
  id?: string;
  slug: string;
  name: string;
  description: string;
  audienceTags: string[];
  supportTags: string[];
  personalityTraits: string[];
  primaryColor: string;
  accentColor: string;
  assetBasePath: string;
  isActive: boolean;
};

export type UserBridgePet = {
  id: string;
  userId: string;
  petId: string | null;
  petSlug: string;
  petName: string;
  nickname: string | null;
  growthStage: "baby" | "child" | "teen" | "adult";
  xp: number;
  level: number;
  mood: string;
  equippedOutfit: string;
  equippedAccessory: string | null;
  selected: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BridgePetActivityType =
  | "check_in"
  | "routine_complete"
  | "goal_complete"
  | "focus_session"
  | "calm_reset"
  | "reward_earned"
  | "selection";

const now = () => new Date().toISOString();

export const bridgePetCatalogSeed: BridgePetCatalogItem[] = [
  ["spark", "Spark", "Your energized motivation companion.", ["Teens", "Adults", "Routine support"], ["Routine support", "Ready-for-action"], ["motivated", "positive", "habit-building"], "#FFD400", "#906AFF"],
  ["tide", "Tide", "Your calming companion. Always steady. Always flowing.", ["Teens", "Adults", "Calm support"], ["Calm support"], ["calming", "steady", "emotional regulation"], "#21B7FF", "#7CE6FF"],
  ["nova", "Nova", "Your curious companion. Always exploring. Always expanding.", ["Teens", "Creative expression"], ["Creative expression"], ["curious", "creative", "uplifting"], "#9D7BFF", "#79F0FF"],
  ["moss", "Moss", "Your grounded companion. Always rooted. Always growing.", ["Calm support", "Routine support"], ["Calm support", "Routine support"], ["grounded", "patient", "routine-building"], "#6BAF6E", "#8ED28A"],
  ["bolt", "Bolt", "Your bold momentum companion.", ["Routine support", "Ready-for-action"], ["Routine support", "Ready-for-action"], ["energetic", "action-driven", "motivating"], "#FFD400", "#6A3DFF"],
  ["ranger", "Ranger", "Your steady purpose companion.", ["Ready-for-action", "Adults", "Teens"], ["Ready-for-action", "Routine support"], ["resilient", "mission-focused", "ready-for-action", "purpose-driven"], "#87D65A", "#C58A4A"],
  ["focus", "Focus", "Built for clarity and momentum.", ["Focus support", "Routine support"], ["Focus support", "Routine support"], ["organized", "clear", "productive", "attention-supportive"], "#20C7FF", "#8DFF5A"],
  ["zip", "Zip", "For busy minds and bold moves.", ["Focus support", "Routine support", "Teens"], ["Focus support", "Routine support"], ["fast-thinking", "playful", "momentum-building", "busy-mind friendly"], "#FF8A20", "#00C9CF"],
  ["echo", "Echo", "Always connected. Always expressive.", ["Teens", "Creative expression"], ["Creative expression"], ["expressive", "social", "creative", "teen-friendly"], "#A15CFF", "#1DD3FF"],
  ["atlas", "Atlas", "Built for goals, balance, and progress.", ["Adults", "Routine support"], ["Routine support"], ["structured", "balanced", "goal-focused", "adult-friendly"], "#FFC34A", "#F3E6BF"],
  ["luna", "Luna", "Gentle support for reset and reflection.", ["Calm support", "Teens", "Adults"], ["Calm support"], ["soothing", "reflective", "calming", "reset-focused"], "#C89CFF", "#7F5BFF"],
  ["rocket", "Rocket", "Fuel for action and follow-through.", ["Routine support", "Ready-for-action"], ["Routine support", "Ready-for-action"], ["active", "energetic", "follow-through focused"], "#FF3D31", "#FFBE2E"],
  ["sage", "Sage", "A calm guide for everyday growth.", ["Adults", "Calm support"], ["Calm support", "Routine support"], ["wise", "reassuring", "steady", "adult-growth focused"], "#8ED28A", "#C8D6B0"],
].map(([slug, name, description, audienceTags, supportTags, personalityTraits, primaryColor, accentColor]) => ({
  slug: slug as string,
  name: name as string,
  description: description as string,
  audienceTags: audienceTags as string[],
  supportTags: supportTags as string[],
  personalityTraits: personalityTraits as string[],
  primaryColor: primaryColor as string,
  accentColor: accentColor as string,
  assetBasePath: `/assets/bridge-pets/bridge_pets_codex_asset_pack`,
  isActive: true,
}));

const localSelections = new Map<string, UserBridgePet>();
const localActivity: Array<{ userId: string; userPetId: string; activityType: string; xpAwarded: number; createdAt: string }> = [];

function normalizePet(row: Record<string, any>): BridgePetCatalogItem {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
    audienceTags: row.audience_tags ?? [],
    supportTags: row.support_tags ?? [],
    personalityTraits: row.personality_traits ?? [],
    primaryColor: row.primary_color ?? "#8b5cf6",
    accentColor: row.accent_color ?? "#facc15",
    assetBasePath: row.asset_base_path ?? "/assets/bridge-pets/bridge_pets_codex_asset_pack",
    isActive: row.is_active !== false,
  };
}

function normalizeUserPet(row: Record<string, any>, pet?: BridgePetCatalogItem | null): UserBridgePet {
  return {
    id: row.id,
    userId: row.user_id,
    petId: row.pet_id ?? null,
    petSlug: pet?.slug ?? row.pet_slug ?? "",
    petName: pet?.name ?? row.pet_name ?? "Bridge Pet",
    nickname: row.nickname ?? null,
    growthStage: row.growth_stage ?? "baby",
    xp: row.xp ?? 0,
    level: row.level ?? 1,
    mood: row.mood ?? "neutral",
    equippedOutfit: row.equipped_outfit ?? "default",
    equippedAccessory: row.equipped_accessory ?? null,
    selected: row.selected !== false,
    createdAt: row.created_at ?? now(),
    updatedAt: row.updated_at ?? now(),
  };
}

export function bridgePetStageFromXp(xp: number): UserBridgePet["growthStage"] {
  if (xp >= 650) return "adult";
  if (xp >= 300) return "teen";
  if (xp >= 90) return "child";
  return "baby";
}

export function bridgePetLevelFromXp(xp: number): number {
  return Math.max(1, Math.min(50, Math.floor(Math.sqrt(Math.max(0, xp) / 30)) + 1));
}

export function bridgePetXpForActivity(activityType: BridgePetActivityType): number {
  const values: Record<BridgePetActivityType, number> = {
    check_in: 10,
    routine_complete: 20,
    goal_complete: 35,
    focus_session: 15,
    calm_reset: 15,
    reward_earned: 20,
    selection: 0,
  };
  return values[activityType] ?? 0;
}

export async function listBridgePets(options?: { includeInactive?: boolean }): Promise<BridgePetCatalogItem[]> {
  const admin = createSupabaseAdminClient();
  if (!admin) return bridgePetCatalogSeed.filter((pet) => options?.includeInactive || pet.isActive);
  let query = admin.from("bridge_pets").select("*").order("name", { ascending: true });
  if (!options?.includeInactive) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error || !data?.length) return bridgePetCatalogSeed.filter((pet) => options?.includeInactive || pet.isActive);
  return data.map(normalizePet);
}

export async function getBridgePetBySlug(slug: string): Promise<BridgePetCatalogItem | null> {
  const local = bridgePetCatalogSeed.find((pet) => pet.slug === slug) ?? null;
  const admin = createSupabaseAdminClient();
  if (!admin) return local;
  const { data, error } = await admin.from("bridge_pets").select("*").eq("slug", slug).maybeSingle();
  if (error || !data) return local;
  return normalizePet(data);
}

export async function getSelectedBridgePet(userId: string): Promise<UserBridgePet | null> {
  const admin = createSupabaseAdminClient();
  if (!admin) return localSelections.get(userId) ?? null;
  const { data, error } = await admin
    .from("user_bridge_pets")
    .select("*, bridge_pets(*)")
    .eq("user_id", userId)
    .eq("selected", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return localSelections.get(userId) ?? null;
  return normalizeUserPet(data, data.bridge_pets ? normalizePet(data.bridge_pets) : null);
}

export async function selectBridgePetForUser(input: {
  userId: string;
  slug: string;
  nickname?: string | null;
}): Promise<UserBridgePet> {
  const pet = await getBridgePetBySlug(input.slug);
  if (!pet) throw new Error("Bridge Pet not found.");
  const at = now();
  const admin = createSupabaseAdminClient();
  if (!admin || !pet.id) {
    const existing = localSelections.get(input.userId);
    const selected: UserBridgePet = {
      id: existing?.id ?? `ubp-${Date.now()}`,
      userId: input.userId,
      petId: pet.id ?? pet.slug,
      petSlug: pet.slug,
      petName: pet.name,
      nickname: input.nickname ?? existing?.nickname ?? pet.name,
      growthStage: existing?.growthStage ?? "baby",
      xp: existing?.xp ?? 0,
      level: existing?.level ?? 1,
      mood: existing?.mood ?? "encouraging",
      equippedOutfit: existing?.equippedOutfit ?? "default",
      equippedAccessory: existing?.equippedAccessory ?? null,
      selected: true,
      createdAt: existing?.createdAt ?? at,
      updatedAt: at,
    };
    localSelections.set(input.userId, selected);
    localActivity.unshift({ userId: input.userId, userPetId: selected.id, activityType: "selection", xpAwarded: 0, createdAt: at });
    return selected;
  }

  await admin.from("user_bridge_pets").update({ selected: false, updated_at: at }).eq("user_id", input.userId);
  const { data, error } = await admin
    .from("user_bridge_pets")
    .insert({
      user_id: input.userId,
      pet_id: pet.id,
      nickname: input.nickname ?? pet.name,
      growth_stage: "baby",
      xp: 0,
      level: 1,
      mood: "encouraging",
      selected: true,
      updated_at: at,
    })
    .select("*, bridge_pets(*)")
    .single();
  if (error || !data) {
    throw new Error(error?.message ?? "Could not select Bridge Pet.");
  }
  await admin.from("bridge_pet_activity").insert({
    user_id: input.userId,
    user_pet_id: data.id,
    activity_type: "selection",
    xp_awarded: 0,
    metadata: { pet: pet.slug },
  });
  return normalizeUserPet(data, pet);
}

export async function awardBridgePetActivity(input: {
  userId: string;
  activityType: BridgePetActivityType;
  metadata?: Record<string, unknown>;
}) {
  const selected = await getSelectedBridgePet(input.userId);
  if (!selected) return { ok: false, reason: "no_selected_pet", xpAwarded: 0 };
  const xpAwarded = bridgePetXpForActivity(input.activityType);
  const nextXp = selected.xp + xpAwarded;
  const patch = {
    xp: nextXp,
    level: bridgePetLevelFromXp(nextXp),
    growth_stage: bridgePetStageFromXp(nextXp),
    mood: input.activityType === "calm_reset" ? "calm" : input.activityType === "focus_session" ? "focused" : "happy",
    updated_at: now(),
  };
  const admin = createSupabaseAdminClient();
  if (!admin) {
    const updated = { ...selected, xp: patch.xp, level: patch.level, growthStage: patch.growth_stage, mood: patch.mood, updatedAt: patch.updated_at };
    localSelections.set(input.userId, updated);
    localActivity.unshift({ userId: input.userId, userPetId: selected.id, activityType: input.activityType, xpAwarded, createdAt: now() });
    return { ok: true, xpAwarded, pet: updated };
  }
  const { data } = await admin.from("user_bridge_pets").update(patch).eq("id", selected.id).eq("user_id", input.userId).select("*, bridge_pets(*)").single();
  await admin.from("bridge_pet_activity").insert({
    user_id: input.userId,
    user_pet_id: selected.id,
    activity_type: input.activityType,
    xp_awarded: xpAwarded,
    metadata: input.metadata ?? {},
  });
  return { ok: true, xpAwarded, pet: data ? normalizeUserPet(data, data.bridge_pets ? normalizePet(data.bridge_pets) : null) : selected };
}

export async function getBridgePetsAdminOverview() {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return {
      source: "local",
      pets: bridgePetCatalogSeed,
      usage: localActivity,
      missingAssets: [],
    };
  }
  const [pets, selected, activity] = await Promise.all([
    admin.from("bridge_pets").select("*").order("name", { ascending: true }),
    admin.from("user_bridge_pets").select("pet_id", { count: "exact", head: false }),
    admin.from("bridge_pet_activity").select("activity_type,xp_awarded,created_at").order("created_at", { ascending: false }).limit(50),
  ]);
  const usageCounts = new Map<string, number>();
  for (const row of selected.data ?? []) {
    usageCounts.set(row.pet_id, (usageCounts.get(row.pet_id) ?? 0) + 1);
  }
  return {
    source: pets.error ? "local" : "supabase",
    pets: (pets.data?.length ? pets.data.map(normalizePet) : bridgePetCatalogSeed).map((pet) => ({
      ...pet,
      selectedUsers: pet.id ? usageCounts.get(pet.id) ?? 0 : 0,
    })),
    activity: activity.data ?? [],
    missingAssets: [],
  };
}

export async function setBridgePetActive(slug: string, isActive: boolean) {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    const pet = bridgePetCatalogSeed.find((row) => row.slug === slug);
    if (pet) pet.isActive = isActive;
    return { ok: Boolean(pet) };
  }
  const { error } = await admin.from("bridge_pets").update({ is_active: isActive }).eq("slug", slug);
  return { ok: !error, error: error?.message };
}

export async function updateBridgePetCatalogItem(
  slug: string,
  patch: Partial<Pick<BridgePetCatalogItem, "description" | "audienceTags" | "supportTags" | "personalityTraits" | "primaryColor" | "accentColor">>
) {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    const pet = bridgePetCatalogSeed.find((row) => row.slug === slug);
    if (!pet) return { ok: false, error: "Bridge Pet not found." };
    if (typeof patch.description === "string") pet.description = patch.description;
    if (Array.isArray(patch.audienceTags)) pet.audienceTags = patch.audienceTags;
    if (Array.isArray(patch.supportTags)) pet.supportTags = patch.supportTags;
    if (Array.isArray(patch.personalityTraits)) pet.personalityTraits = patch.personalityTraits;
    if (typeof patch.primaryColor === "string") pet.primaryColor = patch.primaryColor;
    if (typeof patch.accentColor === "string") pet.accentColor = patch.accentColor;
    return { ok: true, pet };
  }

  const update: Record<string, unknown> = {};
  if (typeof patch.description === "string") update.description = patch.description;
  if (Array.isArray(patch.audienceTags)) update.audience_tags = patch.audienceTags;
  if (Array.isArray(patch.supportTags)) update.support_tags = patch.supportTags;
  if (Array.isArray(patch.personalityTraits)) update.personality_traits = patch.personalityTraits;
  if (typeof patch.primaryColor === "string") update.primary_color = patch.primaryColor;
  if (typeof patch.accentColor === "string") update.accent_color = patch.accentColor;

  const { data, error } = await admin.from("bridge_pets").update(update).eq("slug", slug).select("*").single();
  return { ok: !error, error: error?.message, pet: data ? normalizePet(data) : null };
}
