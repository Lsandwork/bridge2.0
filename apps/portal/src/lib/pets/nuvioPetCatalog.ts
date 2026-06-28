import { bridgePetProfiles, type BridgePetProfile } from "@/features/bridge-pets/petAssetManifest";

const sportsBase = "/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/png/pets";
const assetBase = "/assets/bridge-pets/bridge_pets_codex_asset_pack/characters/main_sprite_crops_png";

const spriteOverrides: Record<string, string> = {
  spark: `${sportsBase}/spark_idle.png`,
  tide: `${sportsBase}/ripple_idle.png`,
  nova: `${sportsBase}/nova_idle.png`,
  moss: `${sportsBase}/moss_idle.png`,
  bolt: `${sportsBase}/spark_happy.png`,
  ranger: `${assetBase}/ranger_main_sprite_crop.png`,
  focus: `${assetBase}/focus_main_sprite_crop.png`,
  zip: `${assetBase}/zip_main_sprite_crop.png`,
  echo: `${assetBase}/echo_main_sprite_crop.png`,
  atlas: `${assetBase}/atlas_main_sprite_crop.png`,
  luna: `${assetBase}/luna_main_sprite_crop.png`,
  rocket: `${assetBase}/rocket_main_sprite_crop.png`,
  sage: `${assetBase}/sage_main_sprite_crop.png`,
};

const legacySpeciesMap: Record<string, string> = {
  star_pup: "spark",
  calm_cat: "tide",
  brave_bear: "atlas",
  robot_buddy: "focus",
  dragon_sprout: "rocket",
  turtle_guide: "sage",
  fox_helper: "zip",
  cloud_friend: "luna",
  service_pup: "ranger",
  space_critter: "nova",
};

export type NuvioPetProfile = BridgePetProfile & {
  spriteImage: string;
};

export function normalizeNuvioPetSlug(value?: string | null): string {
  const raw = (value || "spark").trim().toLowerCase().replace(/_/g, "-");
  const mapped = legacySpeciesMap[raw.replace(/-/g, "_")] ?? raw;
  return bridgePetProfiles.some((pet) => pet.slug === mapped) ? mapped : "spark";
}

export function getNuvioPetProfile(value?: string | null): NuvioPetProfile {
  const slug = normalizeNuvioPetSlug(value);
  const profile = bridgePetProfiles.find((pet) => pet.slug === slug) ?? bridgePetProfiles[0];
  return {
    ...profile,
    spriteImage: spriteOverrides[profile.slug] ?? profile.spriteImage ?? spriteOverrides.spark,
  };
}

export const nuvioPetLineup: NuvioPetProfile[] = bridgePetProfiles
  .filter((pet) => ["spark", "tide", "nova", "ranger", "focus", "zip", "echo", "atlas", "luna", "rocket", "sage"].includes(pet.slug))
  .map((pet) => ({ ...pet, spriteImage: spriteOverrides[pet.slug] ?? pet.spriteImage ?? spriteOverrides.spark }));
