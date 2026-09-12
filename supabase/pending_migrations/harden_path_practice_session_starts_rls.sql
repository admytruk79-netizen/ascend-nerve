-- Keep authoritative practice-session starts private to server-owned RPCs.
-- Client roles must never read or mutate this table directly.
-- The path_* practice-session functions are SECURITY DEFINER functions owned by
-- postgres and therefore retain their intended server-side access with RLS on.

alter table public.path_practice_session_starts enable row level security;

revoke all on table public.path_practice_session_starts
  from public, anon, authenticated, service_role;

-- Defense in depth: even if a client table grant is accidentally restored later,
-- RLS still denies all direct anon/authenticated access. Session lifecycle stays
-- behind the server-authoritative RPCs.
drop policy if exists path_practice_session_starts_deny_clients
  on public.path_practice_session_starts;
create policy path_practice_session_starts_deny_clients
on public.path_practice_session_starts
for all
to anon, authenticated
using (false)
with check (false);

-- This function exists only as a trigger implementation. It is not an RPC.
revoke all on function public.enforce_branch_repetition_safety_state()
  from public, anon, authenticated;
grant execute on function public.enforce_branch_repetition_safety_state()
  to service_role;
