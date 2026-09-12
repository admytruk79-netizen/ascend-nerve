-- Restrict privileged progression RPCs to signed-in students.
-- Both functions perform their own auth.uid() ownership checks; anonymous
-- execution is unnecessary and was reported by Supabase security advisors.
revoke execute on function public.path_record_training_assignment(uuid, text) from public, anon;
revoke execute on function public.submit_branch_readiness(uuid, text, text) from public, anon;

grant execute on function public.path_record_training_assignment(uuid, text) to authenticated, service_role;
grant execute on function public.submit_branch_readiness(uuid, text, text) to authenticated, service_role;
