(()=>{
  const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const labels={applied:'APPLIED LIFE',maintenance:'MAINTENANCE',conduct:'CONDUCT & CHARACTER',relationship:'RELATIONSHIP',body_breath:'BODY & BREATH',integration:'INTEGRATION'};
  const style=document.createElement('style');
  style.textContent=`.training-life{margin:26px 0 8px}.training-life-head{display:flex;justify-content:space-between;gap:16px;align-items:end;margin-bottom:10px}.training-life-head h2{margin:3px 0 0}.training-month{font-size:10px;letter-spacing:.16em;opacity:.58;white-space:nowrap}.training-card{margin:10px 0;padding:15px 16px;border:1px solid rgba(255,255,255,.1);border-radius:18px;background:rgba(255,255,255,.035)}.training-card.done-today{border-color:rgba(201,162,39,.5);background:rgba(201,162,39,.07)}.training-type{font-size:9px;letter-spacing:.16em;opacity:.6}.training-card strong{display:block;margin-top:6px;font-size:14px}.training-card p{margin:7px 0 8px;font-size:13px;line-height:1.45;opacity:.82}.training-cadence{font-size:10px;opacity:.55}.training-card button{margin-top:10px}.training-plan-link{display:block;margin:14px 0 2px;width:100%}`;
  document.head.appendChild(style);

  async function context(){
    const user=await PathBackend.me(); if(!user)return null;
    const [profiles,stages,progress]=await Promise.all([
      PathBackend.rest('path_profiles',{query:`user_id=eq.${user.id}&select=*`}),
      PathBackend.rest('path_stages',{query:'select=id,sort_order,slug&order=sort_order.asc'}),
      PathBackend.rest('path_student_progress',{query:`user_id=eq.${user.id}&select=*&order=started_at.asc`})
    ]);
    const profile=profiles[0]; if(!profile)return null;
    const current=progress.find(p=>p.status==='active'||p.status==='review')||progress[progress.length-1];
    const stage=stages.find(s=>s.id===current?.stage_id)||stages[0];
    const started=new Date(profile.path_started_at||Date.now()); const now=new Date();
    const elapsed=Math.max(1,(now.getFullYear()-started.getFullYear())*12+(now.getMonth()-started.getMonth())+1);
    const maxByStage=stage.sort_order<=7?stage.sort_order:(stage.sort_order===8?18:24);
    return {user,stage,current,month:Math.max(1,Math.min(24,elapsed,maxByStage))};
  }

  async function load(){
    const host=document.getElementById('training-life'); if(!host||!window.PathBackend?.isSignedIn?.())return;
    try{
      const ctx=await context(); if(!ctx)return;
      const month=ctx.month;
      const [items,logs]=await Promise.all([
        PathBackend.rest('path_training_assignments',{query:`is_published=eq.true&metadata->>month_number=eq.${month}&select=*&order=sort_order.asc`}),
        PathBackend.rest('path_training_assignment_logs',{query:`user_id=eq.${ctx.user.id}&log_date=eq.${new Date().toISOString().slice(0,10)}&select=*`})
      ]);
      render(host,month,items,logs,ctx.user.id);
    }catch(e){console.error('Training in Life load failed',e)}
  }

  function render(host,month,items,logs,userId){
    const done=new Set(logs.filter(x=>x.status==='practiced').map(x=>x.assignment_id));
    host.innerHTML=`<div class="training-life-head"><div><div class="eyebrow">TRAINING IN LIFE</div><h2>Carry the work into the day</h2></div><div class="training-month">MONTH ${month} · 24</div></div>`;
    if(!items.length){host.innerHTML+='<p class="quiet-note">No field assignments are mapped for this month yet.</p>';return}
    items.forEach(item=>{
      const card=document.createElement('article'); card.className='training-card'+(done.has(item.id)?' done-today':'');
      card.innerHTML=`<div class="training-type">${labels[item.assignment_type]||esc(item.assignment_type.toUpperCase())}</div><strong>${esc(item.title)}</strong><p>${esc(item.instruction)}</p><div class="training-cadence">${esc(item.cadence||'')}</div><button class="secondary" type="button">${done.has(item.id)?'Practiced Today ✓':'Mark Practiced Today'}</button>`;
      const b=card.querySelector('button'); b.disabled=done.has(item.id); b.onclick=()=>mark(item,userId,b,card);
      host.appendChild(card);
    });
    const btn=document.createElement('button');btn.className='secondary training-plan-link';btn.type='button';btn.textContent='View the 24-Month Training Matrix';btn.onclick=showPlan;host.appendChild(btn);
  }

  async function mark(item,userId,button,card){
    button.disabled=true;button.textContent='Saving…';
    try{
      await PathBackend.rest('path_training_assignment_logs',{method:'POST',body:{user_id:userId,assignment_id:item.id,log_date:new Date().toISOString().slice(0,10),status:'practiced'},prefer:'return=minimal'});
      card.classList.add('done-today');button.textContent='Practiced Today ✓';
    }catch(e){console.error(e);button.disabled=false;button.textContent='Try Again'}
  }

  async function showPlan(){
    const overlay=document.getElementById('branch-overlay'),body=document.getElementById('branch-body');if(!overlay||!body)return;
    body.innerHTML='<div class="eyebrow">24-MONTH TRAINING MATRIX</div><h1>Practice Beyond the Cushion</h1><p>Loading the complete applied-life, maintenance and integration map…</p>';overlay.classList.remove('hidden');
    try{
      const all=await PathBackend.rest('path_training_assignments',{query:'is_published=eq.true&select=*&order=sort_order.asc'});
      const months=[...Array(24)].map((_,i)=>i+1);
      body.innerHTML='<div class="eyebrow">24-MONTH TRAINING MATRIX</div><h1>Practice Beyond the Cushion</h1><p>Each month pairs inner practice with ordinary-life training. Earlier capacities remain in maintenance rather than disappearing.</p>'+months.map(m=>{const xs=all.filter(x=>Number(x.metadata?.month_number)===m);return `<article class="rhythm-card"><div class="eyebrow">MONTH ${m}</div>${xs.map(x=>`<p><strong>${labels[x.assignment_type]||esc(x.assignment_type)}</strong><br>${esc(x.title)} · <span class="quiet-note">${esc(x.cadence||'')}</span></p>`).join('')}</article>`}).join('');
    }catch(e){body.innerHTML+='<p class="quiet-note">Could not load the full matrix.</p>'}
  }

  window.ASCENDTrainingLife={load};
  document.addEventListener('DOMContentLoaded',()=>setTimeout(load,1500));
})();