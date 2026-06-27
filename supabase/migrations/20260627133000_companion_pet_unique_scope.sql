-- Ensure each user/profile scope has one companion pet.
-- Postgres unique constraints allow multiple NULL child_profile_id values, so use a normalized expression index.

with ranked as (
  select
    id,
    row_number() over (
      partition by user_id, coalesce(child_profile_id, '00000000-0000-0000-0000-000000000000'::uuid)
      order by updated_at desc, created_at desc
    ) as rn
  from companion_pets
)
delete from companion_pets
where id in (select id from ranked where rn > 1);

create unique index if not exists idx_companion_pets_unique_user_profile_scope
  on companion_pets (user_id, coalesce(child_profile_id, '00000000-0000-0000-0000-000000000000'::uuid));
