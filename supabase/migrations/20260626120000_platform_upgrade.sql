-- Nuvio Bridge platform upgrade: Bridge Groups, messaging, safety, admin ops

do $$ begin
  alter type app_role add value if not exists 'teen_user';
exception when duplicate_object then null;
end $$;

do $$ begin
  alter type app_role add value if not exists 'adult_user';
exception when duplicate_object then null;
end $$;

do $$ begin
  alter type app_role add value if not exists 'case_manager';
exception when duplicate_object then null;
end $$;

do $$ begin
  alter type app_role add value if not exists 'school_iep';
exception when duplicate_object then null;
end $$;

alter table users add column if not exists status text not null default 'active'
  check (status in ('active', 'suspended', 'disabled'));
alter table users add column if not exists is_demo boolean not null default false;
alter table users add column if not exists last_login_at timestamptz;
alter table users add column if not exists last_activity_at timestamptz;

create type bridge_member_role as enum (
  'center_user',
  'parent_caregiver',
  'therapist',
  'case_manager',
  'school_iep',
  'admin_observer'
);

create type bridge_group_status as enum ('active', 'inactive', 'archived');

create table if not exists bridge_groups (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  center_user_id uuid references users(id) on delete set null,
  center_child_profile_id uuid references child_profiles(id) on delete set null,
  created_by uuid references users(id),
  status bridge_group_status not null default 'active',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists bridge_group_members (
  id uuid primary key default gen_random_uuid(),
  bridge_group_id uuid not null references bridge_groups(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  member_role bridge_member_role not null,
  status text not null default 'active' check (status in ('active', 'removed', 'pending')),
  joined_at timestamptz not null default now(),
  removed_at timestamptz,
  unique (bridge_group_id, user_id)
);

create table if not exists bridge_access_codes (
  id uuid primary key default gen_random_uuid(),
  bridge_group_id uuid not null references bridge_groups(id) on delete cascade,
  code text not null unique,
  member_role bridge_member_role not null,
  created_by uuid references users(id),
  expires_at timestamptz,
  revoked_at timestamptz,
  redeemed_by uuid references users(id),
  redeemed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists bridge_conversations (
  id uuid primary key default gen_random_uuid(),
  bridge_group_id uuid not null references bridge_groups(id) on delete cascade,
  subject text,
  urgency text not null default 'normal' check (urgency in ('normal', 'urgent')),
  created_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists bridge_conversation_members (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references bridge_conversations(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  unique (conversation_id, user_id)
);

create table if not exists bridge_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references bridge_conversations(id) on delete cascade,
  bridge_group_id uuid not null references bridge_groups(id) on delete cascade,
  sender_id uuid not null references users(id) on delete cascade,
  body text not null,
  urgency text not null default 'normal' check (urgency in ('normal', 'urgent')),
  created_at timestamptz not null default now()
);

create table if not exists bridge_message_read_receipts (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references bridge_messages(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  read_at timestamptz not null default now(),
  unique (message_id, user_id)
);

create type safety_severity as enum ('low', 'moderate', 'high', 'critical');
create type safety_alert_status as enum ('new', 'acknowledged', 'in_progress', 'resolved', 'escalated');

create table if not exists safety_alerts (
  id uuid primary key default gen_random_uuid(),
  bridge_group_id uuid references bridge_groups(id) on delete set null,
  user_id uuid not null references users(id) on delete cascade,
  child_profile_id uuid references child_profiles(id) on delete set null,
  concern_category text not null,
  severity safety_severity not null,
  status safety_alert_status not null default 'new',
  triggering_excerpt text not null,
  ai_summary text,
  recommended_steps text,
  assigned_responder_id uuid references users(id),
  emergency_recommended boolean not null default false,
  is_demo boolean not null default false,
  source text not null default 'nuvio_chat',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists safety_alert_events (
  id uuid primary key default gen_random_uuid(),
  safety_alert_id uuid not null references safety_alerts(id) on delete cascade,
  actor_id uuid references users(id),
  event_type text not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists platform_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  bridge_group_id uuid references bridge_groups(id) on delete set null,
  type text not null,
  title text not null,
  body text not null,
  severity text not null default 'info',
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists user_activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  email text,
  bridge_group_id uuid references bridge_groups(id) on delete set null,
  event_type text not null,
  detail text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create type error_log_severity as enum ('critical', 'high', 'medium', 'low', 'info');
create type error_log_status as enum ('open', 'resolved', 'ignored');

create table if not exists error_logs (
  id uuid primary key default gen_random_uuid(),
  severity error_log_severity not null default 'medium',
  status error_log_status not null default 'open',
  service text not null,
  message text not null,
  stack_trace text,
  user_id uuid references users(id) on delete set null,
  route text,
  request_id text,
  environment text,
  assigned_admin_id uuid references users(id),
  notes text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists user_credits (
  user_id uuid primary key references users(id) on delete cascade,
  balance int not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  delta int not null,
  balance_after int not null,
  reason text not null,
  admin_id uuid references users(id),
  created_at timestamptz not null default now()
);

create table if not exists user_library_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  item_slug text not null,
  locked boolean not null default false,
  granted_by uuid references users(id),
  note text,
  created_at timestamptz not null default now(),
  unique (user_id, item_slug)
);

create table if not exists user_course_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  course_slug text not null,
  tier text not null default 'unlocked',
  granted_by uuid references users(id),
  note text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, course_slug)
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references users(id),
  action text not null,
  target_type text,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_users_email on users (email);
create index if not exists idx_users_role on users (role);
create index if not exists idx_users_status on users (status);
create index if not exists idx_bridge_groups_center on bridge_groups (center_user_id);
create index if not exists idx_bridge_group_members_group on bridge_group_members (bridge_group_id);
create index if not exists idx_bridge_group_members_user on bridge_group_members (user_id);
create index if not exists idx_bridge_access_codes_code on bridge_access_codes (code);
create index if not exists idx_bridge_messages_conversation on bridge_messages (conversation_id, created_at desc);
create index if not exists idx_safety_alerts_group on safety_alerts (bridge_group_id, created_at desc);
create index if not exists idx_safety_alerts_status on safety_alerts (status, severity);
create index if not exists idx_user_activity_events_user on user_activity_events (user_id, created_at desc);
create index if not exists idx_user_activity_events_type on user_activity_events (event_type, created_at desc);
create index if not exists idx_error_logs_severity on error_logs (severity, status, created_at desc);
create index if not exists idx_platform_notifications_user on platform_notifications (user_id, read_at, created_at desc);

alter table bridge_groups enable row level security;
alter table bridge_group_members enable row level security;
alter table bridge_access_codes enable row level security;
alter table bridge_conversations enable row level security;
alter table bridge_conversation_members enable row level security;
alter table bridge_messages enable row level security;
alter table safety_alerts enable row level security;
alter table platform_notifications enable row level security;
