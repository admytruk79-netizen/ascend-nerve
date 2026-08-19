(()=>{
  const BASE='https://nqionqvuudamqkfbaopk.supabase.co';
  const KEY='sb_publishable_Z8KPlgoyxv4RC0yaZpuLSQ_5SBzrxbR';
  const STORAGE='ascendPathSession';
  let session=JSON.parse(localStorage.getItem(STORAGE)||'null');

  const headers=(extra={})=>({apikey:KEY,'Content-Type':'application/json',...(session?.access_token?{Authorization:`Bearer ${session.access_token}`}:{}) ,...extra});
  const persist=(next)=>{session=next;if(next)localStorage.setItem(STORAGE,JSON.stringify(next));else localStorage.removeItem(STORAGE)};
  async function jsonFetch(url,options={}){const r=await fetch(url,{...options,headers:headers(options.headers||{})});let body=null;try{body=await r.json()}catch{}if(!r.ok)throw new Error(body?.msg||body?.message||body?.error_description||`Request failed (${r.status})`);return body}
  async function signIn(email,password){const body=await jsonFetch(`${BASE}/auth/v1/token?grant_type=password`,{method:'POST',body:JSON.stringify({email,password})});persist(body);return body.user}
  async function signUp(email,password){const body=await jsonFetch(`${BASE}/auth/v1/signup`,{method:'POST',body:JSON.stringify({email,password})});if(body?.access_token)persist(body);return body}
  async function refresh(){if(!session?.refresh_token)return null;try{const body=await jsonFetch(`${BASE}/auth/v1/token?grant_type=refresh_token`,{method:'POST',body:JSON.stringify({refresh_token:session.refresh_token})});persist(body);return body}catch(e){persist(null);return null}}
  async function me(){if(!session?.access_token)return null;try{return await jsonFetch(`${BASE}/auth/v1/user`)}catch{await refresh();return session?.access_token?jsonFetch(`${BASE}/auth/v1/user`):null}}
  function signOut(){persist(null)}
  async function rest(table,{method='GET',query='',body,prefer}={}){if(!session?.access_token)throw new Error('Sign in required');const h={};if(prefer)h.Prefer=prefer;return jsonFetch(`${BASE}/rest/v1/${table}${query?`?${query}`:''}`,{method,headers:h,body:body===undefined?undefined:JSON.stringify(body)})}
  async function loadCurriculum(){const [phases,stages,practices,links,markers,content]=await Promise.all([
    rest('path_phases',{query:'select=*&order=sort_order.asc'}),
    rest('path_stages',{query:'select=*&order=sort_order.asc'}),
    rest('path_practices',{query:'select=*'}),
    rest('path_stage_practices',{query:'select=*'}),
    rest('path_attainment_markers',{query:'select=*&order=sort_order.asc'}),
    rest('path_content_items',{query:'select=*&is_published=eq.true&order=created_at.asc'})
  ]);return{phases,stages,practices,links,markers,content}}
  async function ensureStudent(user){const existing=await rest('path_profiles',{query:`user_id=eq.${user.id}&select=*`});if(existing.length)return existing[0];const stages=await rest('path_stages',{query:'select=id,slug&slug=eq.entry-seven-days&limit=1'});const first=stages[0];const profile={user_id:user.id,display_name:user.email?.split('@')[0]||'Student',timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,current_stage_id:first?.id||null,path_started_at:new Date().toISOString()};await rest('path_profiles',{method:'POST',body:profile,prefer:'return=representation'});if(first)await rest('path_student_progress',{method:'POST',body:{user_id:user.id,stage_id:first.id,status:'active',practice_days:0,notes:{}},prefer:'return=minimal'});return profile}
  async function getProgress(userId){return rest('path_student_progress',{query:`user_id=eq.${userId}&select=*&order=started_at.asc`})}
  async function completePractice({userId,stageId,practiceId,durationSeconds}){const sessionRow={user_id:userId,stage_id:stageId,practice_id:practiceId,started_at:new Date(Date.now()-durationSeconds*1000).toISOString(),completed_at:new Date().toISOString(),duration_seconds:durationSeconds,completion_status:'completed',metadata:{source:'mobile'}};await rest('path_practice_sessions',{method:'POST',body:sessionRow,prefer:'return=minimal'});const progress=await rest('path_student_progress',{query:`user_id=eq.${userId}&stage_id=eq.${stageId}&select=*&limit=1`});if(progress[0]){const today=new Date().toISOString().slice(0,10);const inc=progress[0].last_practice_date===today?progress[0].practice_days:progress[0].practice_days+1;await rest('path_student_progress',{method:'PATCH',query:`id=eq.${progress[0].id}`,body:{practice_days:inc,last_practice_date:today},prefer:'return=minimal'});return inc}return 0}
  async function saveJournal(userId,stageId,entry){return rest('path_journal_entries',{method:'POST',body:{user_id:userId,stage_id:stageId,entry_date:new Date().toISOString().slice(0,10),observation:entry.observation||null,inner_state:entry.inner_state||null,life_application:entry.life_application||null,interpretation:entry.interpretation||null,unresolved:entry.unresolved||null,share_with_teacher:false},prefer:'return=minimal'})}
  window.PathBackend={signIn,signUp,signOut,me,refresh,rest,loadCurriculum,ensureStudent,getProgress,completePractice,saveJournal,isSignedIn:()=>!!session?.access_token};
})();