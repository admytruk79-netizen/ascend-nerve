/* Server-owned practice-session start authority.
   This module establishes scope only; it never mutates curriculum progression
   or controls the practice overlay lifecycle. */
export async function beginAuthoritativePracticeSession({stageId,practiceId}){
  if(!window.PathBackend?.isSignedIn?.())return null;
  if(!stageId||!practiceId)return null;
  return window.PathBackend.rpc('path_begin_practice_session',{
    p_stage_id:stageId,
    p_practice_id:practiceId
  });
}
