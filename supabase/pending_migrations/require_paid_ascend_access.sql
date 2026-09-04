-- ASCEND Path is paid-only. Curriculum reads require either an active Premium
-- entitlement, a Lifetime entitlement, or teacher standing (path_teachers) --
-- a teacher reviewing shared journal entries and submitting stage guidance is
-- staff, not a customer, and should not be paywalled out of the curriculum
-- their own students are working through. Authentication alone is not access.
--
-- Depends on public.path_teachers existing (see teacher_provisioning.sql) --
-- apply that migration first, or together with this one.

alter table public.ascend_entitlements
  drop constraint if exists ascend_entitlements_access_level_check;

alter table public.ascend_entitlements
  add constraint ascend_entitlements_access_level_check
  check (access_level in ('premium', 'lifetime'));

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.has_ascend_paid_access()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    exists (
      select 1
      from public.ascend_entitlements e
      where e.user_id = (select auth.uid())
        and e.is_active
        and (
          e.access_level = 'lifetime'
          or (
            e.access_level = 'premium'
            and e.expires_at is not null
            and e.expires_at > now()
          )
        )
    )
    or exists (
      select 1 from public.path_teachers t where t.user_id = (select auth.uid())
    );
$$;

revoke all on function private.has_ascend_paid_access() from public, anon;
grant execute on function private.has_ascend_paid_access() to authenticated, service_role;

drop policy if exists "path markers readable" on public.path_attainment_markers;
drop policy if exists "path markers readable by visitors" on public.path_attainment_markers;
create policy "paid members can read path markers"
  on public.path_attainment_markers for select to authenticated
  using ((select private.has_ascend_paid_access()));

drop policy if exists "path content readable" on public.path_content_items;
drop policy if exists "published path content readable by visitors" on public.path_content_items;
create policy "paid members can read path content"
  on public.path_content_items for select to authenticated
  using (is_published and (select private.has_ascend_paid_access()));

drop policy if exists "path unlock rules readable" on public.path_content_unlock_rules;
drop policy if exists "path unlock rules readable by visitors" on public.path_content_unlock_rules;
create policy "paid members can read path unlock rules"
  on public.path_content_unlock_rules for select to authenticated
  using ((select private.has_ascend_paid_access()));

drop policy if exists "path curriculum phases readable" on public.path_phases;
drop policy if exists "published path phases readable by visitors" on public.path_phases;
create policy "paid members can read path phases"
  on public.path_phases for select to authenticated
  using (is_published and (select private.has_ascend_paid_access()));

drop policy if exists "path practices readable" on public.path_practices;
drop policy if exists "path practices readable by visitors" on public.path_practices;
create policy "paid members can read path practices"
  on public.path_practices for select to authenticated
  using (is_published and (select private.has_ascend_paid_access()));

drop policy if exists "path stage practice links readable by visitors" on public.path_stage_practices;
drop policy if exists "path stage practices readable" on public.path_stage_practices;
create policy "paid members can read stage practice links"
  on public.path_stage_practices for select to authenticated
  using ((select private.has_ascend_paid_access()));

drop policy if exists "path curriculum stages readable" on public.path_stages;
drop policy if exists "published path stages readable by visitors" on public.path_stages;
create policy "paid members can read path stages"
  on public.path_stages for select to authenticated
  using (is_published and (select private.has_ascend_paid_access()));

drop policy if exists "published path training readable by visitors" on public.path_training_assignments;
drop policy if exists "training_assignments_read" on public.path_training_assignments;
create policy "paid members can read training assignments"
  on public.path_training_assignments for select to authenticated
  using (is_published and (select private.has_ascend_paid_access()));

drop policy if exists "published branch modules readable by students" on public.training_branch_modules;
drop policy if exists "published branch modules readable by visitors" on public.training_branch_modules;
create policy "paid members can read branch modules"
  on public.training_branch_modules for select to authenticated
  using (is_published and (select private.has_ascend_paid_access()));

drop policy if exists "published branches readable" on public.training_branches;
create policy "paid members can read branches"
  on public.training_branches for select to authenticated
  using (is_published and (select private.has_ascend_paid_access()));
