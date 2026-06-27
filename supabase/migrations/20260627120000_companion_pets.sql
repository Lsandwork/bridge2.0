-- Nuvio Companion Pets: persistent supportive pet state, item catalog, XP events, and reminders.

create table if not exists companion_pets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  child_profile_id uuid references child_profiles(id) on delete set null,
  name text not null,
  species text not null,
  personality text not null,
  growth_stage text not null default 'baby',
  level int not null default 1 check (level >= 1),
  xp int not null default 0 check (xp >= 0),
  mood text not null default 'calm',
  active_outfit jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, child_profile_id)
);

create table if not exists pet_inventory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null,
  item_type text not null,
  unlocked_at timestamptz not null default now(),
  source text not null default 'starter',
  unique (user_id, item_id)
);

create table if not exists pet_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  child_profile_id uuid references child_profiles(id) on delete set null,
  event_type text not null,
  xp_awarded int not null default 0 check (xp_awarded >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists pet_items (
  id text primary key,
  name text not null,
  item_type text not null,
  theme text,
  unlock_level int not null default 1,
  unlock_rule jsonb not null default '{}'::jsonb,
  asset_config jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists pet_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pet_id uuid references companion_pets(id) on delete cascade,
  notification_type text not null,
  message text not null,
  scheduled_for timestamptz not null,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_companion_pets_user on companion_pets (user_id, updated_at desc);
create index if not exists idx_pet_inventory_user on pet_inventory (user_id, unlocked_at desc);
create index if not exists idx_pet_events_user on pet_events (user_id, created_at desc);
create index if not exists idx_pet_events_type on pet_events (event_type, created_at desc);
create index if not exists idx_pet_notifications_user on pet_notifications (user_id, scheduled_for desc);

alter table companion_pets enable row level security;
alter table pet_inventory enable row level security;
alter table pet_events enable row level security;
alter table pet_items enable row level security;
alter table pet_notifications enable row level security;

drop policy if exists "Users read own companion pets" on companion_pets;
create policy "Users read own companion pets"
  on companion_pets for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from parent_child_links pcl
      where pcl.parent_user_id = auth.uid()
        and pcl.child_profile_id = companion_pets.child_profile_id
    )
    or exists (
      select 1 from caregiver_links cl
      where cl.caregiver_user_id = auth.uid()
        and cl.child_profile_id = companion_pets.child_profile_id
    )
    or exists (
      select 1 from users u
      where u.id = auth.uid() and u.role in ('admin', 'super_admin')
    )
  );

drop policy if exists "Users write own companion pets" on companion_pets;
create policy "Users write own companion pets"
  on companion_pets for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users read own pet inventory" on pet_inventory;
create policy "Users read own pet inventory"
  on pet_inventory for select
  using (
    user_id = auth.uid()
    or exists (select 1 from users u where u.id = auth.uid() and u.role in ('admin', 'super_admin'))
  );

drop policy if exists "Users write own pet inventory" on pet_inventory;
create policy "Users write own pet inventory"
  on pet_inventory for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users read own pet events" on pet_events;
create policy "Users read own pet events"
  on pet_events for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from parent_child_links pcl
      where pcl.parent_user_id = auth.uid()
        and pcl.child_profile_id = pet_events.child_profile_id
    )
    or exists (
      select 1 from caregiver_links cl
      where cl.caregiver_user_id = auth.uid()
        and cl.child_profile_id = pet_events.child_profile_id
    )
    or exists (select 1 from users u where u.id = auth.uid() and u.role in ('admin', 'super_admin'))
  );

drop policy if exists "Users insert own pet events" on pet_events;
create policy "Users insert own pet events"
  on pet_events for insert
  with check (user_id = auth.uid());

drop policy if exists "Active pet items are readable" on pet_items;
create policy "Active pet items are readable"
  on pet_items for select
  using (is_active = true or exists (select 1 from users u where u.id = auth.uid() and u.role in ('admin', 'super_admin')));

drop policy if exists "Admins manage pet items" on pet_items;
create policy "Admins manage pet items"
  on pet_items for all
  using (exists (select 1 from users u where u.id = auth.uid() and u.role in ('admin', 'super_admin')))
  with check (exists (select 1 from users u where u.id = auth.uid() and u.role in ('admin', 'super_admin')));

drop policy if exists "Users read own pet notifications" on pet_notifications;
create policy "Users read own pet notifications"
  on pet_notifications for select
  using (user_id = auth.uid() or exists (select 1 from users u where u.id = auth.uid() and u.role in ('admin', 'super_admin')));

drop policy if exists "Users manage own pet notifications" on pet_notifications;
create policy "Users manage own pet notifications"
  on pet_notifications for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

insert into pet_items (id, name, item_type, theme, unlock_level, unlock_rule, asset_config, is_active) values
  ('starter-bandana', 'Starter Bandana', 'comfort_item', 'starter', 1, '{"source":"starter"}', '{"color":"#7c3aed","slot":"neck"}', true),
  ('calm-hoodie', 'Calm Hoodie', 'shirt', 'calm', 2, '{"xp":80}', '{"color":"#38bdf8","slot":"body"}', true),
  ('focus-glasses', 'Focus Glasses', 'glasses', 'focus', 3, '{"xp":160}', '{"color":"#111827","slot":"face"}', true),
  ('explorer-backpack', 'Explorer Backpack', 'backpack', 'explorer', 4, '{"xp":260}', '{"color":"#f59e0b","slot":"back"}', true),
  ('service-hero-vest', 'Service Hero Vest', 'jacket', 'veteran_support', 5, '{"xp":420,"tone":"respectful"}', '{"color":"#166534","slot":"body","badge":"service"}', true),
  ('cozy-pajamas', 'Cozy Pajamas', 'shirt', 'sensory_safe', 2, '{"xp":100}', '{"color":"#c4b5fd","slot":"body"}', true),
  ('star-badge', 'Tiny Wins Badge', 'achievement_badge', 'achievement', 3, '{"event":"goal_complete"}', '{"color":"#facc15","slot":"badge"}', true),
  ('wizard-hat', 'Wonder Hat', 'hat', 'playful', 4, '{"xp":300}', '{"color":"#8b5cf6","slot":"head"}', true)
on conflict (id) do update set
  name = excluded.name,
  item_type = excluded.item_type,
  theme = excluded.theme,
  unlock_level = excluded.unlock_level,
  unlock_rule = excluded.unlock_rule,
  asset_config = excluded.asset_config,
  is_active = excluded.is_active;
