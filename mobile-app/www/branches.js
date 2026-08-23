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
  function currentFor(branch){const ms=modules.filter(m=>m.branch_id===branch.id);const completed=new Set(progress.filter(p=>p.branch_id===branch.id&&p.status==='completed').map(p=>p.module_id));return ms.find(m=>!completed.has(m.id))||ms[ms.length-1]||null}
  function render(){
    const host=document.getElementById('practice-branches');if(!host)return;host.innerHTML='';
    branches.forEach(branch=>{
      const ms=modules.filter(m=>m.branch_id===branch.id),done=progress.filter(p=>p.branch_id===branch.id&&p.status==='completed').length,current=currentFor(branch);
      const card=document.createElement('article');card.className='rhythm-card branch-card';
      card.innerHTML=`<div class="eyebrow">PRACTICE BRANCH</div><h2>${esc(branch.title)}</h2><p>${esc(branch.subtitle||branch.description||'Specialized training')}</p><p class="quiet-note">${done} of ${ms.length} modules integrated${current?` · Next: ${esc(current.title)}`:''}</p><button class="secondary branch-open" type="button">${done?'Continue Branch':'Explore Branch'}</button>`;
      card.querySelector('.branch-open').onclick=()=>openBranch(branch,current);host.appendChild(card);
    });
  }
  function openBranch(branch,current){
    const overlay=document.getElementById('branch-overlay'),body=document.getElementById('branch-body');if(!overlay||!body)return;
    const ms=modules.filter(m=>m.branch_id===branch.id);
    body.innerHTML=`<div class="eyebrow">PRACTICE BRANCH</div><h1>${esc(branch.title)}</h1><p>${esc(branch.description||branch.subtitle||'')}</p><div class="branch-modules">${ms.map(m=>{const p=progress.find(x=>x.module_id===m.id);const locked=current&&m.module_number>current.module_number;return `<article class="content-card ${locked?'locked':''}" data-module="${m.id}"><small>PHASE ${m.phase_number} · SESSION ${m.module_number}</small><strong>${esc(m.title)}</strong><span>${esc(locked?'Complete the preceding training first.':m.summary||m.outcome||'Training module')}</span></article>`}).join('')}</div>`;
    body.querySelectorAll('.content-card:not(.locked)').forEach(el=>el.onclick=()=>openModule(ms.find(m=>m.id===el.dataset.module),branch));overlay.classList.remove('hidden');
  }
  function openModule(m,branch){if(!m)return;const body=document.getElementById('branch-body');body.innerHTML=`<div class="eyebrow">${esc(branch.title)} · SESSION ${m.module_number}</div><h1>${esc(m.title)}</h1><p>${esc(m.summary||'')}</p><article class="rhythm-card"><h2>Primary Journey</h2><p>${esc(m.primary_practice||'')}</p></article><article class="rhythm-card"><h2>Micro-Practice</h2><p>${esc(m.micro_practice||'')}</p></article><article class="rhythm-card"><h2>In Ordinary Life</h2><p>${esc(m.field_assignment||'')}</p></article><article class="rhythm-card"><h2>Journal</h2><p>${esc(m.journal_prompt||'')}</p></article><article class="rhythm-card"><h2>Integration</h2><p>${esc(m.integration_practice||'')}</p></article>${m.safety_level==='enhanced'?'<p class="quiet-note">Deeper work: pause or stop at any point. Allow additional grounding and integration time before continuing.</p>':''}<p class="quiet-note">Minimum repetitions: ${m.minimum_repetitions||1}</p><button class="secondary" id="branch-back" type="button">Back to Branch</button>`;document.getElementById('branch-back').onclick=()=>openBranch(branch,currentFor(branch))}
  document.addEventListener('click',e=>{if(e.target.matches('.branch-close'))document.getElementById('branch-overlay')?.classList.add('hidden')});
  window.ASCENDBranches={load,render};setTimeout(load,1400);
})();