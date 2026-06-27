import { createSupabaseAdminClient } from "./supabase-server";

export type PetGrowthStage = "baby" | "little_buddy" | "teen_companion" | "adult_companion" | "master_companion";
export type PetMood =
  | "idle"
  | "happy"
  | "encouraging"
  | "thinking"
  | "celebrating"
  | "waiting"
  | "sleeping"
  | "excited"
  | "calm"
  | "focus"
  | "routine_reminder"
  | "goal_complete"
  | "overwhelmed_support";

export type PetSettings = {
  motionLevel: "off" | "low" | "normal";
  bubbleFrequency: "low" | "normal" | "high";
  sound: boolean;
  voice: boolean;
  sensorySafe: boolean;
  quietMode: boolean;
  largerButtons: boolean;
  highContrast: boolean;
  simpleLanguage: boolean;
  minimized: boolean;
  disabled?: boolean;
};

export type CompanionPet = {
  id: string;
  userId: string;
  childProfileId: string | null;
  name: string;
  species: string;
  personality: string;
  growthStage: PetGrowthStage;
  level: number;
  xp: number;
  mood: PetMood;
  activeOutfit: Record<string, string>;
  settings: PetSettings;
  createdAt: string;
  updatedAt: string;
};

export type PetItem = {
  id: string;
  name: string;
  itemType: string;
  theme: string | null;
  unlockLevel: number;
  unlockRule: Record<string, unknown>;
  assetConfig: Record<string, unknown>;
  isActive: boolean;
};

export type PetInventoryItem = {
  id: string;
  userId: string;
  itemId: string;
  itemType: string;
  unlockedAt: string;
  source: string;
};

export type PetEventType =
  | "routine_complete"
  | "goal_complete"
  | "emotional_regulation"
  | "mood_check_in"
  | "communication_card"
  | "caregiver_encouragement"
  | "therapist_goal_approved"
  | "daily_streak"
  | "returning_after_hard_day"
  | "manual_celebrate"
  | "pet_created";

export type PetState = {
  pet: CompanionPet | null;
  inventory: PetInventoryItem[];
  items: PetItem[];
  diagnostics: {
    source: "supabase" | "local";
    tablesAvailable: boolean;
    localCache: "supported";
    serviceWorker: "client_registered" | "not_checked";
    push: "client_checked" | "not_checked";
    lastSyncAt: string;
  };
};

export const starterPetSpecies = [
  "star_pup",
  "calm_cat",
  "brave_bear",
  "robot_buddy",
  "dragon_sprout",
  "turtle_guide",
  "fox_helper",
  "cloud_friend",
  "service_pup",
  "space_critter",
] as const;

const defaultSettings: PetSettings = {
  motionLevel: "low",
  bubbleFrequency: "normal",
  sound: false,
  voice: false,
  sensorySafe: true,
  quietMode: false,
  largerButtons: false,
  highContrast: false,
  simpleLanguage: false,
  minimized: false,
};

const starterItems: PetItem[] = [
  { id: "starter-bandana", name: "Starter Bandana", itemType: "comfort_item", theme: "starter", unlockLevel: 1, unlockRule: { source: "starter" }, assetConfig: { color: "#7c3aed", slot: "neck" }, isActive: true },
  { id: "calm-hoodie", name: "Calm Hoodie", itemType: "shirt", theme: "calm", unlockLevel: 2, unlockRule: { xp: 80 }, assetConfig: { color: "#38bdf8", slot: "body" }, isActive: true },
  { id: "focus-glasses", name: "Focus Glasses", itemType: "glasses", theme: "focus", unlockLevel: 3, unlockRule: { xp: 160 }, assetConfig: { color: "#111827", slot: "face" }, isActive: true },
  { id: "explorer-backpack", name: "Explorer Backpack", itemType: "backpack", theme: "explorer", unlockLevel: 4, unlockRule: { xp: 260 }, assetConfig: { color: "#f59e0b", slot: "back" }, isActive: true },
  { id: "service-hero-vest", name: "Service Hero Vest", itemType: "jacket", theme: "veteran_support", unlockLevel: 5, unlockRule: { xp: 420, tone: "respectful" }, assetConfig: { color: "#166534", slot: "body", badge: "service" }, isActive: true },
  { id: "cozy-pajamas", name: "Cozy Pajamas", itemType: "shirt", theme: "sensory_safe", unlockLevel: 2, unlockRule: { xp: 100 }, assetConfig: { color: "#c4b5fd", slot: "body" }, isActive: true },
  { id: "star-badge", name: "Tiny Wins Badge", itemType: "achievement_badge", theme: "achievement", unlockLevel: 3, unlockRule: { event: "goal_complete" }, assetConfig: { color: "#facc15", slot: "badge" }, isActive: true },
  { id: "wizard-hat", name: "Wonder Hat", itemType: "hat", theme: "playful", unlockLevel: 4, unlockRule: { xp: 300 }, assetConfig: { color: "#8b5cf6", slot: "head" }, isActive: true },
];

const localPets = new Map<string, CompanionPet>();
const localInventory = new Map<string, PetInventoryItem[]>();
const localEvents = new Map<string, number>();

function nowIso() {
  return new Date().toISOString();
}

function localKey(userId: string, childProfileId?: string | null) {
  return `${userId}:${childProfileId ?? "self"}`;
}

function petScopeQuery<T extends { eq: (column: string, value: unknown) => T; is: (column: string, value: null) => T }>(
  query: T,
  childProfileId?: string | null
) {
  return childProfileId ? query.eq("child_profile_id", childProfileId) : query.is("child_profile_id", null);
}

export function xpForPetEvent(eventType: PetEventType): number {
  const map: Record<PetEventType, number> = {
    routine_complete: 20,
    goal_complete: 35,
    emotional_regulation: 15,
    mood_check_in: 10,
    communication_card: 15,
    caregiver_encouragement: 20,
    therapist_goal_approved: 30,
    daily_streak: 25,
    returning_after_hard_day: 10,
    manual_celebrate: 5,
    pet_created: 0,
  };
  return map[eventType] ?? 0;
}

export function calculatePetLevel(xp: number): number {
  return Math.max(1, Math.min(50, Math.floor(Math.sqrt(Math.max(0, xp) / 30)) + 1));
}

export function calculatePetGrowthStage(xp: number): PetGrowthStage {
  if (xp >= 1200) return "master_companion";
  if (xp >= 650) return "adult_companion";
  if (xp >= 300) return "teen_companion";
  if (xp >= 90) return "little_buddy";
  return "baby";
}

function normalizePet(row: Record<string, any>): CompanionPet {
  return {
    id: row.id,
    userId: row.user_id,
    childProfileId: row.child_profile_id ?? null,
    name: row.name,
    species: row.species,
    personality: row.personality,
    growthStage: row.growth_stage,
    level: row.level,
    xp: row.xp,
    mood: row.mood,
    activeOutfit: row.active_outfit ?? {},
    settings: { ...defaultSettings, ...(row.settings ?? {}) },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeItem(row: Record<string, any>): PetItem {
  return {
    id: row.id,
    name: row.name,
    itemType: row.item_type,
    theme: row.theme ?? null,
    unlockLevel: row.unlock_level,
    unlockRule: row.unlock_rule ?? {},
    assetConfig: row.asset_config ?? {},
    isActive: Boolean(row.is_active),
  };
}

function normalizeInventory(row: Record<string, any>): PetInventoryItem {
  return {
    id: row.id,
    userId: row.user_id,
    itemId: row.item_id,
    itemType: row.item_type,
    unlockedAt: row.unlocked_at,
    source: row.source,
  };
}

function createLocalPet(input: {
  userId: string;
  childProfileId?: string | null;
  name: string;
  species: string;
  personality: string;
  settings?: Partial<PetSettings>;
}) {
  const at = nowIso();
  const pet: CompanionPet = {
    id: `pet-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userId: input.userId,
    childProfileId: input.childProfileId ?? null,
    name: input.name,
    species: input.species,
    personality: input.personality,
    growthStage: "baby",
    level: 1,
    xp: 0,
    mood: "calm",
    activeOutfit: { neck: "starter-bandana" },
    settings: { ...defaultSettings, ...(input.settings ?? {}) },
    createdAt: at,
    updatedAt: at,
  };
  localPets.set(localKey(input.userId, input.childProfileId), pet);
  localInventory.set(input.userId, [
    { id: `pinv-${Date.now()}`, userId: input.userId, itemId: "starter-bandana", itemType: "comfort_item", unlockedAt: at, source: "starter" },
  ]);
  return pet;
}

function updateLocalPetXp(input: {
  userId: string;
  childProfileId?: string | null;
  pet: CompanionPet;
  xp: number;
  eventType: PetEventType;
}) {
  const updated: CompanionPet = {
    ...input.pet,
    xp: input.xp,
    level: calculatePetLevel(input.xp),
    growthStage: calculatePetGrowthStage(input.xp),
    mood:
      input.eventType === "goal_complete"
        ? "goal_complete"
        : input.eventType === "emotional_regulation"
          ? "calm"
          : "celebrating",
    updatedAt: nowIso(),
  };
  localPets.set(localKey(input.userId, input.childProfileId), updated);
  return updated;
}

export async function getCompanionPetState(userId: string, childProfileId?: string | null): Promise<PetState> {
  const admin = createSupabaseAdminClient();
  const lastSyncAt = nowIso();
  if (!admin) {
    return {
      pet: localPets.get(localKey(userId, childProfileId)) ?? null,
      inventory: localInventory.get(userId) ?? [],
      items: starterItems,
      diagnostics: { source: "local", tablesAvailable: false, localCache: "supported", serviceWorker: "not_checked", push: "not_checked", lastSyncAt },
    };
  }

  const petQuery = admin.from("companion_pets").select("*").eq("user_id", userId);

  const [{ data: petRow, error: petError }, { data: itemRows }, { data: inventoryRows }] = await Promise.all([
    petScopeQuery(petQuery, childProfileId).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
    admin.from("pet_items").select("*").eq("is_active", true).order("unlock_level", { ascending: true }),
    admin.from("pet_inventory").select("*").eq("user_id", userId).order("unlocked_at", { ascending: false }),
  ]);

  if (petError && petError.code !== "PGRST116") {
    return {
      pet: localPets.get(localKey(userId, childProfileId)) ?? null,
      inventory: localInventory.get(userId) ?? [],
      items: starterItems,
      diagnostics: { source: "local", tablesAvailable: false, localCache: "supported", serviceWorker: "not_checked", push: "not_checked", lastSyncAt },
    };
  }

  return {
    pet: petRow ? normalizePet(petRow) : null,
    inventory: (inventoryRows ?? []).map(normalizeInventory),
    items: (itemRows ?? starterItems).map((row: any) => ("item_type" in row ? normalizeItem(row) : row)),
    diagnostics: { source: "supabase", tablesAvailable: true, localCache: "supported", serviceWorker: "client_registered", push: "client_checked", lastSyncAt },
  };
}

export async function createCompanionPet(input: {
  userId: string;
  childProfileId?: string | null;
  name: string;
  species: string;
  personality: string;
  settings?: Partial<PetSettings>;
}) {
  const admin = createSupabaseAdminClient();
  const settings = { ...defaultSettings, ...(input.settings ?? {}) };
  if (!admin) return createLocalPet(input);

  const existingQuery = admin.from("companion_pets").select("id").eq("user_id", input.userId);
  const { data: existing } = await petScopeQuery(existingQuery, input.childProfileId).order("updated_at", { ascending: false }).limit(1).maybeSingle();

  const payload = {
    user_id: input.userId,
    child_profile_id: input.childProfileId ?? null,
    name: input.name.trim() || "Nuvio Buddy",
    species: input.species,
    personality: input.personality,
    growth_stage: "baby",
    level: 1,
    xp: 0,
    mood: "calm",
    active_outfit: { neck: "starter-bandana" },
    settings,
    updated_at: nowIso(),
  };

  const write = existing?.id
    ? admin.from("companion_pets").update(payload).eq("id", existing.id)
    : admin.from("companion_pets").insert(payload);

  const { data, error } = await write.select("*").single();
  if (error || !data) return createLocalPet(input);

  await admin.from("pet_inventory").upsert({
    user_id: input.userId,
    item_id: "starter-bandana",
    item_type: "comfort_item",
    source: "starter",
  }, { onConflict: "user_id,item_id" });
  await admin.from("pet_events").insert({
    user_id: input.userId,
    child_profile_id: input.childProfileId ?? null,
    event_type: "pet_created",
    xp_awarded: 0,
    metadata: { species: input.species, personality: input.personality },
  });
  return normalizePet(data);
}

function eventSpamKey(userId: string, eventType: string, childProfileId?: string | null) {
  return `${userId}:${childProfileId ?? "self"}:${eventType}`;
}

export async function awardCompanionPetXp(input: {
  userId: string;
  childProfileId?: string | null;
  eventType: PetEventType;
  metadata?: Record<string, unknown>;
}) {
  const xpAwarded = xpForPetEvent(input.eventType);
  const key = eventSpamKey(input.userId, input.eventType, input.childProfileId);
  const last = localEvents.get(key) ?? 0;
  if (Date.now() - last < 45_000 && input.eventType !== "manual_celebrate") {
    return { ok: false, reason: "rate_limited", xpAwarded: 0 };
  }
  localEvents.set(key, Date.now());

  const current = await getCompanionPetState(input.userId, input.childProfileId);
  const pet = current.pet ?? (await createCompanionPet({
    userId: input.userId,
    childProfileId: input.childProfileId,
    name: "Nuvio Buddy",
    species: "star_pup",
    personality: "gentle",
  }));
  const nextXp = pet.xp + xpAwarded;
  const patch = {
    xp: nextXp,
    level: calculatePetLevel(nextXp),
    growth_stage: calculatePetGrowthStage(nextXp),
    mood: input.eventType === "goal_complete" ? "goal_complete" : input.eventType === "emotional_regulation" ? "calm" : "celebrating",
    updated_at: nowIso(),
  };

  const admin = createSupabaseAdminClient();
  if (!admin) {
    const updated = updateLocalPetXp({
      userId: input.userId,
      childProfileId: input.childProfileId,
      pet,
      xp: nextXp,
      eventType: input.eventType,
    });
    await unlockEligiblePetItems(input.userId, nextXp, input.eventType);
    return { ok: true, pet: updated, xpAwarded };
  }

  await admin.from("pet_events").insert({
    user_id: input.userId,
    child_profile_id: input.childProfileId ?? null,
    event_type: input.eventType,
    xp_awarded: xpAwarded,
    metadata: input.metadata ?? {},
  });
  const { data, error } = await admin.from("companion_pets").update(patch).eq("id", pet.id).select("*").single();
  if (error || !data) {
    const updated = updateLocalPetXp({
      userId: input.userId,
      childProfileId: input.childProfileId,
      pet,
      xp: nextXp,
      eventType: input.eventType,
    });
    await unlockEligiblePetItems(input.userId, nextXp, input.eventType);
    return { ok: true, pet: updated, xpAwarded };
  }
  await unlockEligiblePetItems(input.userId, nextXp, input.eventType);
  return { ok: true, pet: normalizePet(data), xpAwarded };
}

export async function unlockEligiblePetItems(userId: string, xp: number, eventType?: PetEventType) {
  const admin = createSupabaseAdminClient();
  const items = admin
    ? (await admin.from("pet_items").select("*").eq("is_active", true)).data?.map(normalizeItem) ?? starterItems
    : starterItems;
  const unlocked = items.filter((item) => {
    const ruleXp = typeof item.unlockRule.xp === "number" ? item.unlockRule.xp : item.unlockLevel * 75;
    const eventRule = typeof item.unlockRule.event === "string" ? item.unlockRule.event : null;
    return xp >= ruleXp || (eventRule && eventRule === eventType);
  });
  if (!admin) {
    const existing = localInventory.get(userId) ?? [];
    const ids = new Set(existing.map((item) => item.itemId));
    const next = [...existing];
    for (const item of unlocked) {
      if (!ids.has(item.id)) next.push({ id: `pinv-${Date.now()}-${item.id}`, userId, itemId: item.id, itemType: item.itemType, unlockedAt: nowIso(), source: "xp" });
    }
    localInventory.set(userId, next);
    return next;
  }
  for (const item of unlocked) {
    await admin.from("pet_inventory").upsert({
      user_id: userId,
      item_id: item.id,
      item_type: item.itemType,
      source: "xp",
    }, { onConflict: "user_id,item_id" });
  }
  return unlocked;
}

export async function updateCompanionPet(input: {
  userId: string;
  petId: string;
  patch: Partial<Pick<CompanionPet, "name" | "mood" | "activeOutfit" | "settings">>;
}) {
  const admin = createSupabaseAdminClient();
  const rowPatch: Record<string, unknown> = { updated_at: nowIso() };
  if (input.patch.name !== undefined) rowPatch.name = input.patch.name;
  if (input.patch.mood !== undefined) rowPatch.mood = input.patch.mood;
  if (input.patch.activeOutfit !== undefined) rowPatch.active_outfit = input.patch.activeOutfit;
  if (input.patch.settings !== undefined) rowPatch.settings = input.patch.settings;

  if (!admin) {
    for (const [key, pet] of localPets) {
      if (pet.id === input.petId && pet.userId === input.userId) {
        const updated = { ...pet, ...input.patch, updatedAt: rowPatch.updated_at as string };
        localPets.set(key, updated);
        return updated;
      }
    }
    return null;
  }
  const { data, error } = await admin
    .from("companion_pets")
    .update(rowPatch)
    .eq("id", input.petId)
    .eq("user_id", input.userId)
    .select("*")
    .single();
  if (error || !data) return null;
  return normalizePet(data);
}

export async function schedulePetNotification(input: {
  userId: string;
  petId: string;
  notificationType: string;
  message: string;
  scheduledFor: string;
}) {
  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, localOnly: true };
  const { error } = await admin.from("pet_notifications").insert({
    user_id: input.userId,
    pet_id: input.petId,
    notification_type: input.notificationType,
    message: input.message,
    scheduled_for: input.scheduledFor,
  });
  return { ok: !error };
}

export async function getPetAdminDiagnostics() {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return {
      tablesAvailable: false,
      pets: localPets.size,
      items: starterItems.length,
      source: "local",
      xpApi: "available",
    };
  }
  const [pets, items, events] = await Promise.all([
    admin.from("companion_pets").select("id", { count: "exact", head: true }),
    admin.from("pet_items").select("id", { count: "exact", head: true }),
    admin.from("pet_events").select("id", { count: "exact", head: true }),
  ]);
  return {
    tablesAvailable: !pets.error && !items.error && !events.error,
    pets: pets.count ?? 0,
    items: items.count ?? 0,
    events: events.count ?? 0,
    source: "supabase",
    xpApi: "available",
  };
}
