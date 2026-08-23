(()=>{
  const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let branches=[],modules=[],progress=[];

  async function load(){
    if(!window.PathBackend?.isSignedIn?.())return;
    try{
      [branches,modules,progress]=await Promise.all([
        PathBackend.rest('training_branches',{query:'is_published=eq.true&select=*&order=sort_order.asc'}),
        PathBackend.rest('training_branch_modules',{query:'is_published=eq.true&select=*&order=module_number.asc'}),
        PathBackend.rest('training_branch_progress',{query:'select=*'})
      ]);
      render();
    }catch(e){console.error('Branch load failed',e)}
  }

  function progressFor(m){return progress.find(p=>p.module_id===m.id)||null}
  function currentFor(branch){
    const ms=modules.filter(m=>m.branch_id===branch.id);
    const completed=new Set(progress.filter(p=>p.branch_id===branch.id&&p.status==='completed').map(p=>p.module_id));
    return ms.find(m=>!completed.has(m.id))||null;
  }

  function render(){
    const host=document.getElementById('practice-branches');if(!host)return;host.innerHTML='';
    branches.forEach(branch=>{
      const ms=modules.filter(m=>m.branch_id===branch.id),done=progress.filter(p=>p.branch_id===branch.id&&p.status==='completed').length,current=currentFor(branch);
      const card=document.createElement('article');card.className='rhythm-card branch-card';
      card.innerHTML=`<div class="eyebrow">PRACTICE BRANCH</div><h2>${esc(branch.title)}</h2><p>${esc(branch.subtitle||branch.description||'Specialized training')}</p><p class="quiet-note">${done} of ${ms.length} modules integrated${current?` · Next: ${esc(current.title)}`:' · Branch complete'}</p><button class="secondary branch-open" type="button">${done?'Continue Branch':'Explore Branch'}</button>`;
      card.querySelector('.branch-open').onclick=()=>openBranch(branch,current);host.appendChild(card);
    });
  }

  function openBranch(branch,current=currentFor(branch)){
    const overlay=document.getElementById('branch-overlay'),body=document.getElementById('branch-body');if(!overlay||!body)return;
    const ms=modules.filter(m=>m.branch_id===branch.id);
    body.innerHTML=`<div class="eyebrow">PRACTICE BRANCH</div><h1>${esc(branch.title)}</h1><p>${esc(branch.description||branch.subtitle||'')}</p><div class="branch-modules">${ms.map(m=>{const p=progressFor(m);const locked=current&&m.module_number>current.module_number;const state=p?.status==='completed'?' · COMPLETE':p?.repetitions?` · ${p.repetitions}/${m.minimum_repetitions||1}`:'';return `<article class="content-card ${locked?'locked':''}" data-module="${m.id}"><small>PHASE ${m.phase_number} · SESSION ${m.module_number}${state}</small><strong>${esc(m.title)}</strong><span>${esc(locked?'Complete the preceding training first.':m.summary||m.outcome||'Training module')}</span></article>`}).join('')}</div>`;
    body.querySelectorAll('.content-card:not(.locked)').forEach(el=>el.onclick=()=>openModule(ms.find(m=>m.id===el.dataset.module),branch));overlay.classList.remove('hidden');
  }

  function openModule(m,branch){
    if(!m)return;const body=document.getElementById('branch-body'),p=progressFor(m),reps=p?.repetitions||0,min=m.minimum_repetitions||1,done=p?.status==='completed';
    const safety=m.safety_level==='enhanced'?`<article class="rhythm-card"><h2>Preparation Gate</h2><p>This is deeper work. Continue only when you have enough time and space to ground afterward. You may pause or stop at any point.</p><label><span>I have read this and choose to continue</span><input type="checkbox" id="branch-safety-ack"/></label></article>`:'';
    body.innerHTML=`<div class="eyebrow">${esc(branch.title)} · SESSION ${m.module_number}</div><h1>${esc(m.title)}</h1><p>${esc(m.summary||'')}</p>${safety}<article class="rhythm-card"><h2>Primary Journey</h2><p>${esc(m.primary_practice||'')}</p></article><article class="rhythm-card"><h2>Micro-Practice</h2><p>${esc(m.micro_practice||'')}</p></article><article class="rhythm-card"><h2>In Ordinary Life</h2><p>${esc(m.field_assignment||'')}</p></article><article class="rhythm-card"><h2>Journal</h2><p>${esc(m.journal_prompt||'')}</p><button class="secondary" id="branch-journal" type="button">Open Journal</button></article><article class="rhythm-card"><h2>Integration</h2><p>${esc(m.integration_practice||'')}</p></article><p class="quiet-note" id="branch-progress-note">${done?'Session integrated.':`Repetitions: ${reps} of ${min} minimum.`}</p><button class="primary" id="branch-record" type="button" ${done?'disabled':''}>${done?'Integrated ✓':'Record This Repetition'}</button><button class="secondary" id="branch-back" type="button">Back to Branch</button>`;
    document.getElementById('branch-back').onclick=()=>openBranch(branch);
    document.getElementById('branch-journal').onclick=()=>openBranchJournal(m,branch);
    const record=document.getElementById('branch-record');if(record&&!done)record.onclick=()=>recordRepetition(m,branch,record);
  }

  async function recordRepetition(m,branch,button){
    const ack=m.safety_level==='enhanced'?!!document.getElementById('branch-safety-ack')?.checked:true;
    if(m.safety_level==='enhanced'&&!ack){document.getElementById('branch-progress-note').textContent='Read and acknowledge the preparation gate before recording this deeper session.';return}
    button.disabled=true;button.textContent='Saving…';
    try{
      const result=await PathBackend.rpc('record_branch_repetition',{p_module_id:m.id,p_safety_ack:ack});
      const row=Array.isArray(result)?result[0]:result;
      const existing=progressFor(m);
      if(existing){Object.assign(existing,row)}else progress.push({branch_id:m.branch_id,module_id:m.id,...row});
      document.getElementById('branch-progress-note').textContent=row?.status==='completed'?'Minimum repetition requirement met. This session is now integrated.':`Repetitions: ${row?.repetitions||0} of ${m.minimum_repetitions||1} minimum.`;
      button.textContent=row?.status==='completed'?'Integrated ✓':'Record This Repetition';button.disabled=row?.status==='completed';render();
      if(row?.status==='completed')setTimeout(()=>openBranch(branch),650);
    }catch(e){console.error(e);document.getElementById('branch-progress-note').textContent=e.message||'Could not record this repetition.';button.disabled=false;button.textContent='Record This Repetition'}
  }

  function openBranchJournal(m,branch){
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
  window.ASCENDBranches={load,render};setTimeout(load,1400);
})();