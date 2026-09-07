-- Canonical Phase I practice-session authority.
-- The server owns session start, completion, abandonment, canonical practice scope,
-- and stale-session lifecycle without trusting arbitrary client timestamps.

create table if not exists public.path_practice_session_starts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  stage_id uuid not null references public.path_stages(id) on delete cascade,
  practice_id uuid not null references public.path_practices(id) on delete cascade,
  started_at timestamptz not null default now(),
  canonical_month integer not null check (canonical_month between 1 and 24),
  curriculum_date date not null,
  timezone text not null default 'UTC',
  completed_at timestamptz,
  abandoned_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

alter table public.path_practice_session_starts
  add column if not exists abandoned_at timestamptz;

create index if not exists path_practice_session_starts_user_open_idx
  on public.path_practice_session_starts(user_id,completed_at,started_at desc);

create index if not exists path_practice_session_starts_stale_open_idx
  on public.path_practice_session_starts(started_at)
  where completed_at is null and abandoned_at is null;

revoke all on public.path_practice_session_starts from anon,authenticated;

create or replace function public.path_cleanup_stale_practice_sessions()
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_count integer;
begin
  update public.path_practice_session_starts
     set abandoned_at=coalesce(abandoned_at,now()),
         metadata=coalesce(metadata,'{}'::jsonb)||jsonb_build_object('abandon_reason','stale_timeout')
   where completed_at is null
     and abandoned_at is null
     and started_at<now()-interval '48 hours';
  get diagnostics v_count=row_count;
  return v_count;
end;
$$;

revoke all on function public.path_cleanup_stale_practice_sessions() from public;

create or replace function public.path_begin_practice_session(
  p_stage_id uuid,
  p_practice_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_user uuid:=auth.uid();
  v_progress public.path_student_progress%rowtype;
  v_stage public.path_stages%rowtype;
  v_timezone text:='UTC';
  v_today date;
  v_start integer;
  v_end integer;
  v_elapsed integer;
  v_current_month integer;
  v_role text;
  v_link_month integer;
  v_has_current_month_primary boolean;
  v_session_id uuid;
begin
  if v_user is null then raise exception 'authentication required'; end if;

  -- Any student's begin can retire globally stale starts. Cleanup therefore does
  -- not depend on the same user ever returning to the app.
  perform public.path_cleanup_stale_practice_sessions();

  select coalesce(nullif(timezone,''),'UTC') into v_timezone
  from public.path_profiles where user_id=v_user limit 1;
  if not found then v_timezone:='UTC'; end if;
  begin
    perform now() at time zone v_timezone;
  exception when invalid_parameter_value then
    v_timezone:='UTC';
  end;
  v_today:=(now() at time zone v_timezone)::date;

  select * into v_progress
  from public.path_student_progress
  where user_id=v_user and stage_id=p_stage_id and status in ('active','review')
  for update;
  if not found then raise exception 'stage is not active or in review for this student'; end if;

  select * into v_stage from public.path_stages where id=p_stage_id and is_published=true;
  if not found then raise exception 'stage is not published'; end if;

  v_start:=case
    when (v_stage.metadata->>'month_start') is not null then (v_stage.metadata->>'month_start')::int
    when v_stage.sort_order<=7 then v_stage.sort_order
    when v_stage.sort_order=8 then 8
    else 19
  end;
  v_end:=case
    when (v_stage.metadata->>'month_end') is not null then (v_stage.metadata->>'month_end')::int
    when v_stage.sort_order<=7 then v_stage.sort_order
    when v_stage.sort_order=8 then 18
    else 24
  end;
  v_elapsed:=greatest(1,
    ((extract(year from v_today)::int-extract(year from (v_progress.started_at at time zone v_timezone)::date)::int)*12)
    +(extract(month from v_today)::int-extract(month from (v_progress.started_at at time zone v_timezone)::date)::int)+1
  );
  v_current_month:=least(v_end,v_start+v_elapsed-1);

  select exists(
    select 1 from public.path_stage_practices sp
    where sp.stage_id=p_stage_id and sp.role='month_primary'
      and case when sp.frequency_rule ? 'canonical_month'
               then (sp.frequency_rule->>'canonical_month')::int else null end=v_current_month
  ) into v_has_current_month_primary;

  select sp.role,
         case when sp.frequency_rule ? 'canonical_month'
              then (sp.frequency_rule->>'canonical_month')::int else null end
    into v_role,v_link_month
  from public.path_stage_practices sp
  where sp.stage_id=p_stage_id and sp.practice_id=p_practice_id
    and sp.role in ('month_primary','primary')
  order by case when sp.role='month_primary' then 0 else 1 end
  limit 1;

  if v_role is null then raise exception 'practice is not a Core progression practice for this stage'; end if;
  if v_has_current_month_primary then
    if v_role<>'month_primary' or v_link_month is distinct from v_current_month then
      raise exception 'practice is not the current canonical month practice';
    end if;
  elsif v_role<>'primary' then
    raise exception 'practice cannot satisfy Core progression';
  end if;

  if not exists(select 1 from public.path_practices where id=p_practice_id and is_published=true) then
    raise exception 'practice is not published';
  end if;

  insert into public.path_practice_session_starts(
    user_id,stage_id,practice_id,canonical_month,curriculum_date,timezone,metadata
  ) values(
    v_user,p_stage_id,p_practice_id,v_current_month,v_today,v_timezone,
    jsonb_build_object('source','mobile','progression_role',v_role)
  ) returning id into v_session_id;

  return jsonb_build_object(
    'session_id',v_session_id,
    'stage_id',p_stage_id,
    'practice_id',p_practice_id,
    'canonical_month',v_current_month,
    'curriculum_date',v_today,
    'timezone',v_timezone
  );
end;
$$;

revoke all on function public.path_begin_practice_session(uuid,uuid) from public;
grant execute on function public.path_begin_practice_session(uuid,uuid) to authenticated;

create or replace function public.path_abandon_practice_session(p_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_user uuid:=auth.uid();
  v_session public.path_practice_session_starts%rowtype;
begin
  if v_user is null then raise exception 'authentication required'; end if;
  if p_session_id is null then raise exception 'server practice session required'; end if;

  select * into v_session
  from public.path_practice_session_starts
  where id=p_session_id and user_id=v_user
  for update;
  if not found then raise exception 'practice session not found'; end if;

  if v_session.completed_at is not null then
    return jsonb_build_object('session_id',v_session.id,'completed',true,'abandoned',false);
  end if;

  if v_session.abandoned_at is null then
    update public.path_practice_session_starts
       set abandoned_at=now(),
           metadata=coalesce(metadata,'{}'::jsonb)||jsonb_build_object('abandon_reason','client_exit')
     where id=v_session.id;
  end if;

  return jsonb_build_object('session_id',v_session.id,'completed',false,'abandoned',true);
end;
$$;

revoke all on function public.path_abandon_practice_session(uuid) from public;
grant execute on function public.path_abandon_practice_session(uuid) to authenticated;

create or replace function public.path_record_practice_completion(
  p_stage_id uuid,
  p_practice_id uuid,
  p_duration_seconds integer default null,
  p_session_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_user uuid:=auth.uid();
  v_progress public.path_student_progress%rowtype;
  v_stage public.path_stages%rowtype;
  v_practice public.path_practices%rowtype;
  v_session public.path_practice_session_starts%rowtype;
  v_recorded public.path_practice_sessions%rowtype;
  v_timezone text:='UTC';
  v_today date;
  v_days integer;
  v_next_stage uuid;
  v_current_stage uuid;
  v_min_seconds integer;
  v_role text;
  v_link_month integer;
  v_current_month integer;
  v_start integer;
  v_end integer;
  v_elapsed integer;
begin
  if v_user is null then raise exception 'authentication required'; end if;
  if p_session_id is null then raise exception 'server practice session required'; end if;
  if p_duration_seconds is null or p_duration_seconds<=0 then raise exception 'valid practice duration required'; end if;
  if p_duration_seconds>86400 then raise exception 'practice duration exceeds maximum allowed'; end if;

  select * into v_session
  from public.path_practice_session_starts
  where id=p_session_id and user_id=v_user
  for update;
  if not found then raise exception 'practice session not found'; end if;
  if v_session.stage_id is distinct from p_stage_id or v_session.practice_id is distinct from p_practice_id then
    raise exception 'practice session scope mismatch';
  end if;

  -- Idempotent recovery: if the authoritative completion committed but the RPC
  -- response was lost, return the recorded result instead of mutating progress again.
  if v_session.completed_at is not null then
    select * into v_recorded
    from public.path_practice_sessions
    where user_id=v_user
      and stage_id=p_stage_id
      and practice_id=p_practice_id
      and completion_status='completed'
      and metadata->>'server_session_id'=v_session.id::text
    order by completed_at desc
    limit 1;
    if not found then raise exception 'completed practice session has no authoritative completion record'; end if;
    if v_recorded.duration_seconds is distinct from p_duration_seconds then
      raise exception 'practice completion retry duration mismatch';
    end if;

    v_timezone:=coalesce(nullif(v_session.timezone,''),'UTC');
    begin
      perform now() at time zone v_timezone;
    exception when invalid_parameter_value then
      raise exception 'practice session timezone is invalid';
    end;

    select * into v_progress
    from public.path_student_progress
    where user_id=v_user and stage_id=p_stage_id
    limit 1;
    select current_stage_id into v_current_stage from public.path_profiles where user_id=v_user limit 1;

    return jsonb_build_object(
      'practice_days',coalesce(v_progress.practice_days,0),
      'stage_id',p_stage_id,
      'stage_status',v_progress.status,
      'current_stage_id',v_current_stage,
      'duration_validated',true,
      'minimum_duration_seconds',coalesce((v_recorded.metadata->>'minimum_seconds')::int,300),
      'canonical_month',coalesce((v_recorded.metadata->>'completion_canonical_month')::int,v_session.canonical_month),
      'session_canonical_month',v_session.canonical_month,
      'curriculum_date',(v_recorded.completed_at at time zone v_timezone)::date,
      'timezone',v_timezone
    );
  end if;

  if v_session.abandoned_at is not null then raise exception 'practice session abandoned'; end if;
  if v_session.started_at<now()-interval '48 hours' then
    update public.path_practice_session_starts
       set abandoned_at=coalesce(abandoned_at,now()),
           metadata=coalesce(metadata,'{}'::jsonb)||jsonb_build_object('abandon_reason','stale_timeout')
     where id=v_session.id;
    raise exception 'practice session expired';
  end if;

  v_timezone:=coalesce(nullif(v_session.timezone,''),'UTC');
  begin
    perform now() at time zone v_timezone;
  exception when invalid_parameter_value then
    raise exception 'practice session timezone is invalid';
  end;
  v_today:=(now() at time zone v_timezone)::date;

  select * into v_progress
  from public.path_student_progress
  where user_id=v_user and stage_id=p_stage_id and status in ('active','review')
  for update;
  if not found then raise exception 'stage is not active or in review for this student'; end if;

  select * into v_stage from public.path_stages where id=p_stage_id and is_published=true;
  if not found then raise exception 'stage is not published'; end if;

  v_start:=case
    when (v_stage.metadata->>'month_start') is not null then (v_stage.metadata->>'month_start')::int
    when v_stage.sort_order<=7 then v_stage.sort_order
    when v_stage.sort_order=8 then 8
    else 19
  end;
  v_end:=case
    when (v_stage.metadata->>'month_end') is not null then (v_stage.metadata->>'month_end')::int
    when v_stage.sort_order<=7 then v_stage.sort_order
    when v_stage.sort_order=8 then 18
    else 24
  end;
  v_elapsed:=greatest(1,
    ((extract(year from v_today)::int-extract(year from (v_progress.started_at at time zone v_timezone)::date)::int)*12)
    +(extract(month from v_today)::int-extract(month from (v_progress.started_at at time zone v_timezone)::date)::int)+1
  );
  v_current_month:=least(v_end,v_start+v_elapsed-1);

  select sp.role,
         case when sp.frequency_rule ? 'canonical_month'
              then (sp.frequency_rule->>'canonical_month')::int else null end
    into v_role,v_link_month
  from public.path_stage_practices sp
  where sp.stage_id=p_stage_id and sp.practice_id=p_practice_id
    and sp.role in ('month_primary','primary')
  order by case when sp.role='month_primary' then 0 else 1 end
  limit 1;
  if v_role is null then raise exception 'practice is not a Core progression practice for this stage'; end if;
  if v_role='month_primary' and v_link_month is distinct from v_session.canonical_month then
    raise exception 'practice does not match server-start canonical month';
  end if;

  select * into v_practice from public.path_practices where id=p_practice_id and is_published=true;
  if not found then raise exception 'practice is not published'; end if;
  v_min_seconds:=greatest(300,coalesce(v_practice.default_minutes,10)*30);
  if p_duration_seconds<v_min_seconds then
    raise exception 'practice duration too short: minimum % seconds',v_min_seconds;
  end if;
  if extract(epoch from (now()-v_session.started_at))+5<p_duration_seconds then
    raise exception 'practice duration exceeds elapsed server session time';
  end if;

  insert into public.path_practice_sessions(
    user_id,stage_id,practice_id,started_at,completed_at,duration_seconds,completion_status,metadata
  ) values(
    v_user,p_stage_id,p_practice_id,v_session.started_at,now(),p_duration_seconds,'completed',
    jsonb_build_object(
      'source','mobile',
      'server_session_id',v_session.id,
      'duration_validated',true,
      'minimum_seconds',v_min_seconds,
      'canonical_month',v_session.canonical_month,
      'completion_canonical_month',v_current_month,
      'progression_role',v_role,
      'stage_status_at_completion',v_progress.status,
      'timezone',v_timezone
    )
  );
  update public.path_practice_session_starts
     set completed_at=now(),abandoned_at=null
   where id=v_session.id;

  v_days:=v_progress.practice_days;
  if v_progress.last_practice_date is distinct from v_today then
    v_days:=v_days+1;
    update public.path_student_progress set practice_days=v_days,last_practice_date=v_today where id=v_progress.id;
  end if;

  if v_progress.status='active'
     and v_stage.progression_mode='time'
     and v_days>=v_stage.required_practice_days
     and (v_today-(v_progress.started_at at time zone v_timezone)::date+1)>=v_stage.minimum_days then
    update public.path_student_progress
       set status='established',established_at=coalesce(established_at,now()) where id=v_progress.id;

    select s.id into v_next_stage
    from public.path_stages s join public.path_phases ph on ph.id=s.phase_id
    where s.is_published=true
      and (ph.sort_order>(select sort_order from public.path_phases where id=v_stage.phase_id)
        or (ph.id=v_stage.phase_id and s.sort_order>v_stage.sort_order))
    order by ph.sort_order,s.sort_order limit 1;
    if v_next_stage is not null then
      insert into public.path_student_progress(user_id,stage_id,status,practice_days,notes)
      values(v_user,v_next_stage,'active',0,'{}'::jsonb) on conflict do nothing;
      update public.path_profiles set current_stage_id=v_next_stage,updated_at=now() where user_id=v_user;
    end if;
  end if;

  return jsonb_build_object(
    'practice_days',v_days,
    'stage_id',p_stage_id,
    'stage_status',(select status from public.path_student_progress where id=v_progress.id),
    'current_stage_id',(select current_stage_id from public.path_profiles where user_id=v_user),
    'duration_validated',true,
    'minimum_duration_seconds',v_min_seconds,
    'canonical_month',v_current_month,
    'session_canonical_month',v_session.canonical_month,
    'curriculum_date',v_today,
    'timezone',v_timezone
  );
end;
$$;

revoke all on function public.path_record_practice_completion(uuid,uuid,integer,uuid) from public;
grant execute on function public.path_record_practice_completion(uuid,uuid,integer,uuid) to authenticated;
