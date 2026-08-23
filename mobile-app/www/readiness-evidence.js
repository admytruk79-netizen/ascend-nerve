(()=>{
 const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const style=document.createElement('style');style.textContent=`.readiness-evidence{margin:18px 0;padding:16px;border:1px solid rgba(85,200,189,.18);border-radius:18px;background:rgba(85,200,189,.025)}.readiness-evidence h3{margin:0 0 12px;color:var(--gold2);font-size:15px;font-weight:400}.evidence-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.evidence-item{padding:10px;border:1px solid rgba(255,255,255,.07);border-radius:12px;background:rgba(255,255,255,.018)}.evidence-item strong{display:block;font:17px Georgia,serif;font-weight:400}.evidence-item span{display:block;margin-top:3px;color:var(--muted);font:9px Arial,sans-serif;letter-spacing:.08em}.evidence-state{margin-top:12px;font:11px Arial,sans-serif;color:var(--muted);line-height:1.5}.evidence-state.ready{color:var(--teal)}@media(max-width:360px){.evidence-grid{grid-template-columns:1fr}}`;
 document.head.appendChild(style);
 async function load(){
  if(!window.PathBackend?.isSignedIn?.()||!window.currentStage)return;
  const card=document.getElementById('stage-review-card');if(!card||card.classList.contains('hidden'))return;
  let host=document.getElementById('readiness-evidence');if(!host){host=document.createElement('div');host.id='readiness-evidence';host.className='readiness-evidence';const marker=document.getElementById('marker-list');marker?.before(host)}
  host.innerHTML='<h3>Readiness Evidence</h3><p class="quiet-note">Checking practice consistency, reflection and life application…</p>';
  try{
   const e=await PathBackend.rpc('path_get_readiness_evidence',{p_stage_id:currentStage.id});
   const ready=!!e.evidence_ready;
   host.innerHTML=`<h3>Readiness Evidence</h3><div class="evidence-grid"><div class="evidence-item"><strong>${e.practice_days}/${e.required_practice_days}</strong><span>PRACTICE DAYS</span></div><div class="evidence-item"><strong>${e.distinct_practice_days}/${e.consistency_target}</strong><span>CONSISTENT DAYS</span></div><div class="evidence-item"><strong>${e.journal_entries}</strong><span>REFLECTIONS</span></div><div class="evidence-item"><strong>${e.life_application_entries+e.training_in_life_logs}</strong><span>LIFE APPLICATION EVIDENCE</span></div><div class="evidence-item"><strong>${e.ready_markers}/${e.required_markers}</strong><span>READINESS MARKERS</span></div><div class="evidence-item"><strong>${e.maintenance_logs}</strong><span>MAINTENANCE LOGS</span></div></div><p class="evidence-state ${ready?'ready':''}">${ready?'Evidence is coherent enough to request progression.':'Continue gathering evidence. Ambiguous, not-yet, or no-clear-result observations are valid; do not force a result.'}</p>`;
  }catch(err){host.innerHTML='<h3>Readiness Evidence</h3><p class="quiet-note">Evidence could not be refreshed yet.</p>'}
 }
 function addUncertaintyOptions(){document.querySelectorAll('#marker-list select').forEach(sel=>{if(![...sel.options].some(o=>o.value==='ambiguous')){const a=new Option('Ambiguous / mixed','ambiguous');const n=new Option('No clear result','no_clear_result');sel.insertBefore(n,sel.options[2]||null);sel.insertBefore(a,sel.options[2]||null)}})}
 const review=document.getElementById('marker-list');if(review)new MutationObserver(()=>{addUncertaintyOptions();setTimeout(load,50)}).observe(review,{childList:true,subtree:true});
 document.addEventListener('click',e=>{if(e.target?.id==='submit-stage-review')setTimeout(load,700)});
 window.ASCENDReadinessEvidence={load};setTimeout(()=>{addUncertaintyOptions();load()},2200);
})();