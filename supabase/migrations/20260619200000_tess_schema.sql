-- Tess AI companion tables and RLS policies

create table if not exists tess_conversations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id),
  profile_id uuid references profiles(id),
  child_profile_id uuid references child_profiles(id),
  user_id uuid not null references users(id) on delete cascade,
  role text not null,
  title text,
  mode text check (mode in ('text','voice','calm','communication_builder','routine_helper','skill_practice','parent_assistant')),
  summary text,
  safety_status text default 'safe',
  is_flagged boolean default false,
  flagged_reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists tess_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references tess_conversations(id) on delete cascade,
  user_id uuid references users(id),
  role text check (role in ('user','assistant','system','tool')),
  content text not null,
  content_json jsonb,
  audio_url text,
  transcript text,
  tokens_input integer default 0,
  tokens_output integer default 0,
  model text,
  provider text,
  safety_status text default 'safe',
  created_at timestamptz default now()
);

create table if not exists tess_ai_suggestions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id),
  child_profile_id uuid references child_profiles(id),
  created_by_user_id uuid references users(id),
  conversation_id uuid references tess_conversations(id),
  suggestion_type text check (suggestion_type in ('routine','task','communication_card','social_story','exercise','reward','goal','parent_summary','report_note','sensory_plan','calm_plan')),
  title text not null,
  reason text,
  suggested_payload jsonb not null,
  status text default 'pending' check (status in ('pending','approved','edited','rejected','archived')),
  reviewed_by uuid references users(id),
  reviewed_at timestamptz,
  risk_level text default 'low' check (risk_level in ('low','medium','high')),
  admin_flag boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists tess_settings (
  id uuid primary key default gen_random_uuid(),
  child_profile_id uuid references child_profiles(id),
  user_id uuid references users(id),
  organization_id uuid references organizations(id),
  tess_enabled boolean default true,
  voice_enabled boolean default true,
  speech_to_text_enabled boolean default true,
  text_to_speech_enabled boolean default true,
  simple_language boolean default false,
  low_stimulation boolean default false,
  teen_adult_respectful_mode boolean default true,
  require_parent_approval boolean default true,
  allow_save_phrases boolean default true,
  allow_routine_suggestions boolean default true,
  allow_task_suggestions boolean default true,
  allow_exercise_suggestions boolean default true,
  allow_social_story_suggestions boolean default true,
  allow_reward_suggestions boolean default true,
  allow_goal_suggestions boolean default true,
  data_retention_days integer default 365,
  emergency_contact_name text,
  emergency_contact_phone text,
  escalation_enabled boolean default true,
  onboarding_complete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists tess_safety_flags (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references tess_conversations(id) on delete cascade,
  message_id uuid references tess_messages(id),
  user_id uuid references users(id),
  child_profile_id uuid references child_profiles(id),
  organization_id uuid references organizations(id),
  flag_type text not null,
  risk_level text check (risk_level in ('low','medium','high','urgent')),
  description text,
  status text default 'open' check (status in ('open','reviewing','resolved','escalated')),
  admin_notes text,
  resolved_by uuid references users(id),
  resolved_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists tess_prompt_versions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role_scope text check (role_scope in ('child','teen','adult','parent','caregiver','therapist','admin','global')),
  system_prompt text not null,
  safety_prompt text not null,
  version integer not null,
  is_active boolean default false,
  created_by uuid references users(id),
  created_at timestamptz default now()
);

create table if not exists tess_voice_files (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references tess_messages(id) on delete cascade,
  user_id uuid references users(id),
  child_profile_id uuid references child_profiles(id),
  file_url text not null,
  file_type text,
  duration_seconds integer,
  transcript text,
  created_at timestamptz default now()
);

create table if not exists tess_usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  organization_id uuid references organizations(id),
  child_profile_id uuid references child_profiles(id),
  provider text,
  model text,
  request_type text,
  tokens_input integer default 0,
  tokens_output integer default 0,
  estimated_cost numeric default 0,
  latency_ms integer,
  success boolean default true,
  error_message text,
  created_at timestamptz default now()
);

create table if not exists tess_context_snapshots (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references tess_conversations(id) on delete cascade,
  child_profile_id uuid references child_profiles(id),
  context_type text,
  context_json jsonb not null,
  created_at timestamptz default now()
);

create table if not exists tess_parent_notifications (
  id uuid primary key default gen_random_uuid(),
  parent_user_id uuid not null references users(id) on delete cascade,
  child_profile_id uuid references child_profiles(id),
  conversation_id uuid references tess_conversations(id),
  notification_type text not null,
  title text not null,
  body text,
  is_read boolean default false,
  created_at timestamptz default now()
);

alter table tess_conversations enable row level security;
alter table tess_messages enable row level security;
alter table tess_ai_suggestions enable row level security;
alter table tess_settings enable row level security;
alter table tess_safety_flags enable row level security;
alter table tess_prompt_versions enable row level security;
alter table tess_voice_files enable row level security;
alter table tess_usage_logs enable row level security;
alter table tess_context_snapshots enable row level security;
alter table tess_parent_notifications enable row level security;

-- Users read own conversations
create policy tess_conversations_own on tess_conversations for select using (auth.uid() = user_id);
create policy tess_conversations_insert on tess_conversations for insert with check (auth.uid() = user_id);

-- Parents read child conversations via parent_child_links
create policy tess_conversations_parent on tess_conversations for select using (
  exists (
    select 1 from parent_child_links pcl
    where pcl.parent_user_id = auth.uid() and pcl.child_profile_id = tess_conversations.child_profile_id
  )
);

-- Messages follow conversation access
create policy tess_messages_select on tess_messages for select using (
  exists (select 1 from tess_conversations c where c.id = conversation_id and c.user_id = auth.uid())
  or exists (
    select 1 from tess_conversations c
    join parent_child_links pcl on pcl.child_profile_id = c.child_profile_id
    where c.id = conversation_id and pcl.parent_user_id = auth.uid()
  )
);

create policy tess_suggestions_parent on tess_ai_suggestions for all using (
  exists (
    select 1 from parent_child_links pcl
    where pcl.parent_user_id = auth.uid() and pcl.child_profile_id = tess_ai_suggestions.child_profile_id
  )
);

create policy tess_settings_access on tess_settings for all using (
  user_id = auth.uid()
  or exists (
    select 1 from parent_child_links pcl
    where pcl.parent_user_id = auth.uid() and pcl.child_profile_id = tess_settings.child_profile_id
  )
);

create policy tess_safety_admin on tess_safety_flags for select using (
  exists (select 1 from users u where u.id = auth.uid() and u.role in ('admin','super_admin'))
);

create policy tess_usage_admin on tess_usage_logs for select using (
  exists (select 1 from users u where u.id = auth.uid() and u.role in ('admin','super_admin'))
);

create policy tess_prompts_super_admin on tess_prompt_versions for all using (
  exists (select 1 from users u where u.id = auth.uid() and u.role = 'super_admin')
);

create index if not exists idx_tess_conversations_user on tess_conversations(user_id);
create index if not exists idx_tess_conversations_child on tess_conversations(child_profile_id);
create index if not exists idx_tess_messages_conversation on tess_messages(conversation_id);
create index if not exists idx_tess_suggestions_status on tess_ai_suggestions(status);
create index if not exists idx_tess_safety_flags_status on tess_safety_flags(status);
