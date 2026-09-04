-- Branch repetition idempotency contract.
-- Deploy before or atomically with frontend callers that send p_request_id.

alter table public.training_branch_repetition_log
  add column if not exists request_id uuid;

create unique index if not exists training_branch_repetition_log_request_once
  on public.training_branch_repetition_log(user_id,module_id,request_id)
  where request_id is not null;

create or replace function public.record_branch_repetition(
  p_module_id uuid,
  p_safety_ack boolean default false,
  p_request_id uuid default null
)
returns table(module_id uuid,repetitions integer,status text,completed_at timestamptz)
language plpgsql
security definer
set search_path=public
as $$
declare
  v_user uuid := auth.uid();
  v_module public.training_branch_modules%rowtype;
  v_prev uuid;
  v_prev_done boolean;
  v_parent uuid;
  v_parent_started boolean;
  v_rep integer;
  v_status text;
  v_completed timestamptz;
  v_progress public.training_branch_progress%rowtype;
  v_applied boolean;
  v_requires_readiness boolean;
  v_spacing integer;
  v_log_id uuid;
begin
  if v_user is null then raise exception 'Authentication required'; end if;

  select * into v_module
  from public.training_branch_modules
  where id=p_module_id and is_published=true;
  if not found then raise exception 'Module unavailable'; end if;

  if v_module.safety_level='enhanced' and not p_safety_ack then
    raise exception 'Safety acknowledgement required';
  end if;

  v_applied := coalesce((v_module.metadata->>'applied_parallel')::boolean,false);
  v_requires_readiness := coalesce((v_module.metadata->>'requires_readiness')::boolean,false);
  v_spacing := greatest(0,coalesce((v_module.metadata->>'minimum_spacing_days')::integer,0));

  if v_applied then
    select id into v_parent
    from public.training_branch_modules
    where branch_id=v_module.branch_id
      and module_number<v_module.module_number
      and not coalesce((metadata->>'applied_parallel')::boolean,false)
    order by module_number desc limit 1;
    if v_parent is not null then
      select exists(
        select 1 from public.training_branch_progress
        where user_id=v_user and module_id=v_parent and repetitions>0
      ) into v_parent_started;
      if not v_parent_started then
        raise exception 'Begin the parent primary practice before its applied-life exercise';
      end if;
    end if;
  else
    select id into v_prev
    from public.training_branch_modules
    where branch_id=v_module.branch_id
      and module_number<v_module.module_number
      and not coalesce((metadata->>'applied_parallel')::boolean,false)
    order by module_number desc limit 1;
    if v_prev is not null then
      select exists(
        select 1 from public.training_branch_progress
        where user_id=v_user and module_id=v_prev and status='completed'
      ) into v_prev_done;
      if not v_prev_done then
        raise exception 'Previous primary module must be completed through its readiness gate first';
      end if;
    end if;
  end if;

  if p_request_id is not null then
    select l.id into v_log_id
    from public.training_branch_repetition_log l
    where l.user_id=v_user and l.module_id=v_module.id and l.request_id=p_request_id;
    if found then
      select p.repetitions,p.status,p.completed_at into v_rep,v_status,v_completed
      from public.training_branch_progress p
      where p.user_id=v_user and p.module_id=v_module.id;
      return query select v_module.id,coalesce(v_rep,0),coalesce(v_status,'not_started'),v_completed;
      return;
    end if;
  end if;

  select * into v_progress
  from public.training_branch_progress
  where user_id=v_user and module_id=v_module.id
  for update;

  if found and v_spacing>0 and v_progress.last_repetition_at is not null
     and now() < v_progress.last_repetition_at + make_interval(days=>v_spacing) then
    raise exception 'This practice has a source-defined spacing requirement of % day(s)',v_spacing;
  end if;

  insert into public.training_branch_repetition_log(user_id,branch_id,module_id,safety_ack,request_id,metadata)
  values(v_user,v_module.branch_id,v_module.id,p_safety_ack,p_request_id,jsonb_build_object('source','primary_path_engine'))
  on conflict (user_id,module_id,request_id) where request_id is not null do nothing
  returning id into v_log_id;

  if p_request_id is not null and v_log_id is null then
    select p.repetitions,p.status,p.completed_at into v_rep,v_status,v_completed
    from public.training_branch_progress p
    where p.user_id=v_user and p.module_id=v_module.id;
    return query select v_module.id,coalesce(v_rep,0),coalesce(v_status,'not_started'),v_completed;
    return;
  end if;

  insert into public.training_branch_progress(
    user_id,branch_id,module_id,repetitions,status,started_at,updated_at,last_repetition_at,readiness_state
  ) values(
    v_user,v_module.branch_id,v_module.id,1,
    case
      when v_module.minimum_repetitions<=1 and not v_requires_readiness then 'completed'
      when v_module.minimum_repetitions<=1 then 'review'
      else 'in_progress'
    end,
    now(),now(),now(),'not_yet'
  )
  on conflict(user_id,module_id) do update
  set repetitions=public.training_branch_progress.repetitions+1,
      status=case
        when public.training_branch_progress.repetitions+1>=v_module.minimum_repetitions and v_requires_readiness then 'review'
        when public.training_branch_progress.repetitions+1>=v_module.minimum_repetitions then 'completed'
        else 'in_progress'
      end,
      completed_at=case
        when public.training_branch_progress.repetitions+1>=v_module.minimum_repetitions and not v_requires_readiness
          then coalesce(public.training_branch_progress.completed_at,now())
        else public.training_branch_progress.completed_at
      end,
      updated_at=now(),
      last_repetition_at=now();

  update public.training_branch_progress
  set completed_at=coalesce(completed_at,now())
  where user_id=v_user and module_id=v_module.id and status='completed';

  select p.repetitions,p.status,p.completed_at into v_rep,v_status,v_completed
  from public.training_branch_progress p
  where p.user_id=v_user and p.module_id=v_module.id;

  return query select v_module.id,v_rep,v_status,v_completed;
end;
$$;

revoke all on function public.record_branch_repetition(uuid,boolean,uuid) from public;
revoke all on function public.record_branch_repetition(uuid,boolean,uuid) from anon;
grant execute on function public.record_branch_repetition(uuid,boolean,uuid) to authenticated;
grant execute on function public.record_branch_repetition(uuid,boolean,uuid) to service_role;
