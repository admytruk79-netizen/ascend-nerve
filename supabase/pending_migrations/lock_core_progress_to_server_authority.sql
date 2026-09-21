-- Core progression is authoritative on the server. The browser/native client may
-- read its rows and bootstrap only the canonical first stage. All later status,
-- day-count, review and stage mutations happen through SECURITY DEFINER RPCs.

drop policy if exists "own path progress" on public.path_student_progress;
drop policy if exists "read own path progress" on public.path_student_progress;
drop policy if exists "bootstrap own path progress" on public.path_student_progress;

create policy "read own path progress"
on public.path_student_progress
for select
to authenticated
using (auth.uid() = user_id);

create policy "bootstrap own path progress"
on public.path_student_progress
for insert
to authenticated
with check (
  auth.uid() = user_id
  and status = 'active'
  and practice_days = 0
  and review_requested_at is null
  and established_at is null
  and last_practice_date is null
  and stage_id = (select s.id from public.path_stages s where s.slug='entry-seven-days' limit 1)
);

revoke all privileges on table public.path_student_progress from anon, authenticated;
grant select, insert on table public.path_student_progress to authenticated;
