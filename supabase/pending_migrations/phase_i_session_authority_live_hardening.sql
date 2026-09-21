-- Keeps the live Phase I completion contract session-bound even for older clients.
-- The 3-argument completion RPC is retained only as a compatibility bridge: it
-- resolves the authenticated student's current open server session and delegates
-- to the authoritative 4-argument completion RPC.

create or replace function public.path_record_practice_completion(
  p_stage_id uuid,
  p_practice_id uuid,
  p_duration_seconds integer default null
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_user uuid:=auth.uid();
  v_session_id uuid;
begin
  if v_user is null then raise exception 'authentication required'; end if;

  select id into v_session_id
  from public.path_practice_session_starts
  where user_id=v_user
    and stage_id=p_stage_id
    and practice_id=p_practice_id
    and completed_at is null
    and abandoned_at is null
  order by started_at desc
  limit 1;

  if v_session_id is null then raise exception 'server practice session required'; end if;

  return public.path_record_practice_completion(
    p_stage_id,
    p_practice_id,
    p_duration_seconds,
    v_session_id
  );
end;
$$;

-- CREATE OR REPLACE preserves an existing function ACL, so revoke anon
-- explicitly rather than relying only on revoking PUBLIC.
revoke execute on function public.path_cleanup_stale_practice_sessions() from anon, authenticated;
revoke execute on function public.path_begin_practice_session(uuid,uuid) from anon;
revoke execute on function public.path_abandon_practice_session(uuid) from anon;
revoke execute on function public.path_record_practice_completion(uuid,uuid,integer) from anon;
revoke execute on function public.path_record_practice_completion(uuid,uuid,integer,uuid) from anon;

grant execute on function public.path_begin_practice_session(uuid,uuid) to authenticated;
grant execute on function public.path_abandon_practice_session(uuid) to authenticated;
grant execute on function public.path_record_practice_completion(uuid,uuid,integer) to authenticated;
grant execute on function public.path_record_practice_completion(uuid,uuid,integer,uuid) to authenticated;
