create extension if not exists pgcrypto;

create table if not exists bridge_pets (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  audience_tags text[] not null default '{}',
  support_tags text[] not null default '{}',
  personality_traits text[] not null default '{}',
  primary_color text,
  accent_color text,
  asset_base_path text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists user_bridge_pets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pet_id uuid references bridge_pets(id) on delete set null,
  nickname text,
  growth_stage text not null default 'baby' check (growth_stage in ('baby', 'child', 'teen', 'adult')),
  xp integer not null default 0 check (xp >= 0),
  level integer not null default 1 check (level >= 1),
  mood text not null default 'neutral',
  equipped_outfit text not null default 'default',
  equipped_accessory text,
  selected boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists bridge_pet_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_pet_id uuid references user_bridge_pets(id) on delete cascade,
  activity_type text not null,
  xp_awarded integer not null default 0 check (xp_awarded >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists bridge_pet_unlocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_pet_id uuid references user_bridge_pets(id) on delete cascade,
  unlock_type text not null,
  unlock_key text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_user_bridge_pets_one_selected
  on user_bridge_pets (user_id)
  where selected;

create index if not exists idx_user_bridge_pets_user on user_bridge_pets (user_id, updated_at desc);
create index if not exists idx_user_bridge_pets_pet on user_bridge_pets (pet_id);
create index if not exists idx_bridge_pet_activity_user on bridge_pet_activity (user_id, created_at desc);
create index if not exists idx_bridge_pet_activity_pet on bridge_pet_activity (user_pet_id, created_at desc);
create unique index if not exists idx_bridge_pet_unlocks_unique
  on bridge_pet_unlocks (user_id, user_pet_id, unlock_type, unlock_key);

create or replace function touch_user_bridge_pets_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_bridge_pets_updated_at on user_bridge_pets;
create trigger trg_user_bridge_pets_updated_at
before update on user_bridge_pets
for each row execute function touch_user_bridge_pets_updated_at();

insert into bridge_pets (
  slug,
  name,
  description,
  audience_tags,
  support_tags,
  personality_traits,
  primary_color,
  accent_color,
  asset_base_path,
  is_active
) values
  ('spark', 'Spark', 'Your energized motivation companion.', array['Teens','Adults','Routine support'], array['Routine support','Ready-for-action'], array['motivated','positive','habit-building'], '#FFD400', '#906AFF', '/assets/bridge-pets/bridge_pets_codex_asset_pack', true),
  ('tide', 'Tide', 'Your calming companion. Always steady. Always flowing.', array['Teens','Adults','Calm support'], array['Calm support'], array['calming','steady','emotional regulation'], '#21B7FF', '#7CE6FF', '/assets/bridge-pets/bridge_pets_codex_asset_pack', true),
  ('nova', 'Nova', 'Your curious companion. Always exploring. Always expanding.', array['Teens','Creative expression'], array['Creative expression'], array['curious','creative','uplifting'], '#9D7BFF', '#79F0FF', '/assets/bridge-pets/bridge_pets_codex_asset_pack', true),
  ('moss', 'Moss', 'Your grounded companion. Always rooted. Always growing.', array['Calm support','Routine support'], array['Calm support','Routine support'], array['grounded','patient','routine-building'], '#6BAF6E', '#8ED28A', '/assets/bridge-pets/bridge_pets_codex_asset_pack', true),
  ('bolt', 'Bolt', 'Your bold momentum companion.', array['Routine support','Ready-for-action'], array['Routine support','Ready-for-action'], array['energetic','action-driven','motivating'], '#FFD400', '#6A3DFF', '/assets/bridge-pets/bridge_pets_codex_asset_pack', true),
  ('ranger', 'Ranger', 'Your steady purpose companion.', array['Ready-for-action','Adults','Teens'], array['Ready-for-action','Routine support'], array['resilient','mission-focused','ready-for-action','purpose-driven'], '#87D65A', '#C58A4A', '/assets/bridge-pets/bridge_pets_codex_asset_pack', true),
  ('focus', 'Focus', 'Built for clarity and momentum.', array['Focus support','Routine support'], array['Focus support','Routine support'], array['organized','clear','productive','attention-supportive'], '#20C7FF', '#8DFF5A', '/assets/bridge-pets/bridge_pets_codex_asset_pack', true),
  ('zip', 'Zip', 'For busy minds and bold moves.', array['Focus support','Routine support','Teens'], array['Focus support','Routine support'], array['fast-thinking','playful','momentum-building','busy-mind friendly'], '#FF8A20', '#00C9CF', '/assets/bridge-pets/bridge_pets_codex_asset_pack', true),
  ('echo', 'Echo', 'Always connected. Always expressive.', array['Teens','Creative expression'], array['Creative expression'], array['expressive','social','creative','teen-friendly'], '#A15CFF', '#1DD3FF', '/assets/bridge-pets/bridge_pets_codex_asset_pack', true),
  ('atlas', 'Atlas', 'Built for goals, balance, and progress.', array['Adults','Routine support'], array['Routine support'], array['structured','balanced','goal-focused','adult-friendly'], '#FFC34A', '#F3E6BF', '/assets/bridge-pets/bridge_pets_codex_asset_pack', true),
  ('luna', 'Luna', 'Gentle support for reset and reflection.', array['Calm support','Teens','Adults'], array['Calm support'], array['soothing','reflective','calming','reset-focused'], '#C89CFF', '#7F5BFF', '/assets/bridge-pets/bridge_pets_codex_asset_pack', true),
  ('rocket', 'Rocket', 'Fuel for action and follow-through.', array['Routine support','Ready-for-action'], array['Routine support','Ready-for-action'], array['active','energetic','follow-through focused'], '#FF3D31', '#FFBE2E', '/assets/bridge-pets/bridge_pets_codex_asset_pack', true),
  ('sage', 'Sage', 'A calm guide for everyday growth.', array['Adults','Calm support'], array['Calm support','Routine support'], array['wise','reassuring','steady','adult-growth focused'], '#8ED28A', '#C8D6B0', '/assets/bridge-pets/bridge_pets_codex_asset_pack', true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  audience_tags = excluded.audience_tags,
  support_tags = excluded.support_tags,
  personality_traits = excluded.personality_traits,
  primary_color = excluded.primary_color,
  accent_color = excluded.accent_color,
  asset_base_path = excluded.asset_base_path,
  is_active = excluded.is_active;

alter table bridge_pets enable row level security;
alter table user_bridge_pets enable row level security;
alter table bridge_pet_activity enable row level security;
alter table bridge_pet_unlocks enable row level security;

drop policy if exists "Active bridge pets readable by authenticated users" on bridge_pets;
create policy "Active bridge pets readable by authenticated users"
on bridge_pets for select
to authenticated
using (
  is_active = true
  or exists (select 1 from public.users u where u.id = auth.uid() and u.role in ('admin', 'super_admin'))
);

drop policy if exists "Admins manage bridge pets" on bridge_pets;
create policy "Admins manage bridge pets"
on bridge_pets for all
to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.role in ('admin', 'super_admin')))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role in ('admin', 'super_admin')));

drop policy if exists "Users read own selected bridge pets" on user_bridge_pets;
create policy "Users read own selected bridge pets"
on user_bridge_pets for select
to authenticated
using (
  user_id = auth.uid()
  or exists (select 1 from public.users u where u.id = auth.uid() and u.role in ('admin', 'super_admin'))
);

drop policy if exists "Users insert own bridge pets" on user_bridge_pets;
create policy "Users insert own bridge pets"
on user_bridge_pets for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users update own bridge pets" on user_bridge_pets;
create policy "Users update own bridge pets"
on user_bridge_pets for update
to authenticated
using (
  user_id = auth.uid()
  or exists (select 1 from public.users u where u.id = auth.uid() and u.role in ('admin', 'super_admin'))
)
with check (
  user_id = auth.uid()
  or exists (select 1 from public.users u where u.id = auth.uid() and u.role in ('admin', 'super_admin'))
);

drop policy if exists "Users read own bridge pet activity" on bridge_pet_activity;
create policy "Users read own bridge pet activity"
on bridge_pet_activity for select
to authenticated
using (
  user_id = auth.uid()
  or exists (select 1 from public.users u where u.id = auth.uid() and u.role in ('admin', 'super_admin'))
);

drop policy if exists "Users insert own bridge pet activity" on bridge_pet_activity;
create policy "Users insert own bridge pet activity"
on bridge_pet_activity for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users read own bridge pet unlocks" on bridge_pet_unlocks;
create policy "Users read own bridge pet unlocks"
on bridge_pet_unlocks for select
to authenticated
using (
  user_id = auth.uid()
  or exists (select 1 from public.users u where u.id = auth.uid() and u.role in ('admin', 'super_admin'))
);

drop policy if exists "Users manage own bridge pet unlocks" on bridge_pet_unlocks;
create policy "Users manage own bridge pet unlocks"
on bridge_pet_unlocks for all
to authenticated
using (
  user_id = auth.uid()
  or exists (select 1 from public.users u where u.id = auth.uid() and u.role in ('admin', 'super_admin'))
)
with check (
  user_id = auth.uid()
  or exists (select 1 from public.users u where u.id = auth.uid() and u.role in ('admin', 'super_admin'))
);
