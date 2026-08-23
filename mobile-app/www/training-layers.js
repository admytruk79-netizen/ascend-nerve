(()=>{
  const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let assignments=[],logs=[],user=null,lastStageId=null;

  function ensureHosts(){
    const today=document.getElementById('today');
    if(!today)return null;
    let host=document.getElementById('training-in-life');
    if(!host){
      host=document.createElement('section');
      host.id='training-in-life';
      host.className='training-layers';
      const note=today.querySelector('.quiet-note');
      today.insertBefore(host,note||null);
    }
    return host;
  }

  async function load(){
    if(!window.PathBackend?.isSignedIn?.())return renderSignedOut();
    try{
      user=await PathBackend.me();
      if(!user)return renderSignedOut();
      [assignments,logs]=await Promise.all([
        PathBackend.rest('path_training_assignments',{query:'is_published=eq.true&select=*&order=sort_order.asc'}),
        PathBackend.rest('path_training_assignment_logs',{query:`user_id=eq.${user.id}&select=*&order=log_date.desc&limit=120`})
      ]);
      render();
    }catch(e){console.error('Training layer load failed',e)}
  }

  function activeStage(){
    const curriculum=window.curriculum;
    const title=document.getElementById('stage-title')?.textContent?.trim();
    return curriculum?.stages?.find(s=>s.title===title)||null;
  }

  function completedToday(id){
    const today=new Date().toISOString().slice(0,10);
    return logs.some(l=>l.assignment_id===id&&l.log_date===today&&['practiced','completed'].includes(l.status));
  }

  const sectionTitle={
    applied:'APPLIED LIFE',conduct:'CONDUCT & CHARACTER',relationship:'RELATIONSHIP PRACTICE',maintenance:'MAINTENANCE',integration:'INTEGRATION',body_breath:'BODY & BREATH'
  };

  function renderSignedOut(){
    const host=ensureHosts();if(!host)return;
    host.innerHTML='<div class="eyebrow">TRAINING IN LIFE</div><article class="rhythm-card"><h2>Practice beyond the sitting</h2><p>Sign in to load applied practice, maintenance and conduct training for your current stage.</p></article>';
  }

  function render(){
    const host=ensureHosts(),stage=activeStage();if(!host||!stage)return;
    lastStageId=stage.id;
    const current=assignments.filter(a=>a.stage_id===stage.id);
    if(!current.length){host.innerHTML='';return}
    const grouped={};current.forEach(a=>(grouped[a.assignment_type]??=[]).push(a));
    let html='<div class="eyebrow">TRAINING IN LIFE</div><p class="quiet-note training-intro">The formal practice is only one part of the work. These assignments carry the current stage into ordinary life while earlier capacities remain active.</p>';
    for(const type of ['applied','conduct','relationship','body_breath','maintenance','integration']){
      if(!grouped[type]?.length)continue;
      html+=`<div class="training-group"><div class="eyebrow">${sectionTitle[type]}</div>`;
      for(const a of grouped[type]){
        const done=completedToday(a.id);
        html+=`<article class="rhythm-card training-card ${done?'done':''}" data-assignment="${a.id}"><h2>${esc(a.title)}</h2><p>${esc(a.instruction)}</p><p class="quiet-note">${esc(a.cadence||'Ongoing')}</p><button class="secondary training-log" type="button">${done?'Practiced Today ✓':'Mark Practiced Today'}</button></article>`;
      }
      html+='</div>';
    }
    host.innerHTML=html;
    host.querySelectorAll('.training-log').forEach(btn=>btn.addEventListener('click',()=>logPractice(btn.closest('[data-assignment]')?.dataset.assignment)));
  }

  async function logPractice(id){
    if(!id||!user)return;
    const today=new Date().toISOString().slice(0,10);
    try{
      await PathBackend.rest('path_training_assignment_logs',{method:'POST',body:{user_id:user.id,assignment_id:id,log_date:today,status:'practiced'},prefer:'resolution=merge-duplicates,return=representation'});
      const existing=logs.find(l=>l.assignment_id===id&&l.log_date===today);
      if(existing)existing.status='practiced';else logs.push({assignment_id:id,log_date:today,status:'practiced'});
      render();
    }catch(e){console.error(e)}
  }

  const stageTitle=document.getElementById('stage-title');
  if(stageTitle)new MutationObserver(()=>{const stage=activeStage();if(stage&&stage.id!==lastStageId)render()}).observe(stageTitle,{childList:true,subtree:true,characterData:true});
  window.ASCENDTrainingLayers={load,render};
  setTimeout(load,1700);
  window.addEventListener('focus',()=>{if(window.PathBackend?.isSignedIn?.())load()});
})();