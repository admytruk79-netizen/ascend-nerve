(()=>{
 const BASE='https://nqionqvuudamqkfbaopk.supabase.co';
 const KEY='sb_publishable_Z8KPlgoyxv4RC0yaZpuLSQ_5SBzrxbR';
 const SESSION='ascendPathSession';
 let scope='stage',stageId=null;
 const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const session=()=>{try{return JSON.parse(localStorage.getItem(SESSION)||'null')}catch{return null}};

 async function resolveStage(){
  try{
   const me=await PathBackend.me();
   if(!me)return null;
   const progress=await PathBackend.getProgress(me.id);
   const active=progress.find(p=>p.status==='active'||p.status==='review')||progress[progress.length-1];
   return active?.stage_id||null;
  }catch{return null}
 }

 async function invoke(nextScope=scope){
  const s=session();
  if(!s?.access_token){const err=new Error('Sign in to use Resonance.');err.status=401;throw err}
  stageId=stageId||await resolveStage();
  const r=await fetch(`${BASE}/functions/v1/ascend-resonance`,{
   method:'POST',
   headers:{apikey:KEY,Authorization:`Bearer ${s.access_token}`,'Content-Type':'application/json'},
   body:JSON.stringify({stage_id:stageId,scope:nextScope})
  });
  let data={};try{data=await r.json()}catch{}
  if(!r.ok){const err=new Error(data?.message||data?.error||`Resonance request failed (${r.status})`);err.status=r.status;throw err}
  return data;
 }

 function themeList(xs=[]){
  if(!xs.length)return '<p class="mirror-muted">No stable recurring resonance yet.</p>';
  return `<div class="mirror-themes">${xs.slice(0,4).map(x=>`<span>${esc(x.label||x)}${x.trend?` · ${esc(x.trend)}`:''}</span>`).join('')}</div>`;
 }

 function render(data){
  const box=document.getElementById('mirror-content');if(!box)return;
  const m=data.metrics||{},change=data.change_over_time||{},bal=data.observation_balance||{};
  box.innerHTML=`<div class="mirror-shell"><div class="mirror-tabs"><button type="button" data-mirror-scope="stage" class="${scope==='stage'?'active':''}">THIS STAGE</button><button type="button" data-mirror-scope="all" class="${scope==='all'?'active':''}">ALL TIME</button></div><div class="mirror-status"><span>RESONANCE ENGINE</span><small>${esc((data.confidence||'insufficient').toUpperCase())} SIGNAL · ${m.journal_entries||0} ENTRIES</small></div><section class="mirror-block mirror-summary"><div class="eyebrow">PATTERN SNAPSHOT</div><p>${esc(data.summary||'Resonance begins with your own record.')}</p>${themeList(data.themes)}</section>${(change.earlier||change.recent)?`<section class="mirror-block"><div class="eyebrow">CHANGE OVER TIME</div>${change.earlier?`<div class="mirror-compare"><small>EARLIER</small><p>${esc(change.earlier)}</p></div>`:''}${change.recent?`<div class="mirror-compare recent"><small>RECENT</small><p>${esc(change.recent)}</p></div>`:''}${change.observation?`<p class="mirror-observation">${esc(change.observation)}</p>`:''}</section>`:''}${(data.phrases?.length||data.cooccurrences?.length)?`<section class="mirror-block"><div class="eyebrow">RESONANCE LINKS</div>${data.phrases?.length?`<p class="mirror-subhead">Repeated phrases</p><div class="mirror-themes">${data.phrases.slice(0,4).map(x=>`<span>${esc(x.label)}</span>`).join('')}</div>`:''}${data.cooccurrences?.length?`<p class="mirror-subhead">Terms appearing together</p><div class="mirror-themes">${data.cooccurrences.slice(0,4).map(x=>`<span>${esc(x.pair)}</span>`).join('')}</div>`:''}</section>`:''}<section class="mirror-block mirror-question"><div class="eyebrow">REFLECTION QUESTION</div><p>${esc(data.question||'What did you actually observe before interpretation?')}</p></section>${data.related_practice?`<section class="mirror-related"><span>RELATED PRACTICE</span><strong>${esc(data.related_practice)}</strong></section>`:''}<div class="mirror-metrics"><span><strong>${m.life_application||0}</strong> applied-life notes</span><span><strong>${m.unresolved||0}</strong> unresolved</span><span><strong>${m.training_logs||0}</strong> training logs</span></div>${bal.ratio!==null&&bal.ratio!==undefined?`<div class="mirror-balance"><span>OBSERVATION / INTERPRETATION BALANCE</span><strong>${Math.round(Number(bal.ratio)*100)}%</strong></div>`:''}<p class="mirror-boundary">${esc(data.boundary||'Resonance reflects recurring patterns in your record. It does not determine attainment, diagnose you, or establish spiritual claims as fact.')}</p></div>`;
  box.querySelectorAll('[data-mirror-scope]').forEach(button=>button.onclick=()=>load(button.dataset.mirrorScope));
 }

 function loading(){
  const box=document.getElementById('mirror-content');
  if(box)box.innerHTML='<div class="mirror-loading"><i></i><p>Reading resonance across your record…</p></div>';
 }

 async function attemptLoad(nextScope){
  scope=nextScope;
  loading();
  try{render(await invoke(scope));return null}
  catch(error){
   const box=document.getElementById('mirror-content');
   if(box)box.innerHTML=`<p>${esc(error.message)}</p><p class="mirror-boundary">Your journal remains intact.</p>`;
   return error;
  }
 }

 async function load(nextScope=scope){return attemptLoad(nextScope)}
 function resetStage(){stageId=null}

 window.ASCENDMirror={load,resetStage};
})();