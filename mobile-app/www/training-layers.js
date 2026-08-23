(()=>{
  const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const sectionTitle={applied:'APPLIED LIFE',conduct:'CONDUCT & CHARACTER',relationship:'RELATIONSHIP PRACTICE',body_breath:'BODY & BREATH',maintenance:'MAINTENANCE',integration:'INTEGRATION'};
  let assignments=[],logs=[],user=null,currentMonth=1;

  function ensureHosts(){
    const today=document.getElementById('today');if(!today)return null;
    let host=document.getElementById('training-in-life');
    if(!host){host=document.createElement('section');host.id='training-in-life';host.className='training-layers';const note=today.querySelector('.quiet-note');today.insertBefore(host,note||null)}
    return host;
  }

  function maxMonthForStage(sort){return sort<=7?sort:(sort===8?18:24)}
  async function resolveMonth(){
    const [profiles,stages,progress]=await Promise.all([
      PathBackend.rest('path_profiles',{query:`user_id=eq.${user.id}&select=path_started_at,current_stage_id`}),
      PathBackend.rest('path_stages',{query:'select=id,sort_order&order=sort_order.asc'}),
      PathBackend.rest('path_student_progress',{query:`user_id=eq.${user.id}&select=stage_id,status,started_at&order=started_at.asc`})
    ]);
    const profile=profiles[0]||{};const active=progress.find(p=>p.status==='active'||p.status==='review')||progress[progress.length-1];const stage=stages.find(s=>s.id===(active?.stage_id||profile.current_stage_id))||stages[0];
    const started=new Date(profile.path_started_at||Date.now()),now=new Date();
    const elapsed=Math.max(1,(now.getFullYear()-started.getFullYear())*12+(now.getMonth()-started.getMonth())+1);
    return Math.max(1,Math.min(24,elapsed,maxMonthForStage(stage?.sort_order||1)));
  }

  async function load(){
    if(!window.PathBackend?.isSignedIn?.())return renderSignedOut();
    try{
      user=await PathBackend.me();if(!user)return renderSignedOut();
      currentMonth=await resolveMonth();
      [assignments,logs]=await Promise.all([
        PathBackend.rest('path_training_assignments',{query:'is_published=eq.true&select=*&order=sort_order.asc'}),
        PathBackend.rest('path_training_assignment_logs',{query:`user_id=eq.${user.id}&select=*&order=log_date.desc&limit=240`})
      ]);
      render();
    }catch(e){console.error('Training layer load failed',e)}
  }

  function completedToday(id){const d=new Date().toISOString().slice(0,10);return logs.some(l=>l.assignment_id===id&&l.log_date===d&&['practiced','completed'].includes(l.status))}
  function renderSignedOut(){const h=ensureHosts();if(!h)return;h.innerHTML='<div class="eyebrow">TRAINING IN LIFE</div><article class="rhythm-card"><h2>Practice beyond the sitting</h2><p>Sign in to load the applied-life, maintenance and integration work for your current month.</p></article>'}

  function render(){
    const host=ensureHosts();if(!host)return;
    const current=assignments.filter(a=>Number(a.metadata?.month_number)===currentMonth);
    const grouped={};current.forEach(a=>(grouped[a.assignment_type]??=[]).push(a));
    let html=`<div class="training-life-head"><div><div class="eyebrow">TRAINING IN LIFE</div><h2>Carry the work into the day</h2></div><div class="training-month">MONTH ${currentMonth} · 24</div></div><p class="quiet-note training-intro">The formal practice is only one part of the work. This month's assignments carry it into ordinary life while established capacities remain active.</p>`;
    for(const type of ['applied','conduct','relationship','body_breath','maintenance','integration']){
      if(!grouped[type]?.length)continue;html+=`<div class="training-group"><div class="eyebrow">${sectionTitle[type]}</div>`;
      for(const a of grouped[type]){const done=completedToday(a.id);html+=`<article class="rhythm-card training-card ${done?'done':''}" data-assignment="${a.id}"><h2>${esc(a.title)}</h2><p>${esc(a.instruction)}</p><p class="quiet-note">${esc(a.cadence||'Ongoing')}</p><button class="secondary training-log" type="button">${done?'Practiced Today ✓':'Mark Practiced Today'}</button></article>`}html+='</div>';
    }
    html+='<button class="secondary" id="view-training-matrix" type="button">View 24-Month Training Matrix</button>';
    host.innerHTML=html;host.querySelectorAll('.training-log').forEach(btn=>btn.addEventListener('click',()=>logPractice(btn.closest('[data-assignment]')?.dataset.assignment)));document.getElementById('view-training-matrix')?.addEventListener('click',showMatrix);
  }

  async function logPractice(id){if(!id||!user)return;const today=new Date().toISOString().slice(0,10);try{await PathBackend.rest('path_training_assignment_logs',{method:'POST',body:{user_id:user.id,assignment_id:id,log_date:today,status:'practiced'},prefer:'resolution=merge-duplicates,return=minimal'});logs.push({assignment_id:id,log_date:today,status:'practiced'});render()}catch(e){console.error(e)}}

  function showMatrix(){
    const overlay=document.getElementById('branch-overlay'),body=document.getElementById('branch-body');if(!overlay||!body)return;
    const months=[...Array(24)].map((_,i)=>i+1);
    body.innerHTML='<div class="eyebrow">24-MONTH TRAINING MATRIX</div><h1>Practice Beyond the Cushion</h1><p>Inner practice is paired with application, conduct, relationship, embodiment, maintenance or integration. Earlier capacities recede in frequency; they are not discarded.</p>'+months.map(m=>{const xs=assignments.filter(x=>Number(x.metadata?.month_number)===m);return `<article class="rhythm-card"><div class="eyebrow">MONTH ${m}</div>${xs.map(x=>`<p><strong>${sectionTitle[x.assignment_type]||esc(x.assignment_type)}</strong><br>${esc(x.title)} <span class="quiet-note">· ${esc(x.cadence||'')}</span></p>`).join('')}</article>`}).join('');
    overlay.classList.remove('hidden');
  }

  const style=document.createElement('style');style.textContent='.training-life-head{display:flex;justify-content:space-between;gap:12px;align-items:end;margin-top:26px}.training-life-head h2{margin:4px 0}.training-month{font-size:10px;letter-spacing:.16em;opacity:.6;white-space:nowrap}.training-card.done{border-color:rgba(201,162,39,.5);background:rgba(201,162,39,.07)}#view-training-matrix{width:100%;margin-top:8px}';document.head.appendChild(style);
  window.ASCENDTrainingLayers={load,render};setTimeout(load,1700);window.addEventListener('focus',()=>{if(window.PathBackend?.isSignedIn?.())load()});
})();