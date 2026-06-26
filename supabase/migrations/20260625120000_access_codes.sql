create table if not exists access_codes (
  code text primary key,
  child_profile_id uuid not null references child_profiles(id) on delete cascade,
  created_by_user_id uuid not null references users(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index if not exists access_codes_one_active_per_child_profile
  on access_codes(child_profile_id)
  where active;

alter table access_codes enable row level security;

drop policy if exists "Access codes readable by linked care team" on access_codes;
create policy "Access codes readable by linked care team"
  on access_codes for select
  using (
    auth.uid() = created_by_user_id
    or exists (
      select 1 from parent_child_links pcl
      where pcl.child_profile_id = access_codes.child_profile_id
        and pcl.parent_user_id = auth.uid()
    )
    or exists (
      select 1 from caregiver_links cl
      where cl.child_profile_id = access_codes.child_profile_id
        and cl.caregiver_user_id = auth.uid()
    )
  );
