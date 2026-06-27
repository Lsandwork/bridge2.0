import { createSupabaseAdminClient } from "./supabase-server";
import type { PetItem } from "./companion-pets";

export type SportsPartner = {
  slug: string;
  name: string;
  partnerType: "placeholder" | "licensed" | "internal";
  licensingStatus: "placeholder" | "pending" | "approved" | "restricted";
  brandColors: { primary: string; accent: string };
  isActive: boolean;
};

export const sportsAssetBase = "/assets/bridge-pets-sports/bridge_pets_sports_asset_pack";

const gear = (
  id: string,
  name: string,
  itemType: string,
  category: string,
  rarity: "common" | "rare" | "epic" | "legendary",
  unlockLevel: number,
  slot: string,
  xp: number
): PetItem => ({
  id,
  name,
  itemType,
  theme: "fan_gear",
  unlockLevel,
  unlockRule: { xp, collection: "fan_gear", rarity, licensingRequired: false, official: false },
  assetConfig: {
    slot,
    category,
    rarity,
    licensingRequired: false,
    official: false,
    png: `${sportsAssetBase}/png/accessories/${id}.png`,
    svg: `${sportsAssetBase}/svg/accessories/${id}.svg`,
  },
  isActive: true,
});

export const companionFanGearItems: PetItem[] = [
  gear("icon_snapback", "Creator Snapback", "headwear", "headwear", "common", 1, "headwear", 0),
  gear("midnight_beanie", "Midnight Beanie", "headwear", "headwear", "common", 1, "headwear", 0),
  gear("arena_headphones", "Arena Headphones", "headwear", "headwear", "common", 1, "headwear", 0),
  gear("neon_visor", "Neon Visor", "facewear", "facewear", "common", 1, "facewear", 0),
  gear("pixel_shades", "Pixel Shades", "facewear", "facewear", "common", 1, "facewear", 0),
  gear("focus_lens", "Focus Lens", "facewear", "facewear", "common", 1, "facewear", 0),
  gear("courtside_hoodie", "Courtside Hoodie", "outerwear", "outerwear", "rare", 5, "outerwear", 260),
  gear("warmup_jacket", "Warmup Jacket", "outerwear", "outerwear", "rare", 5, "outerwear", 260),
  gear("varsity_jacket", "Varsity Jacket", "outerwear", "outerwear", "rare", 5, "outerwear", 260),
  gear("stadium_backpack", "Stadium Backpack", "backpack", "backpack", "rare", 5, "backpack", 260),
  gear("locker_pack", "Locker Pack", "backpack", "backpack", "rare", 5, "backpack", 260),
  gear("tech_sling", "Tech Sling", "backpack", "backpack", "rare", 5, "backpack", 260),
  gear("neon_kicks", "Neon Kicks", "footwear", "footwear", "rare", 5, "footwear", 260),
  gear("trail_boots", "Trail Boots", "footwear", "footwear", "rare", 5, "footwear", 260),
  gear("calm_slippers", "Calm Slippers", "footwear", "footwear", "rare", 5, "footwear", 260),
  gear("victory_glow", "Victory Glow Aura", "effect", "effects", "epic", 8, "aura", 520),
  gear("focus_ring", "Focus Ring", "effect", "effects", "epic", 8, "aura", 520),
  gear("streak_flame", "Streak Flame", "effect", "effects", "epic", 8, "aura", 520),
  gear("championship_badge", "Championship Badge", "badge", "badges", "legendary", 12, "badge", 900),
  gear("helper_heart", "Helper Heart", "badge", "badges", "epic", 8, "badge", 520),
  gear("shield_patch", "Shield Patch", "badge", "badges", "epic", 8, "badge", 520),
];

export const sportsPartnersSeed: SportsPartner[] = [
  "global-football",
  "pro-basketball",
  "pro-baseball",
  "pro-football",
  "championship-drops",
  "city-pride",
  "creator-series",
  "hometown-packs",
].map((slug) => ({
  slug,
  name: slug.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join(" "),
  partnerType: "placeholder",
  licensingStatus: "placeholder",
  brandColors: { primary: "#7C3AED", accent: "#FFD23F" },
  isActive: true,
}));

export const fanGearCollections = [
  {
    slug: "city-night",
    name: "City Night",
    tagline: "Light the streets.",
    rarity: "rare",
    background: `${sportsAssetBase}/png/backgrounds/city_night.png`,
    itemIds: ["icon_snapback", "neon_visor", "varsity_jacket", "neon_kicks", "locker_pack", "focus_ring"],
  },
  {
    slug: "arena-neon",
    name: "Arena Neon",
    tagline: "Game-day energy without real-world marks.",
    rarity: "epic",
    background: `${sportsAssetBase}/png/backgrounds/arena_neon.png`,
    itemIds: ["arena_headphones", "courtside_hoodie", "pixel_shades", "victory_glow", "championship_badge"],
  },
  {
    slug: "calm-focus",
    name: "Cozy Focus",
    tagline: "Reset, recharge, refocus.",
    rarity: "rare",
    background: `${sportsAssetBase}/png/backgrounds/calm_focus.png`,
    itemIds: ["midnight_beanie", "focus_lens", "calm_slippers", "helper_heart", "focus_ring"],
  },
  {
    slug: "championship-gold",
    name: "Championship Gold",
    tagline: "Celebrate milestones earned in Bridge.",
    rarity: "legendary",
    background: `${sportsAssetBase}/png/backgrounds/championship_gold.png`,
    itemIds: ["championship_badge", "victory_glow", "shield_patch", "streak_flame"],
  },
];

function normalizePartner(row: Record<string, any>): SportsPartner {
  return {
    slug: row.slug,
    name: row.name,
    partnerType: row.partner_type ?? "placeholder",
    licensingStatus: row.licensing_status ?? "placeholder",
    brandColors: row.brand_colors ?? { primary: "#7C3AED", accent: "#FFD23F" },
    isActive: row.is_active !== false,
  };
}

export async function listSportsPartners(options?: { includeInactive?: boolean }): Promise<SportsPartner[]> {
  const admin = createSupabaseAdminClient();
  if (!admin) return sportsPartnersSeed.filter((partner) => options?.includeInactive || partner.isActive);

  let query = admin.from("pet_sports_partners").select("*").order("name", { ascending: true });
  if (!options?.includeInactive) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error || !data?.length) return sportsPartnersSeed.filter((partner) => options?.includeInactive || partner.isActive);
  return data.map(normalizePartner);
}

export async function getFanGearAdminDiagnostics() {
  const admin = createSupabaseAdminClient();
  const localItems = companionFanGearItems;
  if (!admin) {
    return {
      source: "local",
      items: localItems.length,
      partners: sportsPartnersSeed.length,
      officialLicensedItems: 0,
      licensingWarnings: [],
      collections: fanGearCollections,
    };
  }

  const [items, partners] = await Promise.all([
    admin.from("pet_items").select("id,asset_config").eq("theme", "fan_gear"),
    admin.from("pet_sports_partners").select("slug,licensing_status"),
  ]);

  const officialLicensedItems = (items.data ?? []).filter((item) => Boolean((item.asset_config as any)?.official)).length;
  const licensingWarnings = (partners.data ?? [])
    .filter((partner) => partner.licensing_status !== "approved")
    .map((partner) => `${partner.slug}: ${partner.licensing_status}`);

  return {
    source: items.error || partners.error ? "local" : "supabase",
    items: items.count ?? items.data?.length ?? localItems.length,
    partners: partners.count ?? partners.data?.length ?? sportsPartnersSeed.length,
    officialLicensedItems,
    licensingWarnings,
    collections: fanGearCollections,
  };
}
