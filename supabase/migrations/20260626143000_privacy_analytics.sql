create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null check (event_name in ('page_view')),
  path text not null,
  user_id uuid references users(id) on delete set null,
  role app_role,
  referrer_host text,
  viewport text not null default 'unknown' check (viewport in ('mobile', 'tablet', 'desktop', 'unknown')),
  created_at timestamptz not null default now()
);

create index if not exists idx_analytics_events_created_at on analytics_events (created_at desc);
create index if not exists idx_analytics_events_path on analytics_events (path, created_at desc);
create index if not exists idx_analytics_events_role on analytics_events (role, created_at desc);

alter table analytics_events enable row level security;

drop policy if exists "Analytics events are admin readable" on analytics_events;
create policy "Analytics events are admin readable"
  on analytics_events for select
  using (
    exists (
      select 1
      from users u
      where u.id = auth.uid()
        and u.role in ('admin', 'super_admin')
    )
  );
