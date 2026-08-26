-- Account-bound lifetime tester access and the entitlement record that future
-- Google Play verification will update.

create table if not exists public.ascend_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  access_level text not null check (access_level in ('free', 'premium', 'lifetime')),
  source text not null check (source in ('tester_key', 'google_play', 'manual')),
  source_reference text,
  is_active boolean not null default true,
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (access_level = 'lifetime' or expires_at is not null)
);

alter table public.ascend_entitlements enable row level security;

drop policy if exists "Users can read their own ASCEND entitlement" on public.ascend_entitlements;
create policy "Users can read their own ASCEND entitlement"
  on public.ascend_entitlements
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on table public.ascend_entitlements from anon;
revoke insert, update, delete on table public.ascend_entitlements from authenticated;
grant select on table public.ascend_entitlements to authenticated;
grant all on table public.ascend_entitlements to service_role;

alter table public.ascend_tester_codes
  add column if not exists redeemed_by uuid references auth.users(id) on delete set null,
  add column if not exists access_level text not null default 'lifetime'
    check (access_level = 'lifetime'),
  add column if not exists batch text not null default 'legacy';

alter table public.ascend_tester_codes
  drop constraint if exists ascend_tester_codes_slot_check;
alter table public.ascend_tester_codes
  add constraint ascend_tester_codes_slot_check check (slot between 1 and 35);

create unique index if not exists ascend_tester_codes_redeemed_by_unique
  on public.ascend_tester_codes (redeemed_by)
  where redeemed_by is not null;

-- Legacy device-bound keys remain untouched. New keys bind permanently to the
-- authenticated account that first redeems them.
create or replace function public.redeem_ascend_lifetime_key(p_hash text)
returns table(status text, access_level text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_code public.ascend_tester_codes%rowtype;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if p_hash is null or p_hash !~ '^[0-9a-f]{64}$' then
    return query select 'invalid'::text, null::text;
    return;
  end if;

  select * into v_code
  from public.ascend_tester_codes
  where code_hash = lower(p_hash)
  for update;

  if not found then
    return query select 'invalid'::text, null::text;
    return;
  end if;

  if v_code.redeemed_by is not null and v_code.redeemed_by <> v_user_id then
    return query select 'already_used'::text, null::text;
    return;
  end if;

  if v_code.redeemed_at is not null and v_code.redeemed_by is null then
    return query select 'already_used'::text, null::text;
    return;
  end if;

  if exists (
    select 1 from public.ascend_entitlements e
    where e.user_id = v_user_id
      and e.is_active
      and e.access_level = 'lifetime'
  ) then
    return query select 'already_redeemed'::text, 'lifetime'::text;
    return;
  end if;

  update public.ascend_tester_codes
  set redeemed_at = coalesce(redeemed_at, now()),
      redeemed_by = v_user_id,
      redeemed_device = null
  where code_hash = v_code.code_hash;

  insert into public.ascend_entitlements (
    user_id, access_level, source, source_reference, is_active, starts_at, expires_at
  ) values (
    v_user_id, 'lifetime', 'tester_key', 'tester-slot-' || v_code.slot, true, now(), null
  )
  on conflict (user_id) do update
    set access_level = 'lifetime',
        source = 'tester_key',
        source_reference = excluded.source_reference,
        is_active = true,
        expires_at = null,
        updated_at = now();

  return query select
    case when v_code.redeemed_by = v_user_id then 'already_redeemed' else 'redeemed' end,
    'lifetime'::text;
end;
$$;

revoke all on function public.redeem_ascend_lifetime_key(text) from public, anon;
grant execute on function public.redeem_ascend_lifetime_key(text) to authenticated, service_role;

insert into public.ascend_tester_codes (code_hash, slot, access_level, batch)
values
  ('53cd6c373347d904fc88a948371ecf108a6200848fa7b78e28bc95da99166684', 16, 'lifetime', 'lifetime-2026-08'),
  ('6d3bec7ac26b0a6913a6bc1e35ea537701752495efaaa80fcd72f4648b9a3031', 17, 'lifetime', 'lifetime-2026-08'),
  ('61ce8aa42994679bb18559236df10bc2775d7152a46e6b8a006e8ca3c246c309', 18, 'lifetime', 'lifetime-2026-08'),
  ('0027b276ebd5ed2528d09ead81e0156617e90f058f4f5f3e27d78b1ba6e0025f', 19, 'lifetime', 'lifetime-2026-08'),
  ('8d5b01eb91446a5ca8e7ba004fd7ae675e55df3777e9281f011a1a7edb4607f1', 20, 'lifetime', 'lifetime-2026-08'),
  ('ac148eaf501929bbebc8b0d24fcc0fb7d4d2c1f819c4a4caf506502640bfcc22', 21, 'lifetime', 'lifetime-2026-08'),
  ('b77c9ce88a2b55bf3d87996759e1194325ac41d413f16e4b72bd623ed83299fc', 22, 'lifetime', 'lifetime-2026-08'),
  ('f0338591ce53954f143cd5735b1b3dd9d457cf4d1a6065b5eaa3a5364bafb6a0', 23, 'lifetime', 'lifetime-2026-08'),
  ('82ecce512d2dc3831d5c4a37bb8c75a8d94c6189e5c56497690aecfa61bc1544', 24, 'lifetime', 'lifetime-2026-08'),
  ('b9e2ff04a4ca4a188c35b0a44d1fd788b3b69a2d3a2efad11eacb362467dd8c3', 25, 'lifetime', 'lifetime-2026-08'),
  ('ff1526afcd15ba9ae7ba0ee7681d0135a8b386f51c430a6081eafdcfceca4607', 26, 'lifetime', 'lifetime-2026-08'),
  ('2d1efccab2f007635550c668e41febcb4540d4253b2b0d675b730e2690b5d3a9', 27, 'lifetime', 'lifetime-2026-08'),
  ('3002bb2409121717452a544ae0c57704f017d5dd580af0b4d9e5659cd85c88ee', 28, 'lifetime', 'lifetime-2026-08'),
  ('8aaac6941c3483514f90d596ead28c7b3866614f66cd75c7ace8983f7d4058e8', 29, 'lifetime', 'lifetime-2026-08'),
  ('3fad5860df23db608b5ad10d33d077e48161be79c54cd1de4fcc2d23f0e191ea', 30, 'lifetime', 'lifetime-2026-08'),
  ('99d0b2927ceb52ff30f5ae2b8c82c7a346487dcc9e025f53d0024175fc96823f', 31, 'lifetime', 'lifetime-2026-08'),
  ('3b1462d87c0af8fb5dfcd9da8518379cba73d44296ea067e3b941369c37fa8f3', 32, 'lifetime', 'lifetime-2026-08'),
  ('439e85889b5a34d1ff38dda2432252ee14796c154a5d5107dbb85f71cbec42e7', 33, 'lifetime', 'lifetime-2026-08'),
  ('4f98f32ea1ba847b426f8880b165d493ba9c673ff0510f22925ed98378d630fd', 34, 'lifetime', 'lifetime-2026-08'),
  ('a27f2e9fb67c7548020f62a4057d574d4b93410ef8e19f0c09c16d74c51cc0a1', 35, 'lifetime', 'lifetime-2026-08')
on conflict (code_hash) do nothing;
