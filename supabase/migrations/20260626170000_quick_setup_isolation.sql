-- Quick Setup onboarding state + notification preferences for real users

create table if not exists quick_setup_status (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  child_profile_id uuid references child_profiles(id) on delete cascade,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'skipped', 'completed')),
  checklist jsonb not null default '{}'::jsonb,
  skipped_at timestamptz,
  reminded_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, child_profile_id)
);

create index if not exists idx_quick_setup_status_user on quick_setup_status (user_id, updated_at desc);
create index if not exists idx_quick_setup_status_status on quick_setup_status (status, updated_at desc);

create table if not exists user_notification_preferences (
  user_id uuid primary key references users(id) on delete cascade,
  setup_reminders boolean not null default true,
  care_team_activity boolean not null default true,
  weekly_summary boolean not null default true,
  goal_routine_reminders boolean not null default true,
  safety_alerts boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists quick_setup_admin_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  child_profile_id uuid references child_profiles(id) on delete set null,
  event_type text not null,
  dedupe_key text not null,
  created_at timestamptz not null default now(),
  unique (dedupe_key)
);

alter table quick_setup_status enable row level security;
alter table user_notification_preferences enable row level security;
