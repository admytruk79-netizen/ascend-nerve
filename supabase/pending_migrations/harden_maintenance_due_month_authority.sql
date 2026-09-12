-- Do not trust a client-supplied month when deciding which maintenance work is due.
-- The signature is retained for backward compatibility, but the authoritative month
-- is derived from the signed-in student's active Core stage and elapsed stage time.

create or replace function public.path_get_maintenance_due(p_month integer)
returns table(
  assignment_id uuid,
  title text,
  instruction text,
  cadence text,
  source_month integer,
  target_count integer,
  completed_count integer,
  due_now boolean,
  period_label text
)
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_uid uuid := auth.uid();
  v_assignment public.path_training_assignments%rowtype;
  v_progress public.path_student_progress%rowtype;
  v_stage public.path_stages%rowtype;
  v_current_month integer;
  v_elapsed_month integer;
  v_target integer;
  v_start date;
  v_end date;
  v_count integer;
begin
  if v_uid is null then raise exception 'Sign in required'; end if;

  select * into v_progress
  from public.path_student_progress
  where user_id=v_uid and status in ('active','review')
  order by started_at desc
  limit 1;
  if not found then raise exception 'No active stage'; end if;

  select * into v_stage
  from public.path_stages
  where id=v_progress.stage_id and is_published=true;
  if not found then raise exception 'Active stage unavailable'; end if;

  if v_stage.sort_order <= 7 then
    v_current_month := v_stage.sort_order;
  else
    v_elapsed_month := greatest(1,
      extract(year from age(current_date, v_progress.started_at::date))::int * 12
      + extract(month from age(current_date, v_progress.started_at::date))::int + 1);
    if v_stage.sort_order = 8 then
      v_current_month := least(18, 8 + v_elapsed_month - 1);
    else
      v_current_month := least(24, 19 + v_elapsed_month - 1);
    end if;
  end if;

  select * into v_assignment
  from public.path_training_assignments a
  where a.is_published=true
    and a.assignment_type='maintenance'
    and a.stage_id=v_stage.id
    and coalesce((a.metadata->>'month_number')::integer,0) <= v_current_month
  order by (a.metadata->>'month_number')::integer desc, a.sort_order desc
  limit 1;

  if v_assignment.id is null then return; end if;

  if v_assignment.cadence ~* '^([0-9]+)x/week$' then
    v_target := substring(v_assignment.cadence from '^([0-9]+)')::integer;
    v_start := date_trunc('week', current_date)::date;
    v_end := v_start + 6;
    period_label := 'this week';
  elsif v_assignment.cadence ilike 'daily rotation' then
    v_target := 7;
    v_start := date_trunc('week', current_date)::date;
    v_end := v_start + 6;
    period_label := 'this week';
  elsif v_assignment.cadence ilike '%monthly%' then
    v_target := 1;
    v_start := date_trunc('month', current_date)::date;
    v_end := (date_trunc('month', current_date) + interval '1 month - 1 day')::date;
    period_label := 'this month';
  else
    v_target := 1;
    v_start := date_trunc('week', current_date)::date;
    v_end := v_start + 6;
    period_label := 'this week';
  end if;

  select count(*) into v_count
  from public.path_training_assignment_logs l
  where l.user_id=v_uid
    and l.assignment_id=v_assignment.id
    and l.log_date between v_start and v_end
    and l.status in ('practiced','completed');

  assignment_id := v_assignment.id;
  title := v_assignment.title;
  instruction := v_assignment.instruction;
  cadence := v_assignment.cadence;
  source_month := coalesce((v_assignment.metadata->>'month_number')::integer,1);
  target_count := v_target;
  completed_count := v_count;
  due_now := v_count < v_target;
  return next;
end;
$$;

revoke all on function public.path_get_maintenance_due(integer) from public, anon;
grant execute on function public.path_get_maintenance_due(integer) to authenticated, service_role;
