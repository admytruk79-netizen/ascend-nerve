-- Branch and Phase II progression is server-authoritative.
-- Clients may read their own progress, but all mutations must pass through
-- SECURITY DEFINER RPCs that enforce sequence, readiness, safety acknowledgement,
-- spacing, idempotency, and the Phase II Open Gate.

drop policy if exists "users insert own branch progress" on public.training_branch_progress;
drop policy if exists "users update own branch progress" on public.training_branch_progress;

revoke all privileges on table public.training_branch_progress from anon, authenticated;
grant select on table public.training_branch_progress to authenticated;
