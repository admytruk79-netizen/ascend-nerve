/* Server-owned practice-session authority.
   This module establishes and closes authoritative practice scope only; it never
   mutates curriculum progression or controls the practice overlay lifecycle. */
export async function beginAuthoritativePracticeSession({stageId,practiceId}){
  if(!window.PathBackend?.isSignedIn?.())throw new Error('Sign in required to start an official practice session.');
  if(!stageId||!practiceId)throw new Error('Practice scope is unavailable.');
  return window.PathBackend.rpc('path_begin_practice_session',{
    p_stage_id:stageId,
    p_practice_id:practiceId
  });
}

export async function abandonAuthoritativePracticeSession(sessionId){
  if(!sessionId||!window.PathBackend?.isSignedIn?.())return null;
  return window.PathBackend.rpc('path_abandon_practice_session',{
    p_session_id:sessionId
  });
}
