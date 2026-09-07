/* Server-owned practice-session start authority.
   This module establishes scope only; it never mutates curriculum progression
   or controls the practice overlay lifecycle. */
export async function beginAuthoritativePracticeSession({stageId,practiceId}){
  if(!window.PathBackend?.isSignedIn?.())throw new Error('Sign in required to start an official practice session.');
  if(!stageId||!practiceId)throw new Error('Practice scope is unavailable.');
  return window.PathBackend.rpc('path_begin_practice_session',{
    p_stage_id:stageId,
    p_practice_id:practiceId
  });
}
