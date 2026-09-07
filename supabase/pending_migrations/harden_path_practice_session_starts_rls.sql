-- Keep authoritative practice-session starts private to server-owned RPCs.
-- Client roles must never read or mutate this table directly.
-- The path_* practice-session functions are SECURITY DEFINER functions owned by
-- postgres and therefore retain their intended server-side access with RLS on.

alter table public.path_practice_session_starts enable row level security;

revoke all on table public.path_practice_session_starts
  from public, anon, authenticated, service_role;

-- This function exists only as a trigger implementation. It is not an RPC.
revoke all on function public.enforce_branch_repetition_safety_state()
  from public, anon, authenticated;
grant execute on function public.enforce_branch_repetition_safety_state()
  to service_role;
