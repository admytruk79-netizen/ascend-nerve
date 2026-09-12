-- Do not consume a second tester key when an account already has lifetime access.
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
