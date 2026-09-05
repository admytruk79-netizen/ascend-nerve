-- Canonical Phase I completion authority.
-- This supersedes the initial completion function emitted by
-- phase_i_month_practices_school_scale.sql and keeps the server on the same
-- calendar-month definition as the web/Android clients.
create or replace function public.path_record_practice_completion(
  p_stage_id uuid,
  p_practice_id uuid,
  p_duration_seconds integer default null
)
returns jsonb
language plpgsql
set search_path to 'public'
as $$
declare
  v_user uuid:=auth.uid();
  v_progress public.path_student_progress%rowtype;
  v_stage public.path_stages%rowtype;
  v_practice public.path_practices%rowtype;
  v_timezone text:='UTC';
  v_today date;
  v_days integer;
  v_next_stage uuid;
  v_min_seconds integer;
  v_role text;
  v_link_month integer;
  v_current_month integer;
  v_start integer;
  v_end integer;
  v_elapsed integer;
  v_has_current_month_primary boolean;
begin
  if v_user is null then raise exception 'authentication required'; end if;
  if p_duration_seconds is null or p_duration_seconds<=0 then raise exception 'valid practice duration required'; end if;
  if p_duration_seconds>86400 then raise exception 'practice duration exceeds maximum allowed'; end if;

  select coalesce(nullif(timezone,''),'UTC') into v_timezone
  from public.path_profiles
  where user_id=v_user
  limit 1;
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

  select * into v_stage
  from public.path_stages
  where id=p_stage_id and is_published=true;
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

  -- Calendar-month arithmetic is evaluated in the student's stored IANA
  -- timezone so server validation and the student's local curriculum day do
  -- not split at UTC midnight.
  v_elapsed:=greatest(1,
    ((extract(year from v_today)::int-extract(year from (v_progress.started_at at time zone v_timezone)::date)::int)*12)
    +(extract(month from v_today)::int-extract(month from (v_progress.started_at at time zone v_timezone)::date)::int)
    +1
  );
  v_current_month:=least(v_end,v_start+v_elapsed-1);

  select exists(
    select 1 from public.path_stage_practices sp
    where sp.stage_id=p_stage_id
      and sp.role='month_primary'
      and case when sp.frequency_rule ? 'canonical_month'
               then (sp.frequency_rule->>'canonical_month')::int else null end=v_current_month
  ) into v_has_current_month_primary;

  select sp.role,
         case when sp.frequency_rule ? 'canonical_month'
              then (sp.frequency_rule->>'canonical_month')::int else null end
    into v_role,v_link_month
  from public.path_stage_practices sp
  where sp.stage_id=p_stage_id
    and sp.practice_id=p_practice_id
    and sp.role in ('month_primary','primary')
  order by case when sp.role='month_primary' then 0 else 1 end
  limit 1;

  if v_role is null then
    raise exception 'practice is not a Core progression practice for this stage';
  end if;

  if v_has_current_month_primary then
    if v_role<>'month_primary' then
      raise exception 'legacy primary is not valid while current canonical month practice is assigned';
    end if;
    if v_link_month is distinct from v_current_month then
      raise exception 'practice is not the current canonical month practice';
    end if;
  elsif v_role<>'primary' then
    raise exception 'practice cannot satisfy Core progression';
  end if;

  select * into v_practice
  from public.path_practices
  where id=p_practice_id and is_published=true;
  if not found then raise exception 'practice is not published'; end if;

  v_min_seconds:=greatest(300,coalesce(v_practice.default_minutes,10)*30);
  if p_duration_seconds<v_min_seconds then
    raise exception 'practice duration too short: minimum % seconds',v_min_seconds;
  end if;

  insert into public.path_practice_sessions(
    user_id,stage_id,practice_id,started_at,completed_at,duration_seconds,completion_status,metadata
  ) values(
    v_user,p_stage_id,p_practice_id,now()-make_interval(secs=>p_duration_seconds),now(),p_duration_seconds,'completed',
    jsonb_build_object('source','mobile','duration_validated',true,'minimum_seconds',v_min_seconds,'canonical_month',v_current_month,'progression_role',v_role,'stage_status_at_completion',v_progress.status,'timezone',v_timezone)
  );

  v_days:=v_progress.practice_days;
  if v_progress.last_practice_date is distinct from v_today then
    v_days:=v_days+1;
    update public.path_student_progress
       set practice_days=v_days,last_practice_date=v_today
     where id=v_progress.id;
  end if;

  -- Review-mode students keep practicing and recording, but this RPC never
  -- bypasses the pending review by advancing a reviewed stage automatically.
  if v_progress.status='active'
     and v_stage.progression_mode='time'
     and v_days>=v_stage.required_practice_days
     and (v_today-(v_progress.started_at at time zone v_timezone)::date+1)>=v_stage.minimum_days then
    update public.path_student_progress
       set status='established',established_at=coalesce(established_at,now())
     where id=v_progress.id;

    select s.id into v_next_stage
    from public.path_stages s
    join public.path_phases ph on ph.id=s.phase_id
    where s.is_published=true
      and (ph.sort_order>(select sort_order from public.path_phases where id=v_stage.phase_id)
        or (ph.id=v_stage.phase_id and s.sort_order>v_stage.sort_order))
    order by ph.sort_order,s.sort_order
    limit 1;

    if v_next_stage is not null then
      insert into public.path_student_progress(user_id,stage_id,status,practice_days,notes)
      values(v_user,v_next_stage,'active',0,'{}'::jsonb)
      on conflict do nothing;
      update public.path_profiles
         set current_stage_id=v_next_stage,updated_at=now()
       where user_id=v_user;
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
    'curriculum_date',v_today,
    'timezone',v_timezone
  );
end;
$$;