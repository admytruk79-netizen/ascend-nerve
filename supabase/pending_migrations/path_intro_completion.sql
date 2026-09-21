-- Account-bound first-run state for the ASCEND Path introduction.
-- Existing path_profiles ownership policies continue to govern SELECT and UPDATE.
alter table public.path_profiles
  add column if not exists onboarding_completed_at timestamptz;
