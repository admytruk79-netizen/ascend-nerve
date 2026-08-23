(()=>{
  const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const sectionTitle={applied:'APPLIED LIFE',conduct:'CONDUCT & CHARACTER',relationship:'RELATIONSHIP PRACTICE',body_breath:'BODY & BREATH',maintenance:'MAINTENANCE',integration:'INTEGRATION'};
  let assignments=[],logs=[],user=null,currentMonth=1,maintenanceDue=[];

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
      [assignments,logs,maintenanceDue]=await Promise.all([
        PathBackend.rest('path_training_assignments',{query:'is_published=eq.true&select=*&order=sort_order.asc'}),
        PathBackend.rest('path_training_assignment_logs',{query:`user_id=eq.${user.id}&select=*&order=log_date.desc&limit=240`}),
        PathBackend.rpc('path_get_maintenance_due',{p_month:currentMonth})
      ]);
      render();
    }catch(e){console.error('Training layer load failed',e)}
  }

  function completedToday(id){const d=new Date().toISOString().slice(0,10);return logs.some(l=>l.assignment_id===id&&l.log_date===d&&['practiced','completed'].includes(l.status))}
  function renderSignedOut(){const h=ensureHosts();if(!h)return;h.innerHTML='<div class="eyebrow">TRAINING IN LIFE</div><article class="rhythm-card"><h2>Practice beyond the sitting</h2><p>Sign in to load the applied-life, maintenance and integration work for your current month.</p></article>'}

  function maintenanceCard(){
    const m=maintenanceDue?.[0];if(!m)return '';
    const due=!!m.due_now,remaining=Math.max(0,Number(m.target_count||0)-Number(m.completed_count||0));
    return `<div class="training-group"><div class="eyebrow">MAINTENANCE</div><article class="rhythm-card training-card maintenance-live ${due?'due':'complete'}" data-assignment="${m.assignment_id}"><div class="maintenance-status">${due?'DUE':'ON RHYTHM'}</div><h2>${esc(m.title)}</h2><p>${esc(m.instruction)}</p><div class="maintenance-meter"><span style="width:${Math.min(100,(Number(m.completed_count||0)/Math.max(1,Number(m.target_count||1)))*100)}%"></span></div><p class="quiet-note">${Number(m.completed_count||0)} of ${Number(m.target_count||0)} ${esc(m.period_label||'this period')} · ${esc(m.cadence||'')}</p>${due?`<button class="secondary training-log" type="button">${completedToday(m.assignment_id)?'Practiced Today ✓':remaining===1?'Complete Maintenance':'Mark Maintenance Practiced'}</button>`:'<button class="secondary" type="button" disabled>Maintenance Complete for This Period ✓</button>'}</article></div>`;
  }

  function render(){
    const host=ensureHosts();if(!host)return;
    const current=assignments.filter(a=>Number(a.metadata?.month_number)===currentMonth&&a.assignment_type!=='maintenance');
    const grouped={};current.forEach(a=>(grouped[a.assignment_type]??=[]).push(a));
    let html=`<div class="training-life-head"><div><div class="eyebrow">TRAINING IN LIFE</div><h2>Carry the work into the day</h2></div><div class="training-month">MONTH ${currentMonth} · 24</div></div><p class="quiet-note training-intro">The formal practice is only one part of the work. This month's assignments carry it into ordinary life while established capacities return on a reduced maintenance rhythm.</p>`;
    for(const type of ['applied','conduct','relationship','body_breath']){
      if(!grouped[type]?.length)continue;html+=`<div class="training-group"><div class="eyebrow">${sectionTitle[type]}</div>`;
      for(const a of grouped[type]){const done=completedToday(a.id);html+=`<article class="rhythm-card training-card ${done?'done':''}" data-assignment="${a.id}"><h2>${esc(a.title)}</h2><p>${esc(a.instruction)}</p><p class="quiet-note">${esc(a.cadence||'Ongoing')}</p><button class="secondary training-log" type="button">${done?'Practiced Today ✓':'Mark Practiced Today'}</button></article>`}html+='</div>';
    }
    html+=maintenanceCard();
    for(const type of ['integration']){
      if(!grouped[type]?.length)continue;html+=`<div class="training-group"><div class="eyebrow">${sectionTitle[type]}</div>`;
      for(const a of grouped[type]){const done=completedToday(a.id);html+=`<article class="rhythm-card training-card ${done?'done':''}" data-assignment="${a.id}"><h2>${esc(a.title)}</h2><p>${esc(a.instruction)}</p><p class="quiet-note">${esc(a.cadence||'Ongoing')}</p><button class="secondary training-log" type="button">${done?'Practiced Today ✓':'Mark Practiced Today'}</button></article>`}html+='</div>';
    }
    html+='<button class="secondary" id="view-training-matrix" type="button">View 24-Month Training Matrix</button>';
    host.innerHTML=html;host.querySelectorAll('.training-log').forEach(btn=>btn.addEventListener('click',()=>logPractice(btn.closest('[data-assignment]')?.dataset.assignment)));document.getElementById('view-training-matrix')?.addEventListener('click',showMatrix);
  }

  async function logPractice(id){if(!id||!user)return;const today=new Date().toISOString().slice(0,10);try{await PathBackend.rest('path_training_assignment_logs',{method:'POST',body:{user_id:user.id,assignment_id:id,log_date:today,status:'practiced'},prefer:'resolution=merge-duplicates,return=minimal'});logs=logs.filter(l=>!(l.assignment_id===id&&l.log_date===today));logs.push({assignment_id:id,log_date:today,status:'practiced'});maintenanceDue=await PathBackend.rpc('path_get_maintenance_due',{p_month:currentMonth});render()}catch(e){console.error(e)}}

  function showMatrix(){
    const overlay=document.getElementById('branch-overlay'),body=document.getElementById('branch-body');if(!overlay||!body)return;
    const months=[...Array(24)].map((_,i)=>i+1);
    body.innerHTML='<div class="eyebrow">24-MONTH TRAINING MATRIX</div><h1>Practice Beyond the Cushion</h1><p>Inner practice is paired with application, conduct, relationship, embodiment, maintenance or integration. Maintenance schedules supersede earlier schedules as the training develops, so earlier capacities continue without overwhelming the day.</p>'+months.map(m=>{const xs=assignments.filter(x=>Number(x.metadata?.month_number)===m);return `<article class="rhythm-card"><div class="eyebrow">MONTH ${m}</div>${xs.map(x=>`<p><strong>${sectionTitle[x.assignment_type]||esc(x.assignment_type)}</strong><br>${esc(x.title)} <span class="quiet-note">· ${esc(x.cadence||'')}</span></p>`).join('')}</article>`}).join('');
    overlay.classList.remove('hidden');
  }

  const style=document.createElement('style');style.textContent='.training-life-head{display:flex;justify-content:space-between;gap:12px;align-items:end;margin-top:26px}.training-life-head h2{margin:4px 0}.training-month{font-size:10px;letter-spacing:.16em;opacity:.6;white-space:nowrap}.training-card.done{border-color:rgba(201,162,39,.5);background:rgba(201,162,39,.07)}#view-training-matrix{width:100%;margin-top:8px}.maintenance-live{position:relative;overflow:hidden}.maintenance-live.due{border-color:rgba(85,200,189,.30)}.maintenance-status{font:9px Arial,sans-serif;letter-spacing:.16em;color:var(--teal);margin-bottom:9px}.maintenance-meter{height:3px;border-radius:3px;background:rgba(255,255,255,.07);overflow:hidden;margin:14px 0 9px}.maintenance-meter span{display:block;height:100%;background:linear-gradient(90deg,var(--gold),var(--teal));transition:width .45s ease}.maintenance-live.complete{opacity:.78}';document.head.appendChild(style);
  window.ASCENDTrainingLayers={load,render};setTimeout(load,1700);window.addEventListener('focus',()=>{if(window.PathBackend?.isSignedIn?.())load()});
})();