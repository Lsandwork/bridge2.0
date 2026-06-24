create extension if not exists "uuid-ossp";

create type app_role as enum ('child_user', 'parent_guardian', 'caregiver_therapist_teacher', 'admin', 'super_admin');
create type mode_type as enum ('child', 'teen', 'adult', 'low_stimulation', 'high_contrast', 'simple', 'advanced');
create type suggestion_status as enum ('pending_review', 'approved', 'rejected');

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

create table if not exists roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  role app_role not null,
  granted_by uuid references users(id),
  created_at timestamptz not null default now()
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
  created_at timestamptz not null default now()
);

create table if not exists caregiver_links (
  id uuid primary key default gen_random_uuid(),
  caregiver_user_id uuid not null references users(id) on delete cascade,
  child_profile_id uuid not null references child_profiles(id) on delete cascade,
  invited_by_user_id uuid references users(id),
  permission_set jsonb not null default '{"can_view": true, "can_log": true}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists routines (
  id uuid primary key default gen_random_uuid(),
  child_profile_id uuid not null references child_profiles(id) on delete cascade,
  title text not null,
  schedule text not null,
  active boolean not null default true,
  created_by uuid references users(id),
  created_at timestamptz not null default now()
);

create table if not exists routine_steps (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references routines(id) on delete cascade,
  step_order int not null,
  title text not null,
  support_tip text,
  visual_url text,
  timer_seconds int
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  child_profile_id uuid not null references child_profiles(id) on delete cascade,
  routine_id uuid references routines(id) on delete set null,
  title text not null,
  due_at timestamptz,
  assigned_by uuid references users(id),
  status text not null default 'pending',
  points int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists task_completions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  child_profile_id uuid not null references child_profiles(id) on delete cascade,
  completed_by uuid references users(id),
  completed_at timestamptz not null default now(),
  notes text
);

create table if not exists communication_categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id),
  name text not null unique
);

create table if not exists communication_cards (
  id uuid primary key default gen_random_uuid(),
  child_profile_id uuid references child_profiles(id) on delete cascade,
  category_id uuid references communication_categories(id),
  phrase text not null,
  image_path text,
  audio_path text,
  is_favorite boolean not null default false,
  last_used_at timestamptz
);

create table if not exists emotions (
  id uuid primary key default gen_random_uuid(),
  child_profile_id uuid not null references child_profiles(id) on delete cascade,
  label text not null,
  intensity int not null check (intensity between 1 and 5),
  noted_at timestamptz not null default now()
);

create table if not exists sensory_logs (
  id uuid primary key default gen_random_uuid(),
  child_profile_id uuid not null references child_profiles(id) on delete cascade,
  trigger text,
  support_used text,
  overload_signals text,
  logged_at timestamptz not null default now()
);

create table if not exists check_ins (
  id uuid primary key default gen_random_uuid(),
  child_profile_id uuid not null references child_profiles(id) on delete cascade,
  check_in_type text not null,
  mood text,
  sensory_state text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  child_profile_id uuid not null references child_profiles(id) on delete cascade,
  title text not null,
  target_metric int,
  current_metric int not null default 0,
  active boolean not null default true
);

create table if not exists rewards (
  id uuid primary key default gen_random_uuid(),
  child_profile_id uuid not null references child_profiles(id) on delete cascade,
  title text not null,
  points_required int not null default 10,
  category text
);

create table if not exists reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  reward_id uuid not null references rewards(id) on delete cascade,
  child_profile_id uuid not null references child_profiles(id) on delete cascade,
  redeemed_at timestamptz not null default now()
);

create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  child_profile_id uuid not null references child_profiles(id) on delete cascade,
  title text not null,
  kind text not null,
  difficulty text not null
);

create table if not exists lesson_progress (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons(id) on delete cascade,
  child_profile_id uuid not null references child_profiles(id) on delete cascade,
  completed boolean not null default false,
  progress_percent int not null default 0
);

create table if not exists parent_library_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text
);

create table if not exists parent_library_articles (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references parent_library_categories(id) on delete cascade,
  title text not null,
  body_markdown text not null,
  evidence_notes text,
  updated_at timestamptz not null default now()
);

create table if not exists exercise_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  template jsonb not null,
  created_by uuid references users(id),
  created_at timestamptz not null default now()
);

create table if not exists exercises (
  id uuid primary key default gen_random_uuid(),
  child_profile_id uuid not null references child_profiles(id) on delete cascade,
  template_id uuid references exercise_templates(id),
  title text not null,
  goal text not null,
  steps jsonb not null default '[]'::jsonb,
  prompt_level text,
  timer_minutes int,
  frequency text,
  reward_idea text,
  notes text
);

create table if not exists exercise_assignments (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references exercises(id) on delete cascade,
  assigned_by uuid references users(id),
  assigned_to uuid not null references child_profiles(id) on delete cascade,
  start_date date not null default current_date
);

create table if not exists exercise_progress (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references exercise_assignments(id) on delete cascade,
  completed_at timestamptz,
  parent_rating int check (parent_rating between 1 and 5),
  child_response text,
  notes text
);

create table if not exists social_story_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body_markdown text not null,
  category text not null
);

create table if not exists social_stories (
  id uuid primary key default gen_random_uuid(),
  child_profile_id uuid not null references child_profiles(id) on delete cascade,
  template_id uuid references social_story_templates(id),
  title text not null,
  story_markdown text not null,
  assigned_at timestamptz not null default now(),
  completion_count int not null default 0
);

create table if not exists coaching_plans (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  duration_days int not null,
  summary text not null
);

create table if not exists coaching_plan_days (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references coaching_plans(id) on delete cascade,
  day_number int not null,
  parent_action text not null,
  child_activity text not null,
  tracking_prompt text not null,
  reward_suggestion text
);

create table if not exists parent_notes (
  id uuid primary key default gen_random_uuid(),
  child_profile_id uuid not null references child_profiles(id) on delete cascade,
  author_id uuid not null references users(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now()
);

create table if not exists caregiver_notes (
  id uuid primary key default gen_random_uuid(),
  child_profile_id uuid not null references child_profiles(id) on delete cascade,
  author_id uuid not null references users(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references users(id) on delete cascade,
  recipient_id uuid not null references users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists files (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references users(id) on delete cascade,
  bucket text not null,
  path text not null,
  mime_type text,
  created_at timestamptz not null default now()
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id),
  created_by uuid references users(id),
  report_type text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  plan_code text not null default 'starter',
  status text not null default 'trialing',
  renews_at timestamptz
);

create table if not exists admin_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references users(id),
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists ai_suggestions (
  id uuid primary key default gen_random_uuid(),
  child_profile_id uuid references child_profiles(id),
  suggestion_type text not null,
  input_payload jsonb not null,
  output_payload jsonb not null,
  status suggestion_status not null default 'pending_review',
  reviewed_by uuid references users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  check (
    output_payload::text !~* 'diagnos|cure|treat autism'
  )
);

create table if not exists support_tickets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id),
  created_by uuid references users(id),
  title text not null,
  body text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  body text not null,
  channel text not null default 'in_app',
  sent_at timestamptz,
  read_at timestamptz
);

alter table users enable row level security;
alter table profiles enable row level security;
alter table child_profiles enable row level security;
alter table parent_library_articles enable row level security;
alter table ai_suggestions enable row level security;

create policy "Users can read own row" on users for select using (id = auth.uid());
create policy "Users can update own row" on users for update using (id = auth.uid());

create policy "Profiles visible to owner" on profiles
for select using (user_id = auth.uid());

create policy "Profiles editable to owner" on profiles
for update using (user_id = auth.uid());

create policy "Child profiles visible via parent link" on child_profiles
for select using (
  exists (
    select 1 from parent_child_links pcl
    join profiles p on p.id = child_profiles.profile_id
    where pcl.parent_user_id = auth.uid() and pcl.child_profile_id = child_profiles.id
  )
);

create policy "Parent library readable by authenticated users" on parent_library_articles
for select to authenticated using (true);

create policy "AI suggestions creator read" on ai_suggestions
for select using (
  reviewed_by = auth.uid()
  or exists (
    select 1 from parent_child_links pcl
    where pcl.parent_user_id = auth.uid() and pcl.child_profile_id = ai_suggestions.child_profile_id
  )
);
