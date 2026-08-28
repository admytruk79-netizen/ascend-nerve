(()=>{
  const BASE='https://nqionqvuudamqkfbaopk.supabase.co';
  const KEY='sb_publishable_Z8KPlgoyxv4RC0yaZpuLSQ_5SBzrxbR';
  const STORAGE='ascendPathSession';
  const RECOVERY='ascendPasswordRecovery';
  const NATIVE_REDIRECT='com.ascend.path://auth-callback';
  const CONFIRM_REDIRECT='https://admytruk79-netizen.github.io/ascend-nerve/';
  let session=JSON.parse(localStorage.getItem(STORAGE)||'null');
  const headers=(extra={})=>({apikey:KEY,'Content-Type':'application/json',...(session?.access_token?{Authorization:`Bearer ${session.access_token}`}:{}) ,...extra});
  const persist=(next)=>{session=next;if(next)localStorage.setItem(STORAGE,JSON.stringify(next));else localStorage.removeItem(STORAGE)};
  const redirectTo=()=>`${location.origin}${location.pathname}`;

  function completeOAuth(url){
    try{
      const parsed=new URL(url,location.href);
      const hash=new URLSearchParams(parsed.hash.slice(1));
      const query=parsed.searchParams;
      const error=hash.get('error_description')||query.get('error_description')||hash.get('error')||query.get('error');
      if(error)throw new Error(error);
      const access_token=hash.get('access_token');
      const refresh_token=hash.get('refresh_token');
      if(!access_token||!refresh_token)return false;
      const expires_in=Number(hash.get('expires_in')||3600);
      persist({access_token,refresh_token,expires_in,expires_at:Math.floor(Date.now()/1000)+expires_in,token_type:hash.get('token_type')||'bearer'});
      if((hash.get('type')||query.get('type'))==='recovery')sessionStorage.setItem(RECOVERY,'true');
      if(parsed.href.startsWith(location.origin))history.replaceState(null,'',location.pathname);
      return true;
    }catch(error){console.error('ASCEND OAuth callback failed',error);throw error}
  }

  try{if(location.hash)completeOAuth(location.href)}catch{}

  async function jsonFetch(url,options={}){const r=await fetch(url,{...options,headers:headers(options.headers||{})});let body=null;try{body=await r.json()}catch{}if(!r.ok){const error=new Error(body?.msg||body?.message||body?.error_description||`Request failed (${r.status})`);error.status=r.status;error.code=body?.code||body?.error_code||'';throw error}return body}
  const isNative=()=>!!window.Capacitor?.isNativePlatform?.();
  async function signInWithGoogle(){
    const redirect=isNative()?NATIVE_REDIRECT:redirectTo();
    const url=`${BASE}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirect)}`;
    if(!isNative()){location.assign(url);return}
    const Browser=window.Capacitor?.Plugins?.Browser;
    if(!Browser)throw new Error('Google sign-in is unavailable in this build.');
    await Browser.open({url,toolbarColor:'#081521'});
  }
  async function signIn(email,password){const body=await jsonFetch(`${BASE}/auth/v1/token?grant_type=password`,{method:'POST',body:JSON.stringify({email,password})});persist(body);return body.user}
  async function signUp(email,password){const url=`${BASE}/auth/v1/signup?redirect_to=${encodeURIComponent(CONFIRM_REDIRECT)}`;return jsonFetch(url,{method:'POST',body:JSON.stringify({email,password})})}
  async function resendSignup(email){const url=`${BASE}/auth/v1/resend?redirect_to=${encodeURIComponent(CONFIRM_REDIRECT)}`;return jsonFetch(url,{method:'POST',body:JSON.stringify({type:'signup',email})})}
  async function requestPasswordReset(email){const url=`${BASE}/auth/v1/recover?redirect_to=${encodeURIComponent(CONFIRM_REDIRECT)}`;return jsonFetch(url,{method:'POST',body:JSON.stringify({email})})}
  async function updatePassword(password){const body=await jsonFetch(`${BASE}/auth/v1/user`,{method:'PUT',body:JSON.stringify({password})});sessionStorage.removeItem(RECOVERY);return body}
  function listenForOAuthCallback(onComplete){
    if(!isNative())return;
    const App=window.Capacitor?.Plugins?.App;
    const Browser=window.Capacitor?.Plugins?.Browser;
    if(!App)return;
    const consume=async(url)=>{
      if(!url?.startsWith(NATIVE_REDIRECT))return;
      const completed=completeOAuth(url);
      if(!completed)return;
      try{await Browser?.close?.()}catch{}
      onComplete?.();
    };
    App.addListener('appUrlOpen',event=>consume(event.url).catch(error=>onComplete?.(error)));
    App.getLaunchUrl?.().then(event=>consume(event?.url)).catch(error=>console.error('ASCEND launch URL failed',error));
  }
  async function refresh(){if(!session?.refresh_token)return null;try{const body=await jsonFetch(`${BASE}/auth/v1/token?grant_type=refresh_token`,{method:'POST',body:JSON.stringify({refresh_token:session.refresh_token})});persist(body);return body}catch(e){persist(null);return null}}
  async function me(){if(!session?.access_token)return null;try{return await jsonFetch(`${BASE}/auth/v1/user`)}catch{await refresh();return session?.access_token?jsonFetch(`${BASE}/auth/v1/user`):null}}
  function signOut(){persist(null);sessionStorage.removeItem(RECOVERY)}
  async function rest(table,{method='GET',query='',body,prefer}={}){if(!session?.access_token)throw new Error('Sign in required');const h={};if(prefer)h.Prefer=prefer;return jsonFetch(`${BASE}/rest/v1/${table}${query?`?${query}`:''}`,{method,headers:h,body:body===undefined?undefined:JSON.stringify(body)})}
  async function rpc(name,body){if(!session?.access_token)throw new Error('Sign in required');return jsonFetch(`${BASE}/rest/v1/rpc/${name}`,{method:'POST',body:JSON.stringify(body)})}
  async function sha256(value){const bytes=new TextEncoder().encode(value);const digest=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(digest)].map(byte=>byte.toString(16).padStart(2,'0')).join('')}
  async function redeemLifetimeKey(rawKey){const normalized=String(rawKey||'').trim().toUpperCase();if(!/^ASCEND(?:-[A-F0-9]{4}){4}$/.test(normalized))return{status:'invalid'};const rows=await rpc('redeem_ascend_lifetime_key',{p_hash:await sha256(normalized)});return rows?.[0]||{status:'invalid'}}
  async function getMyEntitlement(userId){const rows=await rest('ascend_entitlements',{query:`user_id=eq.${userId}&is_active=eq.true&select=access_level,source,starts_at,expires_at&limit=1`});return rows[0]||null}
  function entitlementIsActive(entitlement){if(!entitlement?.is_active&&entitlement?.is_active!==undefined)return false;if(entitlement?.access_level==='lifetime')return true;if(entitlement?.access_level!=='premium'||!entitlement.expires_at)return false;return new Date(entitlement.expires_at).getTime()>Date.now()}
  async function loadCurriculum(){const [phases,stages,practices,links,markers,content,contentRules]=await Promise.all([rest('path_phases',{query:'select=*&is_published=eq.true&order=sort_order.asc'}),rest('path_stages',{query:'select=*&is_published=eq.true&order=sort_order.asc'}),rest('path_practices',{query:'select=*&is_published=eq.true'}),rest('path_stage_practices',{query:'select=*'}),rest('path_attainment_markers',{query:'select=*&order=sort_order.asc'}),rest('path_content_items',{query:'select=*&is_published=eq.true&order=created_at.asc'}),rest('path_content_unlock_rules',{query:'select=*'})]);return{phases,stages,practices,links,markers,content,contentRules}}
  async function ensureStudent(user){const existing=await rest('path_profiles',{query:`user_id=eq.${user.id}&select=*`});if(existing.length)return existing[0];const stages=await rest('path_stages',{query:'select=id,slug&slug=eq.entry-seven-days&limit=1'});const first=stages[0];const profile={user_id:user.id,display_name:user.email?.split('@')[0]||'Student',timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,current_stage_id:first?.id||null,path_started_at:new Date().toISOString()};await rest('path_profiles',{method:'POST',body:profile,prefer:'return=representation'});if(first)await rest('path_student_progress',{method:'POST',body:{user_id:user.id,stage_id:first.id,status:'active',practice_days:0,notes:{}},prefer:'return=minimal'});return profile}
  async function getProgress(userId){return rest('path_student_progress',{query:`user_id=eq.${userId}&select=*&order=started_at.asc`})}
  async function completePractice({stageId,practiceId,durationSeconds}){return rpc('path_record_practice_completion',{p_stage_id:stageId,p_practice_id:practiceId,p_duration_seconds:durationSeconds})}
  async function recordTrainingAssignment(assignmentId,status='practiced'){return rpc('path_record_training_assignment',{p_assignment_id:assignmentId,p_status:status})}
  async function saveJournal(userId,stageId,entry){return rest('path_journal_entries',{method:'POST',body:{user_id:userId,stage_id:stageId,entry_date:new Date().toISOString().slice(0,10),observation:entry.observation||null,inner_state:entry.inner_state||null,life_application:entry.life_application||null,interpretation:entry.interpretation||null,unresolved:entry.unresolved||null,share_with_teacher:!!entry.share_with_teacher},prefer:'return=representation'})}
  async function getMarkerObservations(userId,stageId){return rest('path_student_marker_observations',{query:`user_id=eq.${userId}&stage_id=eq.${stageId}&select=*`})}
  async function saveMarkerObservation(userId,stageId,markerId,state,reflection=''){return rest('path_student_marker_observations',{method:'POST',body:{user_id:userId,stage_id:stageId,marker_id:markerId,state,reflection:reflection||null,observed_at:new Date().toISOString()},prefer:'resolution=merge-duplicates,return=minimal'})}
  async function submitReadinessReview(stageId){return rpc('path_submit_readiness_review',{p_stage_id:stageId})}
  async function getRecentJournalText(userId,limit=8){try{const rows=await rest('path_journal_entries',{query:`user_id=eq.${userId}&select=observation,inner_state,life_application,interpretation,unresolved&order=entry_date.desc&limit=${limit}`});return rows.map(r=>[r.observation,r.inner_state,r.life_application,r.interpretation,r.unresolved].filter(Boolean).join(' ')).join(' ')}catch(e){return ''}}
  async function getMyProfile(userId){const rows=await rest('path_profiles',{query:`user_id=eq.${userId}&select=*`});return rows[0]||null}
  async function getIntroductionStatus(userId){const rows=await rest('path_profiles',{query:`user_id=eq.${userId}&select=onboarding_completed_at&limit=1`});return rows[0]||null}
  async function completeIntroduction(userId){return rest('path_profiles',{method:'PATCH',query:`user_id=eq.${userId}`,body:{onboarding_completed_at:new Date().toISOString()},prefer:'return=minimal'})}
  async function getMyTeacher(userId){const rels=await rest('path_teacher_relationships',{query:`student_id=eq.${userId}&status=eq.active&select=teacher_id,created_at`});return rels[0]||null}
  async function getMyReviews(userId){return rest('path_teacher_reviews',{query:`student_id=eq.${userId}&select=*&order=submitted_at.desc`})}
  async function getMyStudents(teacherId){return rest('path_teacher_relationships',{query:`teacher_id=eq.${teacherId}&status=eq.active&select=student_id,created_at`})}
  async function getSharedJournalEntries(studentIds){if(!studentIds.length)return[];const ids=studentIds.join(',');return rest('path_journal_entries',{query:`user_id=in.(${ids})&share_with_teacher=eq.true&select=*&order=entry_date.desc`})}
  async function submitTeacherReview({teacherId,studentId,stageId,note,recommendation,decision}){const mapped=decision||({ready:'advance',not_yet:'continue',needs_discussion:'pause',acknowledged:'continue'}[recommendation]||'continue');return rest('path_teacher_reviews',{method:'POST',body:{teacher_id:teacherId,student_id:studentId,stage_id:stageId,decision:mapped,guidance:note||''},prefer:'return=representation'})}
  async function isTeacher(userId){const rows=await rest('path_teachers',{query:`user_id=eq.${userId}&select=user_id`});return rows.length>0}
  async function addStudent(email){return rpc('path_add_student',{p_student_email:email})}
  async function deleteAccount(){if(!session?.access_token)throw new Error('Sign in required');const response=await fetch(`${BASE}/functions/v1/delete-account`,{method:'POST',headers:headers(),body:JSON.stringify({confirmation:'DELETE'})});let body={};try{body=await response.json()}catch{}if(!response.ok)throw new Error(body.error||`Deletion failed (${response.status})`);persist(null);sessionStorage.removeItem(RECOVERY);return body}
  window.PathBackend={signInWithGoogle,listenForOAuthCallback,completeOAuth,signIn,signUp,resendSignup,requestPasswordReset,updatePassword,deleteAccount,signOut,me,refresh,rest,rpc,redeemLifetimeKey,getMyEntitlement,entitlementIsActive,loadCurriculum,ensureStudent,getProgress,completePractice,recordTrainingAssignment,saveJournal,getMarkerObservations,saveMarkerObservation,submitReadinessReview,getRecentJournalText,getMyProfile,getIntroductionStatus,completeIntroduction,getMyTeacher,getMyReviews,getMyStudents,getSharedJournalEntries,submitTeacherReview,isTeacher,addStudent,isSignedIn:()=>!!session?.access_token,isPasswordRecovery:()=>sessionStorage.getItem(RECOVERY)==='true'};
})();
