(()=>{
  const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let branches=[],modules=[],progress=[],foundationMonth=1,loadedSignedIn=false;
  const FOUNDATION_GATE_MONTH=8; // unlocks the month after the Month 7 Foundation Review gate

  async function load(){
    loadedSignedIn=PathBackend.isSignedIn();
    if(!loadedSignedIn){branches=[];modules=[];progress=[];foundationMonth=1;render();return}
    try{
      const [branchRows,moduleRows,progressRows,context]=await Promise.all([
        PathBackend.rest('training_branches',{query:'is_published=eq.true&select=*&order=sort_order.asc'}),
        PathBackend.rest('training_branch_modules',{query:'is_published=eq.true&select=*&order=module_number.asc'}),
        PathBackend.rest('training_branch_progress',{query:'select=*'}),
        window.ASCENDProgression?.current?.({fresh:true}).catch(()=>({month:1}))||Promise.resolve({month:1})
      ]);
      branches=branchRows;modules=moduleRows;progress=progressRows;foundationMonth=Number(context?.month)||1;
      render();
    }catch(e){console.error('Branch load failed',e)}
  }
  function foundationCleared(){return foundationMonth>=FOUNDATION_GATE_MONTH}

  function progressFor(m){return progress.find(p=>p.module_id===m.id)||null}
  function isApplied(m){return !!m?.metadata?.applied_parallel}
  function primaryModules(branch){return modules.filter(m=>m.branch_id===branch.id&&!isApplied(m))}
  function currentFor(branch){
    const completed=new Set(progress.filter(p=>p.branch_id===branch.id&&p.status==='completed').map(p=>p.module_id));
    return primaryModules(branch).find(m=>!completed.has(m.id))||null;
  }
  function parentPrimary(m){return modules.filter(x=>x.branch_id===m.branch_id&&x.module_number<m.module_number&&!isApplied(x)).sort((a,b)=>b.module_number-a.module_number)[0]||null}
  function canOpen(m,branch,signedIn,current){
    if(!signedIn)return true;
    if(isApplied(m)){
      const parent=parentPrimary(m),p=parent&&progressFor(parent);
      return !!p&&Number(p.repetitions||0)>0;
    }
    if(!current)return true;
    return m.module_number<=current.module_number;
  }

  function render(){
    const host=document.getElementById('practice-branches');if(!host)return;host.innerHTML='';
    if(!loadedSignedIn){
      const card=document.createElement('article');card.className='rhythm-card';
      card.innerHTML=`<h2>Sign In Required</h2><p class="quiet-note">The Primary Path continuation and specialized pathways open once you are signed in and have cleared the Foundation Review (Month 7) of Core Formation.</p>`;
      host.appendChild(card);return;
    }
    if(!foundationCleared()){
      const card=document.createElement('article');card.className='rhythm-card';
      card.innerHTML=`<h2>Locked Until Foundation Review</h2><p class="quiet-note">The Primary Path continuation and specialized pathways ask for the six months of Core Formation Foundation work first, so the deeper material here (including enhanced practices) is met with real grounding rather than curiosity alone. You are at Month ${foundationMonth} of 24 · unlocks at Month ${FOUNDATION_GATE_MONTH}.</p>`;
      host.appendChild(card);return;
    }
    branches.forEach(branch=>{
      const ms=modules.filter(m=>m.branch_id===branch.id),done=progress.filter(p=>p.branch_id===branch.id&&p.status==='completed').length,current=currentFor(branch);
      const note=`${done} of ${ms.length} modules integrated${current?` · Current primary: ${esc(current.title)}`:' · Pathway complete'}`;
      const card=document.createElement('article');card.className='rhythm-card branch-card';
      card.innerHTML=`<div class="branch-card-main"><div><h2>${esc(branch.title)}</h2><p>${esc(branch.subtitle||branch.description||'Specialized training')}</p></div><button class="secondary branch-open" type="button">${done?'Continue':'View'}</button></div><p class="quiet-note">${note}</p>`;
      card.querySelector('.branch-open').onclick=()=>openBranch(branch,current);host.appendChild(card);
    });
  }

  function openBranch(branch,current=currentFor(branch)){
    if(!loadedSignedIn||!foundationCleared())return;
    const overlay=document.getElementById('branch-overlay'),body=document.getElementById('branch-body');if(!overlay||!body)return;
    const ms=modules.filter(m=>m.branch_id===branch.id),signedIn=PathBackend.isSignedIn();
    body.innerHTML=`<div class="eyebrow">${branch.slug==='sphere-of-attention'?'PRIMARY PATH':'INDEPENDENT PATHWAY'}</div><h1>${esc(branch.title)}</h1><p>${esc(branch.description||branch.subtitle||'')}</p>${signedIn?'':'<p class="quiet-note">You can explore this pathway now. Sign in when you are ready to record repetitions and progression.</p>'}<div class="branch-modules">${ms.map(m=>{const p=progressFor(m),open=canOpen(m,branch,signedIn,current);const state=p?.status==='completed'?' · COMPLETE':p?.status==='review'?' · READINESS REVIEW':p?.repetitions?` · ${p.repetitions}/${m.minimum_repetitions||1}`:'';const parallel=isApplied(m)?' · PARALLEL APPLICATION':'';return `<article class="content-card ${open?'':'locked'}" data-module="${m.id}"><small>PHASE ${m.phase_number} · SESSION ${m.module_number}${parallel}${state}</small><strong>${esc(m.title)}</strong><span>${esc(open?(m.summary||m.outcome||'Training module'):(isApplied(m)?'Begin its parent primary practice first.':'Complete the current primary module and readiness gate first.'))}</span></article>`}).join('')}</div>`;
    body.querySelectorAll('.content-card:not(.locked)').forEach(el=>el.onclick=()=>openModule(ms.find(m=>m.id===el.dataset.module),branch));overlay.classList.remove('hidden');
  }

  function openModule(m,branch){
    if(!m)return;const body=document.getElementById('branch-body'),p=progressFor(m),reps=p?.repetitions||0,min=m.minimum_repetitions||1,done=p?.status==='completed',review=p?.status==='review';
    const safety=m.safety_level==='enhanced'?`<article class="rhythm-card"><h2>Preparation Gate</h2><p>${esc(m.metadata?.overload_note||'This is deeper work. Continue only when you have enough time and space to ground afterward. You may pause or stop at any point.')}</p><label><span>I have read this and choose to continue</span><input type="checkbox" id="branch-safety-ack"/></label></article>`:'';
    const signal=m.metadata?.advance_signal?`<article class="rhythm-card"><h2>Advance When</h2><p>${esc(m.metadata.advance_signal)}</p></article>`:'';
    const readiness=review&&!isApplied(m)?`<article class="rhythm-card"><h2>Readiness Gate</h2><p>Minimum repetition is complete. Do not force a result. Record the state that is actually true.</p><textarea id="branch-readiness-note" placeholder="What have you actually observed?"></textarea><div class="readiness-actions"><button class="secondary readiness-state" data-state="not_yet" type="button">Not yet</button><button class="secondary readiness-state" data-state="ambiguous" type="button">Ambiguous</button><button class="secondary readiness-state" data-state="no_clear_result" type="button">No clear result</button><button class="primary readiness-state" data-state="ready" type="button">Ready to advance</button></div></article>`:'';
    body.innerHTML=`<div class="eyebrow">${branch.slug==='sphere-of-attention'?'PRIMARY PATH':esc(branch.title)} · SESSION ${m.module_number}${isApplied(m)?' · PARALLEL APPLICATION':''}</div><h1>${esc(m.title)}</h1><p>${esc(m.summary||'')}</p>${safety}${signal}<article class="rhythm-card"><h2>Primary Journey</h2><p>${esc(m.primary_practice||'Primary journey content is being restored from the canonical source.')}</p></article><article class="rhythm-card"><h2>Micro-Practice</h2><p>${esc(m.micro_practice||'')}</p></article><article class="rhythm-card"><h2>In Ordinary Life</h2><p>${esc(m.field_assignment||'')}</p></article><article class="rhythm-card"><h2>Journal</h2><p>${esc(m.journal_prompt||'')}</p><button class="secondary" id="branch-journal" type="button">Open Journal</button></article><article class="rhythm-card"><h2>Integration</h2><p>${esc(m.integration_practice||'')}</p></article>${readiness}<p class="quiet-note" id="branch-progress-note">${done?'Session integrated.':review?'Minimum repetitions complete · readiness review required':`Repetitions: ${reps} of ${min} minimum.`}</p><button class="primary" id="branch-record" type="button" ${done||review||m.safety_level==='enhanced'?'disabled':''}>${done?'Integrated ✓':review?'Readiness review required':'Record This Repetition'}</button><button class="secondary" id="branch-back" type="button">Back to Path</button>`;
    document.getElementById('branch-back').onclick=()=>openBranch(branch);
    document.getElementById('branch-journal').onclick=()=>openBranchJournal(m,branch);
    document.querySelectorAll('.readiness-state').forEach(btn=>btn.onclick=()=>submitReadiness(m,branch,btn.dataset.state));
    const record=document.getElementById('branch-record');if(record&&!done&&!review){if(!PathBackend.isSignedIn()){record.textContent='Sign In to Record Progress';record.disabled=false;record.onclick=()=>document.querySelector('.bottom-nav button[data-screen="me"]')?.click()}else{record.onclick=()=>recordRepetition(m,branch,record);const ack=document.getElementById('branch-safety-ack');if(ack)ack.addEventListener('change',()=>{record.disabled=!ack.checked})}}
  }

  async function recordRepetition(m,branch,button){
    const ack=m.safety_level==='enhanced'?!!document.getElementById('branch-safety-ack')?.checked:true;
    if(m.safety_level==='enhanced'&&!ack){document.getElementById('branch-progress-note').textContent='Read and acknowledge the preparation gate before recording this deeper session.';return}
    button.disabled=true;button.textContent='Saving…';
    try{
      const result=await PathBackend.rpc('record_branch_repetition',{p_module_id:m.id,p_safety_ack:ack});
      const row=Array.isArray(result)?result[0]:result,existing=progressFor(m);
      if(existing)Object.assign(existing,row);else progress.push({branch_id:m.branch_id,module_id:m.id,...row});
      document.getElementById('branch-progress-note').textContent=row?.status==='completed'?'Minimum repetition requirement met. This session is integrated.':row?.status==='review'?'Minimum repetitions complete. Readiness review is now required.':`Repetitions: ${row?.repetitions||0} of ${m.minimum_repetitions||1} minimum.`;
      render();setTimeout(()=>openModule(m,branch),350);
    }catch(e){console.error(e);document.getElementById('branch-progress-note').textContent=e.message||'Could not record this repetition.';button.disabled=false;button.textContent='Record This Repetition'}
  }

  async function submitReadiness(m,branch,state){
    const note=document.getElementById('branch-readiness-note')?.value||'';
    const status=document.getElementById('branch-progress-note');if(status)status.textContent='Saving readiness…';
    try{
      const result=await PathBackend.rpc('submit_branch_readiness',{p_module_id:m.id,p_state:state,p_note:note});
      const existing=progressFor(m);if(existing){existing.status=result.status;existing.readiness_state=result.readiness_state;if(result.status==='completed')existing.completed_at=new Date().toISOString()}
      if(status)status.textContent=result.message||'Readiness saved.';render();setTimeout(()=>openBranch(branch),500);
    }catch(e){console.error(e);if(status)status.textContent=e.message||'Could not save readiness.'}
  }

  function openBranchJournal(m,branch){
    document.getElementById('branch-overlay')?.classList.add('hidden');document.querySelector('.bottom-nav button[data-screen="journal"]')?.click();const form=document.getElementById('journal-form');if(!form)return;
    const obs=form.querySelector('[name="observation"]'),life=form.querySelector('[name="life_application"]'),unresolved=form.querySelector('[name="unresolved"]');
    if(obs&&!obs.value)obs.value=`${branch.title} · Session ${m.module_number}: ${m.title}\n\n${m.journal_prompt||''}`;if(life&&!life.value)life.value=m.field_assignment||'';if(unresolved&&!unresolved.value)unresolved.value='What remains unclear, ambiguous, or unfinished after this session?';obs?.focus();
  }

  document.addEventListener('click',e=>{if(e.target.matches('.branch-close'))document.getElementById('branch-overlay')?.classList.add('hidden')});window.ASCENDBranches={load,render};setTimeout(load,1400);
})();
