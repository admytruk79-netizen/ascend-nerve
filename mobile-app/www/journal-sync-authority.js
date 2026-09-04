(()=>{
  const form=document.getElementById('journal-form');
  if(!form||form.dataset.remoteAuthority==='true')return;
  form.dataset.remoteAuthority='true';
  const CONTEXT_KEY='ascendJournalContext';

  function setSync(text){
    const node=document.getElementById('sync-state');
    if(node)node.textContent=text;
  }
  function readStoredState(){
    try{return JSON.parse(localStorage.getItem('ascendPathState')||'{}')}catch{return{}}
  }
  function mergeUnique(current=[],incoming=[]){
    const seen=new Set();
    return [...current,...incoming].filter(item=>{
      const key=JSON.stringify(item);
      if(seen.has(key))return false;
      seen.add(key);
      return true;
    });
  }
  function normalizeContext(value){
    if(!value||typeof value!=='object')return null;
    const context={type:String(value.type||'').slice(0,40)};
    ['branchId','branchSlug','branchTitle','moduleId','moduleTitle','phaseTitle'].forEach(key=>{if(value[key]!=null)context[key]=String(value[key]).slice(0,240)});
    ['moduleNumber','phaseNumber'].forEach(key=>{if(Number.isFinite(Number(value[key])))context[key]=Number(value[key])});
    return context.type?context:null;
  }
  function readContext(){
    try{return normalizeContext(JSON.parse(sessionStorage.getItem(CONTEXT_KEY)||'null'))}catch{return null}
  }
  function setContext(value){
    const context=normalizeContext(value);
    if(context)sessionStorage.setItem(CONTEXT_KEY,JSON.stringify(context));
    else sessionStorage.removeItem(CONTEXT_KEY);
    return context;
  }
  function clearContext(){sessionStorage.removeItem(CONTEXT_KEY)}
  window.ASCENDJournalContext={set:setContext,peek:readContext,clear:clearContext};

  function saveLocal(entry){
    try{
      const stored=readStoredState();
      const owner=(typeof localState==='object'&&localState)?localState:stored;
      owner.practiceDays=Math.max(Number(owner.practiceDays)||0,Number(stored.practiceDays)||0);
      owner.entries=mergeUnique(Array.isArray(stored.entries)?stored.entries:[],Array.isArray(owner.entries)?owner.entries:[]);
      owner.pendingPractices=mergeUnique(Array.isArray(stored.pendingPractices)?stored.pendingPractices:[],Array.isArray(owner.pendingPractices)?owner.pendingPractices:[]);
      owner.entries.push(entry);
      localStorage.setItem('ascendPathState',JSON.stringify(owner));
      return true;
    }catch(error){
      console.warn('ASCEND local Journal fallback failed',error);
      return false;
    }
  }
  function emitSaved(detail){
    document.dispatchEvent(new CustomEvent('ascend:journal-saved',{detail}));
  }
  async function saveRemote(userId,stageId,entry){
    return window.PathBackend.rest('path_journal_entries',{
      method:'POST',
      body:{
        user_id:userId,
        stage_id:stageId,
        entry_date:new Date().toISOString().slice(0,10),
        observation:entry.observation||null,
        body_sensation:entry.body_sensation||null,
        inner_state:entry.inner_state||null,
        resistance:entry.resistance||null,
        life_application:entry.life_application||null,
        interpretation:entry.interpretation||null,
        unresolved:entry.unresolved||null,
        teacher_question:entry.teacher_question||null,
        share_with_teacher:entry.share_with_teacher==='on'||entry.share_with_teacher==='true',
        context:entry.context||{}
      },
      prefer:'return=representation'
    });
  }

  form.addEventListener('submit',async event=>{
    if(!window.ASCENDJournalValidation?.hasMeaningfulContent(form))return;

    /* Journal persistence has one authority for both remote and local saves.
       Local fallback writes through app.js's long-lived localState owner so a
       later writer cannot serialize stale state over a saved reflection. */
    event.preventDefault();
    event.stopImmediatePropagation();

    const status=document.getElementById('journal-status');
    const values=new FormData(form);
    const context=readContext();
    const entry={created_at:new Date().toISOString()};
    for(const[k,v]of values.entries())entry[k]=String(v).trim();
    if(context)entry.context=context;

    if(!window.PathBackend?.isSignedIn?.()){
      if(!saveLocal(entry)){
        if(status)status.textContent='Could not save this reflection on this device.';
        setSync('LOCAL ERROR');
        return;
      }
      if(status)status.textContent='Reflection saved privately on this device. Sign in to synchronize it.';
      setSync('LOCAL');
      form.reset();
      clearContext();
      emitSaved({remote:false,signedIn:false,context});
      return;
    }

    try{
      setSync('SYNCING…');
      const currentUser=await window.PathBackend.me();
      const stage=window.currentStage;
      if(!currentUser||!stage?.id)throw new Error('ASCEND is still loading your current stage.');
      await saveRemote(currentUser.id,stage.id,entry);
      if(status)status.textContent='Reflection saved privately to your ASCEND Path journal.';
      setSync('SYNCED');
      form.reset();
      clearContext();
      window.ASCENDMirror?.load?.('stage');
      emitSaved({remote:true,stageId:stage.id,context});
    }catch(error){
      console.error('ASCEND remote Journal save failed',error);
      if(!saveLocal(entry)){
        if(status)status.textContent='Connection unavailable and this reflection could not be saved locally.';
        setSync('LOCAL ERROR');
        return;
      }
      if(status)status.textContent='Connection unavailable. Reflection saved on this device and can be synchronized later.';
      setSync('LOCAL');
      form.reset();
      clearContext();
      emitSaved({remote:false,signedIn:true,context});
    }
  },{capture:true});
})();
