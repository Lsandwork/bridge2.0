-- Auth + onboarding bootstrap
-- Safe on fresh Supabase projects (creates required tables) and on projects
-- that already ran 20260619183000_initial_schema.sql (uses IF NOT EXISTS).

create extension if not exists "uuid-ossp";

do $$ begin
  create type app_role as enum (
    'child_user',
    'parent_guardian',
    'caregiver_therapist_teacher',
    'admin',
    'super_admin'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type mode_type as enum (
    'child',
    'teen',
    'adult',
    'low_stimulation',
    'high_contrast',
    'simple',
    'advanced'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references organizations(id),
  email text unique not null,
  full_name text not null,
  role app_role not null default 'parent_guardian',
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  display_name text not null,
  mode mode_type not null default 'child',
  low_stimulation boolean not null default true,
  high_contrast boolean not null default false,
  voice_support boolean not null default true,
  text_to_speech boolean not null default true,
  safety_disclaimer_accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists child_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  date_of_birth date,
  communication_style text,
  support_notes text,
  emergency_card jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists parent_child_links (
  id uuid primary key default gen_random_uuid(),
  parent_user_id uuid not null references users(id) on delete cascade,
  child_profile_id uuid not null references child_profiles(id) on delete cascade,
  permission_set jsonb not null default '{"can_view": true, "can_edit": true}'::jsonb,
  created_at timestamptz not null default now(),
  unique (parent_user_id, child_profile_id)
);

create table if not exists caregiver_links (
  id uuid primary key default gen_random_uuid(),
  caregiver_user_id uuid not null references users(id) on delete cascade,
  child_profile_id uuid not null references child_profiles(id) on delete cascade,
  invited_by_user_id uuid references users(id),
  permission_set jsonb not null default '{"can_view": true, "can_log": true}'::jsonb,
  created_at timestamptz not null default now(),
  unique (caregiver_user_id, child_profile_id)
);

create table if not exists onboarding_intake (
  user_id uuid primary key references auth.users(id) on delete cascade,
  pathway_id text not null default 'autism',
  setup_role text not null,
  safety_accepted_at timestamptz not null,
  terms_accepted_at timestamptz,
  created_at timestamptz not null default now()
);

alter table users enable row level security;
alter table profiles enable row level security;
alter table child_profiles enable row level security;
alter table parent_child_links enable row level security;
alter table caregiver_links enable row level security;
alter table onboarding_intake enable row level security;

drop policy if exists "Users can read own row" on users;
create policy "Users can read own row"
  on users for select
  using (id = auth.uid());

drop policy if exists "Users can update own row" on users;
create policy "Users can update own row"
  on users for update
  using (id = auth.uid());

drop policy if exists "Users can insert own row" on users;
create policy "Users can insert own row"
  on users for insert
  with check (id = auth.uid());

drop policy if exists "Profiles visible to owner" on profiles;
create policy "Profiles visible to owner"
  on profiles for select
  using (user_id = auth.uid());

drop policy if exists "Profiles editable to owner" on profiles;
create policy "Profiles editable to owner"
  on profiles for update
  using (user_id = auth.uid());

drop policy if exists "Profiles insertable by owner" on profiles;
create policy "Profiles insertable by owner"
  on profiles for insert
  with check (user_id = auth.uid());

drop policy if exists "Child profiles visible via parent link" on child_profiles;
drop policy if exists "Child profiles readable via parent link" on child_profiles;
create policy "Child profiles readable via parent link"
  on child_profiles for select
  using (
    exists (
      select 1 from parent_child_links pcl
      where pcl.parent_user_id = auth.uid()
        and pcl.child_profile_id = child_profiles.id
    )
    or exists (
      select 1 from caregiver_links cl
      where cl.caregiver_user_id = auth.uid()
        and cl.child_profile_id = child_profiles.id
    )
    or exists (
      select 1 from profiles p
      where p.id = child_profiles.profile_id
        and p.user_id = auth.uid()
    )
  );

drop policy if exists "Parent child links readable by parent" on parent_child_links;
create policy "Parent child links readable by parent"
  on parent_child_links for select
  using (parent_user_id = auth.uid());

drop policy if exists "Caregiver links readable by caregiver" on caregiver_links;
create policy "Caregiver links readable by caregiver"
  on caregiver_links for select
  using (caregiver_user_id = auth.uid());

drop policy if exists "Onboarding intake readable by owner" on onboarding_intake;
create policy "Onboarding intake readable by owner"
  on onboarding_intake for select
  using (user_id = auth.uid());

drop policy if exists "Onboarding intake insertable by owner" on onboarding_intake;
create policy "Onboarding intake insertable by owner"
  on onboarding_intake for insert
  with check (user_id = auth.uid());
