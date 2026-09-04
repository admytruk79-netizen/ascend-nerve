(()=>{
  const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const mdInline=(s='')=>esc(s).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
  const paragraphs=(text='')=>{const p=String(text).split(/\n\s*\n|\n/).map(x=>x.trim()).filter(Boolean).map(p=>`<p>${mdInline(p)}</p>`).join('');return p||`<p>${mdInline(text)}</p>`};

  const PRACTICE_BRANCHES=new Set(['ancestral-roots','energy-bodywork']);
  const PHASE_I_ADDITIONAL=new Set(['development-program']);
  const PHASE_II_SLUG='sphere-of-attention';
  const FOUNDATION_GATE_STAGE=8;

  let branches=[],modules=[],progress=[],foundationStageSortOrder=1,loadedSignedIn=false;
  let phaseIIAccess={allowed:false,reason:'phase_i_open_gate_required'};

  async function load(){
    loadedSignedIn=PathBackend.isSignedIn();
    try{
      const phaseIICall=loadedSignedIn
        ?PathBackend.rpc('path_phase_ii_access',{}).catch(error=>{console.warn('Phase II access lookup failed',error);return{allowed:false,reason:'access_lookup_failed'}})
        :Promise.resolve({allowed:false,reason:'authentication_required'});
      const [branchRows,moduleRows,progressRows,context,phaseIIState]=await Promise.all([
        PathBackend.rest('training_branches',{query:'is_published=eq.true&select=*&order=sort_order.asc'}),
        PathBackend.rest('training_branch_modules',{query:'is_published=eq.true&select=*&order=module_number.asc'}),
        loadedSignedIn?PathBackend.rest('training_branch_progress',{query:'select=*'}):Promise.resolve([]),
        loadedSignedIn?(window.ASCENDProgression?.current?.({fresh:true}).catch(()=>({stageSortOrder:1}))||Promise.resolve({stageSortOrder:1})):Promise.resolve({stageSortOrder:1}),
        phaseIICall
      ]);
      branches=branchRows;
      modules=moduleRows;
      progress=progressRows;
      foundationStageSortOrder=Number(context?.stageSortOrder)||1;
      phaseIIAccess=phaseIIState||{allowed:false,reason:'phase_i_open_gate_required'};
      render();
    }catch(e){console.error('Branch load failed',e)}
  }

  function foundationCleared(){return foundationStageSortOrder>=FOUNDATION_GATE_STAGE}
  function progressFor(m){return progress.find(p=>p.module_id===m.id)||null}
  function isApplied(m){return !!m?.metadata?.applied_parallel}
  function primaryModules(branch){return modules.filter(m=>m.branch_id===branch.id&&!isApplied(m))}
  function currentFor(branch){
    const completed=new Set(progress.filter(p=>p.branch_id===branch.id&&p.status==='completed').map(p=>p.module_id));
    return primaryModules(branch).find(m=>!completed.has(m.id))||null;
  }
  function parentPrimary(m){return modules.filter(x=>x.branch_id===m.branch_id&&x.module_number<m.module_number&&!isApplied(x)).sort((a,b)=>b.module_number-a.module_number)[0]||null}

  function categoryFor(branch){
    if(branch?.slug===PHASE_II_SLUG)return'phase_ii';
    if(PHASE_I_ADDITIONAL.has(branch?.slug))return'phase_i_additional';
    if(PRACTICE_BRANCHES.has(branch?.slug))return'practice_branch';
    return'other';
  }

  function canOpen(m,branch,signedIn,current){
    if(!signedIn)return false;
    if(branch.slug===PHASE_II_SLUG&&!phaseIIAccess.allowed)return false;
    if(m.safety_level==='enhanced'&&!foundationCleared())return false;
    if(isApplied(m)){
      const parent=parentPrimary(m),p=parent&&progressFor(parent);
      return !!p&&Number(p.repetitions||0)>0;
    }
    if(!current)return true;
    return m.module_number<=current.module_number;
  }

  function ensureSection(id,title,subtitle,{before=false}={}){
    const practiceHost=document.getElementById('practice-branches');
    if(!practiceHost)return null;
    let host=document.getElementById(id);
    if(host)return host;
    const header=document.createElement('header');
    header.className='pathway-section-header reconstructed-curriculum-section';
    header.innerHTML=`<div><strong>${esc(title)}</strong><span>${esc(subtitle)}</span></div>`;
    host=document.createElement('div');
    host.id=id;
    host.className='curriculum-pathway-group';
    if(before){
      const existingHeader=practiceHost.previousElementSibling;
      (existingHeader||practiceHost).before(header,host);
    }else{
      practiceHost.after(header,host);
    }
    return host;
  }

  function cardFor(branch){
    const ms=modules.filter(m=>m.branch_id===branch.id),done=progress.filter(p=>p.branch_id===branch.id&&p.status==='completed').length,current=currentFor(branch);
    const category=categoryFor(branch);
    const locked=category==='phase_ii'&&!phaseIIAccess.allowed;
    const note=category==='phase_ii'
      ?(locked?'Locked · complete the Phase I Open Gate before advanced formation begins.':`${done} of ${ms.length} training records integrated${current?` · Current: ${esc(current.title)}`:' · Advanced sequence complete'}`)
      :`${done} of ${ms.length} modules integrated${current?` · Current: ${esc(current.title)}`:' · Pathway complete'}`;
    const card=document.createElement('article');
    card.className=`rhythm-card branch-card${locked?' locked':''}`;
    const buttonLabel=locked?'Open Gate Required':done?'Continue':'View';
    card.innerHTML=`<div class="branch-card-main"><div><h2>${esc(branch.title)}</h2><p>${esc(branch.subtitle||branch.description||'Specialized training')}</p></div><button class="secondary branch-open" type="button" ${locked?'disabled':''}>${buttonLabel}</button></div><p class="quiet-note">${note}</p>`;
    if(!locked)card.querySelector('.branch-open').onclick=()=>openBranch(branch,current);
    return card;
  }

  function render(){
    const practiceHost=document.getElementById('practice-branches');if(!practiceHost)return;
    const existingHeader=practiceHost.previousElementSibling;
    if(existingHeader?.classList.contains('pathway-section-header')){
      existingHeader.querySelector('strong')?.replaceChildren(document.createTextNode('Practice Branches'));
      existingHeader.querySelector('span')?.replaceChildren(document.createTextNode('Independent progression · does not advance Phase I or Phase II'));
    }
    const phaseIHost=ensureSection('phase-one-additional','Phase I · Additional Practices','Supporting and continuing work around the 24-month Core Formation',{before:true});
    const phaseIIHost=ensureSection('phase-two-advanced','Phase II · Advanced Formation','A separate readiness-based sequence opened only through the Phase I Open Gate');
    practiceHost.innerHTML='';
    if(phaseIHost)phaseIHost.innerHTML='';
    if(phaseIIHost)phaseIIHost.innerHTML='';

    branches.forEach(branch=>{
      const category=categoryFor(branch);
      if(category==='phase_i_additional')phaseIHost?.appendChild(cardFor(branch));
      else if(category==='practice_branch')practiceHost.appendChild(cardFor(branch));
      else if(category==='phase_ii')phaseIIHost?.appendChild(cardFor(branch));
    });

    if(phaseIHost&&!phaseIHost.children.length)phaseIHost.innerHTML='<p class="quiet-note">Additional Phase I practices will appear here when assigned.</p>';
    if(!practiceHost.children.length)practiceHost.innerHTML='<p class="quiet-note">No optional Practice Branches are currently available.</p>';
    if(phaseIIHost&&!phaseIIHost.children.length)phaseIIHost.innerHTML='<p class="quiet-note">Phase II advanced formation is not currently published.</p>';
  }

  function branchEyebrow(branch){
    const category=categoryFor(branch);
    if(category==='phase_ii')return'PHASE II · ADVANCED FORMATION';
    if(category==='phase_i_additional')return'PHASE I · ADDITIONAL PRACTICE';
    return'INDEPENDENT PRACTICE BRANCH';
  }

  function lockedReasonFor(m,branch,signedIn){
    if(!signedIn)return'Sign in to access progression-aware training.';
    if(branch.slug===PHASE_II_SLUG&&!phaseIIAccess.allowed)return'Phase II opens only after the Phase I Open Gate is established. Calendar time alone cannot unlock it.';
    if(m.safety_level==='enhanced'&&!foundationCleared())return'Enhanced practice · opens after passing the Foundation Review. This is a readiness signal, not elapsed time.';
    if(isApplied(m))return'Begin its parent primary practice first.';
    return'Complete the current primary module and readiness gate first.';
  }

  function openBranch(branch,current=currentFor(branch)){
    const overlay=document.getElementById('branch-overlay'),body=document.getElementById('branch-body');if(!overlay||!body)return;
    if(branch.slug===PHASE_II_SLUG&&!phaseIIAccess.allowed)return;
    const ms=modules.filter(m=>m.branch_id===branch.id),signedIn=PathBackend.isSignedIn();
    body.innerHTML=`<div class="eyebrow">${branchEyebrow(branch)}</div><h1>${esc(branch.title)}</h1><p>${esc(branch.description||branch.subtitle||'')}</p><div class="branch-modules">${ms.map(m=>{const p=progressFor(m),open=canOpen(m,branch,signedIn,current);const state=p?.status==='completed'?' · COMPLETE':p?.status==='review'?' · READINESS REVIEW':p?.repetitions?` · ${p.repetitions}/${m.minimum_repetitions||1}`:'';const parallel=isApplied(m)?' · PARALLEL APPLICATION':'';return `<article class="content-card ${open?'':'locked'}" data-module="${m.id}"><small>PHASE ${m.phase_number} · SESSION ${m.module_number}${parallel}${state}</small><strong>${esc(m.title)}</strong><span>${mdInline(open?(m.summary||m.outcome||'Training module'):lockedReasonFor(m,branch,signedIn))}</span></article>`}).join('')}</div>`;
    body.querySelectorAll('.content-card:not(.locked)').forEach(el=>el.onclick=()=>openModule(ms.find(m=>m.id===el.dataset.module),branch));
    overlay.classList.remove('hidden');
  }

  function openModule(m,branch){
    if(!m)return;
    const body=document.getElementById('branch-body'),p=progressFor(m),reps=p?.repetitions||0,min=m.minimum_repetitions||1,done=p?.status==='completed',review=p?.status==='review';
    const safety=m.safety_level==='enhanced'?`<article class="rhythm-card"><h2>Preparation Gate</h2><p>${esc(m.metadata?.overload_note||'This is deeper work. Continue only when you have enough time and space to ground afterward. You may pause or stop at any point.')}</p><label><span>I have read this and choose to continue</span><input type="checkbox" id="branch-safety-ack"/></label></article>`:'';
    const signal=m.metadata?.advance_signal?`<article class="rhythm-card"><h2>Advance When</h2><p>${esc(m.metadata.advance_signal)}</p></article>`:'';
    const readiness=review&&!isApplied(m)?`<article class="rhythm-card"><h2>Readiness Gate</h2><p>Minimum repetition is complete. Do not force a result. Record the state that is actually true.</p><textarea id="branch-readiness-note" placeholder="What have you actually observed?"></textarea><div class="readiness-actions"><button class="secondary readiness-state" data-state="not_yet" type="button">Not yet</button><button class="secondary readiness-state" data-state="ambiguous" type="button">Ambiguous</button><button class="secondary readiness-state" data-state="no_clear_result" type="button">No clear result</button><button class="primary readiness-state" data-state="ready" type="button">Ready to advance</button></div></article>`:'';
    body.innerHTML=`<div class="eyebrow">${branchEyebrow(branch)} · SESSION ${m.module_number}${isApplied(m)?' · PARALLEL APPLICATION':''}</div><h1>${esc(m.title)}</h1><p>${mdInline(m.summary||'')}</p>${safety}${signal}<article class="rhythm-card"><h2>Primary Journey</h2>${paragraphs(m.primary_practice||'Primary journey content is being restored from the canonical source.')}</article><article class="rhythm-card"><h2>Micro-Practice</h2>${paragraphs(m.micro_practice||'')}</article><article class="rhythm-card"><h2>In Ordinary Life</h2>${paragraphs(m.field_assignment||'')}</article><article class="rhythm-card"><h2>Journal</h2>${paragraphs(m.journal_prompt||'')}<button class="secondary" id="branch-journal" type="button">Open Journal</button></article><article class="rhythm-card"><h2>Integration</h2>${paragraphs(m.integration_practice||'')}</article>${readiness}<p class="quiet-note" id="branch-progress-note">${done?'Session integrated.':review?'Minimum repetitions complete · readiness review required':`Repetitions: ${reps} of ${min} minimum.`}</p><button class="primary" id="branch-record" type="button" ${done||review||m.safety_level==='enhanced'?'disabled':''}>${done?'Integrated ✓':review?'Readiness review required':'Record This Repetition'}</button><button class="secondary" id="branch-back" type="button">Back to Path</button>`;
    document.getElementById('branch-back').onclick=()=>openBranch(branch);
    document.getElementById('branch-journal').onclick=()=>openBranchJournal(m,branch);
    document.querySelectorAll('.readiness-state').forEach(btn=>btn.onclick=()=>submitReadiness(m,branch,btn.dataset.state));
    const record=document.getElementById('branch-record');
    if(record&&!done&&!review){
      if(!PathBackend.isSignedIn()){
        record.textContent='Sign In to Record Progress';record.disabled=false;record.onclick=()=>document.querySelector('.bottom-nav button[data-screen="me"]')?.click();
      }else{
        record.onclick=()=>recordRepetition(m,branch,record);
        const ack=document.getElementById('branch-safety-ack');if(ack)ack.addEventListener('change',()=>{record.disabled=!ack.checked});
      }
    }
  }

  async function recordRepetition(m,branch,button){
    const ack=m.safety_level==='enhanced'?!!document.getElementById('branch-safety-ack')?.checked:true;
    if(m.safety_level==='enhanced'&&!ack){document.getElementById('branch-progress-note').textContent='Read and acknowledge the preparation gate before recording this deeper session.';return}
    button.disabled=true;button.textContent='Saving…';
    const requestId=crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`;
    try{
      const result=await PathBackend.rpc('record_branch_repetition',{p_module_id:m.id,p_safety_ack:ack,p_request_id:requestId});
      const row=Array.isArray(result)?result[0]:result,existing=progressFor(m);
      if(existing)Object.assign(existing,row);else progress.push({branch_id:m.branch_id,module_id:m.id,...row});
      document.getElementById('branch-progress-note').textContent=row?.status==='completed'?'Minimum repetition requirement met. This session is integrated.':row?.status==='review'?'Minimum repetitions complete. Readiness review is now required.':`Repetitions: ${row?.repetitions||0} of ${m.minimum_repetitions||1} minimum.`;
      render();setTimeout(()=>openModule(m,branch),350);
    }catch(e){
      console.error(e);
      document.getElementById('branch-progress-note').textContent=e.message||'Could not record this repetition.';
      button.disabled=false;button.textContent='Record This Repetition';
    }
  }

  async function submitReadiness(m,branch,state){
    const note=document.getElementById('branch-readiness-note')?.value||'';
    const status=document.getElementById('branch-progress-note');if(status)status.textContent='Saving readiness…';
    try{
      const result=await PathBackend.rpc('submit_branch_readiness',{p_module_id:m.id,p_state:state,p_note:note});
      const existing=progressFor(m);if(existing){existing.status=result.status;existing.readiness_state=result.readiness_state;if(result.status==='completed')existing.completed_at=new Date().toISOString()}
      if(status)status.textContent=result.message||'Readiness saved.';
      render();setTimeout(()=>openBranch(branch),500);
    }catch(e){console.error(e);if(status)status.textContent=e.message||'Could not save readiness.'}
  }

  function openBranchJournal(m,branch){
    window.ASCENDJournalContext={
      kind:branch.slug===PHASE_II_SLUG?'phase_ii':PHASE_I_ADDITIONAL.has(branch.slug)?'phase_i_additional':'practice_branch',
      branchId:branch.id,
      branchSlug:branch.slug,
      branchTitle:branch.title,
      moduleId:m.id,
      moduleNumber:m.module_number,
      moduleTitle:m.title
    };
    document.dispatchEvent(new CustomEvent('ascend:journal-context',{detail:window.ASCENDJournalContext}));
    document.getElementById('branch-overlay')?.classList.add('hidden');
    document.querySelector('.bottom-nav button[data-screen="journal"]')?.click();
    const form=document.getElementById('journal-form');if(!form)return;
    const obs=form.querySelector('[name="observation"]'),life=form.querySelector('[name="life_application"]'),unresolved=form.querySelector('[name="unresolved"]');
    if(obs&&!obs.value)obs.value=`${branch.title} · Session ${m.module_number}: ${m.title}\n\n${m.journal_prompt||''}`;
    if(life&&!life.value)life.value=m.field_assignment||'';
    if(unresolved&&!unresolved.value)unresolved.value='What remains unclear, ambiguous, or unfinished after this session?';
    obs?.focus();
  }

  document.addEventListener('click',e=>{if(e.target.matches('.branch-close'))document.getElementById('branch-overlay')?.classList.add('hidden')});
  window.ASCENDBranches={load,render,phaseIIAccess:()=>({...phaseIIAccess})};
  setTimeout(load,1400);
})();
