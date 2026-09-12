-- Canonical curriculum boundary:
-- Phase I is the 24-month Core Formation. Phase II is the separate
-- sphere-of-attention advanced sequence and cannot begin until the final
-- Phase I stage is established through the authoritative readiness flow.

create or replace function public.path_phase_ii_access()
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_last_stage uuid;
  v_status text;
begin
  if v_user is null then
    return jsonb_build_object('allowed', false, 'reason', 'authentication_required');
  end if;

  select id into v_last_stage
  from public.path_stages
  where is_published = true
  order by sort_order desc
  limit 1;

  if v_last_stage is null then
    return jsonb_build_object('allowed', false, 'reason', 'phase_i_unavailable');
  end if;

  select status into v_status
  from public.path_student_progress
  where user_id = v_user and stage_id = v_last_stage
  limit 1;

  return jsonb_build_object(
    'allowed', coalesce(v_status = 'established', false),
    'reason', case when v_status = 'established' then 'open_gate_established' else 'phase_i_open_gate_required' end,
    'final_stage_id', v_last_stage,
    'final_stage_status', v_status
  );
end;
$$;

revoke all on function public.path_phase_ii_access() from public;
revoke all on function public.path_phase_ii_access() from anon;
grant execute on function public.path_phase_ii_access() to authenticated;
grant execute on function public.path_phase_ii_access() to service_role;

create or replace function public.enforce_phase_ii_open_gate_on_branch_log()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_slug text;
  v_last_stage uuid;
  v_status text;
begin
  select slug into v_slug
  from public.training_branches
  where id = new.branch_id;

  if v_slug <> 'sphere-of-attention' then
    return new;
  end if;

  select id into v_last_stage
  from public.path_stages
  where is_published = true
  order by sort_order desc
  limit 1;

  select status into v_status
  from public.path_student_progress
  where user_id = new.user_id and stage_id = v_last_stage
  limit 1;

  if v_status is distinct from 'established' then
    raise exception 'Phase II opens only after the Phase I Open Gate is established';
  end if;

  return new;
end;
$$;

drop trigger if exists training_branch_phase_ii_open_gate on public.training_branch_repetition_log;
create trigger training_branch_phase_ii_open_gate
before insert on public.training_branch_repetition_log
for each row
execute function public.enforce_phase_ii_open_gate_on_branch_log();
