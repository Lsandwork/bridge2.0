-- Admin command center extensions: health reports and support requests

create type health_report_severity as enum ('low', 'moderate', 'high', 'critical');
create type health_report_status as enum ('new', 'reviewing', 'escalated', 'resolved', 'closed');

create table if not exists health_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  child_profile_id uuid references child_profiles(id) on delete set null,
  submitted_by_user_id uuid not null references users(id) on delete cascade,
  concern_type text not null,
  severity health_report_severity not null default 'moderate',
  status health_report_status not null default 'new',
  summary text not null,
  ai_summary text,
  recommended_follow_up text,
  metadata jsonb not null default '{}'::jsonb,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create type support_request_type as enum (
  'access',
  'invite',
  'care_team',
  'goal_routine',
  'documentation',
  'billing',
  'platform_support',
  'safety',
  'school_iep'
);

create type support_request_status as enum ('open', 'in_review', 'assigned', 'resolved', 'closed');
create type support_request_priority as enum ('low', 'normal', 'high', 'urgent');

create table if not exists support_requests (
  id uuid primary key default gen_random_uuid(),
  requester_user_id uuid not null references users(id) on delete cascade,
  child_profile_id uuid references child_profiles(id) on delete set null,
  request_type support_request_type not null,
  priority support_request_priority not null default 'normal',
  status support_request_status not null default 'open',
  subject text not null,
  message text not null,
  assigned_admin_id uuid references users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_health_reports_user on health_reports (user_id, created_at desc);
create index if not exists idx_health_reports_status on health_reports (status, severity);
create index if not exists idx_support_requests_status on support_requests (status, priority, created_at desc);
create index if not exists idx_support_requests_requester on support_requests (requester_user_id);

alter table health_reports enable row level security;
alter table support_requests enable row level security;
