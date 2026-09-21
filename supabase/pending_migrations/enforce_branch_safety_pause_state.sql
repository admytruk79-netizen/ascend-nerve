-- Enforce the existing persisted branch safety_state at the server boundary.
-- Paused/recovering modules cannot record new repetitions until the student
-- explicitly returns to caution/stable. Safety changes are logged separately.

create or replace function public.enforce_branch_repetition_safety_state()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_state text;
begin
  if coalesce(new.metadata->>'type','') = 'safety_state_change' then
    return new;
  end if;

  select p.safety_state into v_state
  from public.training_branch_progress p
  where p.user_id = new.user_id and p.module_id = new.module_id;

  if coalesce(v_state,'stable') in ('pause','recover') then
    raise exception 'Practice is paused for stabilization. Resume only when safety state returns to stable or caution.';
  end if;

  return new;
end;
$$;

drop trigger if exists training_branch_repetition_safety_gate on public.training_branch_repetition_log;
create trigger training_branch_repetition_safety_gate
before insert on public.training_branch_repetition_log
for each row execute function public.enforce_branch_repetition_safety_state();

create or replace function public.set_branch_safety_state(
  p_module_id uuid,
  p_state text,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_module public.training_branch_modules%rowtype;
  v_state text := lower(coalesce(p_state,''));
  v_progress public.training_branch_progress%rowtype;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  if v_state not in ('stable','caution','pause','recover') then raise exception 'Invalid safety state'; end if;

  select * into v_module
  from public.training_branch_modules
  where id=p_module_id and is_published=true;
  if not found then raise exception 'Module unavailable'; end if;

  insert into public.training_branch_progress(user_id,branch_id,module_id,repetitions,status,safety_state,updated_at)
  values(v_user,v_module.branch_id,v_module.id,0,'available',v_state,now())
  on conflict(user_id,module_id) do update
    set safety_state=v_state, updated_at=now()
  returning * into v_progress;

  insert into public.training_branch_repetition_log(user_id,branch_id,module_id,safety_ack,metadata)
  values(v_user,v_module.branch_id,v_module.id,false,
    jsonb_build_object('type','safety_state_change','state',v_state,'note',p_note));

  return jsonb_build_object(
    'module_id',v_module.id,
    'safety_state',v_state,
    'message',case v_state
      when 'pause' then 'Practice paused. Return to stabilization before resuming.'
      when 'recover' then 'Recovery state active. Keep practice reduced until stable.'
      when 'caution' then 'Caution state active. Proceed only conservatively.'
      else 'Safety state stable.' end
  );
end;
$$;

revoke all on function public.set_branch_safety_state(uuid,text,text) from public, anon;
grant execute on function public.set_branch_safety_state(uuid,text,text) to authenticated, service_role;
