-- Bridge Pets Fan Gear & Sports Partnerships.
-- Uses Bridge-owned generic placeholder assets only. Official team/league marks must
-- not be uploaded or enabled until license approval is recorded.

create table if not exists pet_sports_partners (
  slug text primary key,
  name text not null,
  partner_type text not null default 'placeholder',
  licensing_status text not null default 'placeholder',
  brand_colors jsonb not null default '{"primary":"#7C3AED","accent":"#FFD23F"}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pet_sports_partners_partner_type_check
    check (partner_type in ('placeholder', 'licensed', 'internal')),
  constraint pet_sports_partners_licensing_status_check
    check (licensing_status in ('placeholder', 'pending', 'approved', 'restricted'))
);

alter table pet_sports_partners enable row level security;

drop policy if exists "Active sports partners are readable" on pet_sports_partners;
create policy "Active sports partners are readable"
  on pet_sports_partners for select
  using (
    is_active = true
    or exists (select 1 from users u where u.id = auth.uid() and u.role in ('admin', 'super_admin'))
  );

drop policy if exists "Admins manage sports partners" on pet_sports_partners;
create policy "Admins manage sports partners"
  on pet_sports_partners for all
  using (exists (select 1 from users u where u.id = auth.uid() and u.role in ('admin', 'super_admin')))
  with check (exists (select 1 from users u where u.id = auth.uid() and u.role in ('admin', 'super_admin')));

insert into pet_sports_partners (slug, name, partner_type, licensing_status, brand_colors, is_active) values
  ('global-football', 'Global Football', 'placeholder', 'placeholder', '{"primary":"#22c55e","accent":"#a855f7"}', true),
  ('pro-basketball', 'Pro Basketball', 'placeholder', 'placeholder', '{"primary":"#f59e0b","accent":"#8b5cf6"}', true),
  ('pro-baseball', 'Pro Baseball', 'placeholder', 'placeholder', '{"primary":"#38bdf8","accent":"#f97316"}', true),
  ('pro-football', 'Pro Football', 'placeholder', 'placeholder', '{"primary":"#60a5fa","accent":"#facc15"}', true),
  ('championship-drops', 'Championship Drops', 'placeholder', 'placeholder', '{"primary":"#facc15","accent":"#a855f7"}', true),
  ('city-pride', 'City Pride', 'placeholder', 'placeholder', '{"primary":"#ec4899","accent":"#38bdf8"}', true),
  ('creator-series', 'Creator Series', 'placeholder', 'placeholder', '{"primary":"#8b5cf6","accent":"#22d3ee"}', true),
  ('hometown-packs', 'Hometown Packs', 'placeholder', 'placeholder', '{"primary":"#fb7185","accent":"#facc15"}', true)
on conflict (slug) do update set
  name = excluded.name,
  partner_type = excluded.partner_type,
  licensing_status = excluded.licensing_status,
  brand_colors = excluded.brand_colors,
  is_active = excluded.is_active,
  updated_at = now();

insert into pet_items (id, name, item_type, theme, unlock_level, unlock_rule, asset_config, is_active) values
  ('icon_snapback', 'Creator Snapback', 'headwear', 'fan_gear', 1, '{"xp":0,"collection":"fan_gear","rarity":"common","licensingRequired":false,"official":false}', '{"slot":"headwear","category":"headwear","rarity":"common","licensingRequired":false,"official":false,"png":"/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/png/accessories/icon_snapback.png","svg":"/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/svg/accessories/icon_snapback.svg"}', true),
  ('midnight_beanie', 'Midnight Beanie', 'headwear', 'fan_gear', 1, '{"xp":0,"collection":"fan_gear","rarity":"common","licensingRequired":false,"official":false}', '{"slot":"headwear","category":"headwear","rarity":"common","licensingRequired":false,"official":false,"png":"/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/png/accessories/midnight_beanie.png","svg":"/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/svg/accessories/midnight_beanie.svg"}', true),
  ('arena_headphones', 'Arena Headphones', 'headwear', 'fan_gear', 1, '{"xp":0,"collection":"fan_gear","rarity":"common","licensingRequired":false,"official":false}', '{"slot":"headwear","category":"headwear","rarity":"common","licensingRequired":false,"official":false,"png":"/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/png/accessories/arena_headphones.png","svg":"/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/svg/accessories/arena_headphones.svg"}', true),
  ('neon_visor', 'Neon Visor', 'facewear', 'fan_gear', 1, '{"xp":0,"collection":"fan_gear","rarity":"common","licensingRequired":false,"official":false}', '{"slot":"facewear","category":"facewear","rarity":"common","licensingRequired":false,"official":false,"png":"/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/png/accessories/neon_visor.png","svg":"/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/svg/accessories/neon_visor.svg"}', true),
  ('pixel_shades', 'Pixel Shades', 'facewear', 'fan_gear', 1, '{"xp":0,"collection":"fan_gear","rarity":"common","licensingRequired":false,"official":false}', '{"slot":"facewear","category":"facewear","rarity":"common","licensingRequired":false,"official":false,"png":"/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/png/accessories/pixel_shades.png","svg":"/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/svg/accessories/pixel_shades.svg"}', true),
  ('focus_lens', 'Focus Lens', 'facewear', 'fan_gear', 1, '{"xp":0,"collection":"fan_gear","rarity":"common","licensingRequired":false,"official":false}', '{"slot":"facewear","category":"facewear","rarity":"common","licensingRequired":false,"official":false,"png":"/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/png/accessories/focus_lens.png","svg":"/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/svg/accessories/focus_lens.svg"}', true),
  ('courtside_hoodie', 'Courtside Hoodie', 'outerwear', 'fan_gear', 5, '{"xp":260,"collection":"fan_gear","rarity":"rare","licensingRequired":false,"official":false}', '{"slot":"outerwear","category":"outerwear","rarity":"rare","licensingRequired":false,"official":false,"png":"/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/png/accessories/courtside_hoodie.png","svg":"/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/svg/accessories/courtside_hoodie.svg"}', true),
  ('warmup_jacket', 'Warmup Jacket', 'outerwear', 'fan_gear', 5, '{"xp":260,"collection":"fan_gear","rarity":"rare","licensingRequired":false,"official":false}', '{"slot":"outerwear","category":"outerwear","rarity":"rare","licensingRequired":false,"official":false,"png":"/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/png/accessories/warmup_jacket.png","svg":"/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/svg/accessories/warmup_jacket.svg"}', true),
  ('varsity_jacket', 'Varsity Jacket', 'outerwear', 'fan_gear', 5, '{"xp":260,"collection":"fan_gear","rarity":"rare","licensingRequired":false,"official":false}', '{"slot":"outerwear","category":"outerwear","rarity":"rare","licensingRequired":false,"official":false,"png":"/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/png/accessories/varsity_jacket.png","svg":"/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/svg/accessories/varsity_jacket.svg"}', true),
  ('stadium_backpack', 'Stadium Backpack', 'backpack', 'fan_gear', 5, '{"xp":260,"collection":"fan_gear","rarity":"rare","licensingRequired":false,"official":false}', '{"slot":"backpack","category":"backpack","rarity":"rare","licensingRequired":false,"official":false,"png":"/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/png/accessories/stadium_backpack.png","svg":"/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/svg/accessories/stadium_backpack.svg"}', true),
  ('locker_pack', 'Locker Pack', 'backpack', 'fan_gear', 5, '{"xp":260,"collection":"fan_gear","rarity":"rare","licensingRequired":false,"official":false}', '{"slot":"backpack","category":"backpack","rarity":"rare","licensingRequired":false,"official":false,"png":"/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/png/accessories/locker_pack.png","svg":"/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/svg/accessories/locker_pack.svg"}', true),
  ('tech_sling', 'Tech Sling', 'backpack', 'fan_gear', 5, '{"xp":260,"collection":"fan_gear","rarity":"rare","licensingRequired":false,"official":false}', '{"slot":"backpack","category":"backpack","rarity":"rare","licensingRequired":false,"official":false,"png":"/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/png/accessories/tech_sling.png","svg":"/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/svg/accessories/tech_sling.svg"}', true),
  ('neon_kicks', 'Neon Kicks', 'footwear', 'fan_gear', 5, '{"xp":260,"collection":"fan_gear","rarity":"rare","licensingRequired":false,"official":false}', '{"slot":"footwear","category":"footwear","rarity":"rare","licensingRequired":false,"official":false,"png":"/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/png/accessories/neon_kicks.png","svg":"/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/svg/accessories/neon_kicks.svg"}', true),
  ('trail_boots', 'Trail Boots', 'footwear', 'fan_gear', 5, '{"xp":260,"collection":"fan_gear","rarity":"rare","licensingRequired":false,"official":false}', '{"slot":"footwear","category":"footwear","rarity":"rare","licensingRequired":false,"official":false,"png":"/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/png/accessories/trail_boots.png","svg":"/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/svg/accessories/trail_boots.svg"}', true),
  ('calm_slippers', 'Calm Slippers', 'footwear', 'fan_gear', 5, '{"xp":260,"collection":"fan_gear","rarity":"rare","licensingRequired":false,"official":false}', '{"slot":"footwear","category":"footwear","rarity":"rare","licensingRequired":false,"official":false,"png":"/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/png/accessories/calm_slippers.png","svg":"/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/svg/accessories/calm_slippers.svg"}', true),
  ('victory_glow', 'Victory Glow Aura', 'effect', 'fan_gear', 8, '{"xp":520,"collection":"fan_gear","rarity":"epic","licensingRequired":false,"official":false}', '{"slot":"aura","category":"effects","rarity":"epic","licensingRequired":false,"official":false,"png":"/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/png/accessories/victory_glow.png","svg":"/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/svg/accessories/victory_glow.svg"}', true),
  ('focus_ring', 'Focus Ring', 'effect', 'fan_gear', 8, '{"xp":520,"collection":"fan_gear","rarity":"epic","licensingRequired":false,"official":false}', '{"slot":"aura","category":"effects","rarity":"epic","licensingRequired":false,"official":false,"png":"/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/png/accessories/focus_ring.png","svg":"/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/svg/accessories/focus_ring.svg"}', true),
  ('streak_flame', 'Streak Flame', 'effect', 'fan_gear', 8, '{"xp":520,"collection":"fan_gear","rarity":"epic","licensingRequired":false,"official":false}', '{"slot":"aura","category":"effects","rarity":"epic","licensingRequired":false,"official":false,"png":"/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/png/accessories/streak_flame.png","svg":"/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/svg/accessories/streak_flame.svg"}', true),
  ('championship_badge', 'Championship Badge', 'badge', 'fan_gear', 12, '{"xp":900,"collection":"fan_gear","rarity":"legendary","licensingRequired":false,"official":false}', '{"slot":"badge","category":"badges","rarity":"legendary","licensingRequired":false,"official":false,"png":"/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/png/accessories/championship_badge.png","svg":"/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/svg/accessories/championship_badge.svg"}', true),
  ('helper_heart', 'Helper Heart', 'badge', 'fan_gear', 8, '{"xp":520,"collection":"fan_gear","rarity":"epic","licensingRequired":false,"official":false}', '{"slot":"badge","category":"badges","rarity":"epic","licensingRequired":false,"official":false,"png":"/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/png/accessories/helper_heart.png","svg":"/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/svg/accessories/helper_heart.svg"}', true),
  ('shield_patch', 'Shield Patch', 'badge', 'fan_gear', 8, '{"xp":520,"collection":"fan_gear","rarity":"epic","licensingRequired":false,"official":false}', '{"slot":"badge","category":"badges","rarity":"epic","licensingRequired":false,"official":false,"png":"/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/png/accessories/shield_patch.png","svg":"/assets/bridge-pets-sports/bridge_pets_sports_asset_pack/svg/accessories/shield_patch.svg"}', true)
on conflict (id) do update set
  name = excluded.name,
  item_type = excluded.item_type,
  theme = excluded.theme,
  unlock_level = excluded.unlock_level,
  unlock_rule = excluded.unlock_rule,
  asset_config = excluded.asset_config,
  is_active = excluded.is_active;
