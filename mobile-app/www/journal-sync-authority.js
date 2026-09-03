(()=>{
  const original=document.getElementById('journal-form');
  if(!original)return;
  if(original.dataset.remoteAuthority==='true'&&original.dataset.authorityBound==='true')return;

  /*
   * app.js still attaches a legacy Journal submit listener before the master
   * reconstruction boots. Replace the untouched form once so that listener is
   * physically retired from the live DOM. The cloned form preserves markup,
   * values, names and accessibility while giving Journal one submit owner.
   */
  const form=original.cloneNode(true);
  form.dataset.remoteAuthority='true';
  form.dataset.authorityBound='true';
  original.replaceWith(form);

  function setSync(text,online=false){
    const node=document.getElementById('sync-state');
    if(!node)return;
    node.textContent=text;
    node.classList.toggle('online',online);
  }

  function saveLocal(entry){
    try{
      const state=JSON.parse(localStorage.getItem('ascendPathState')||'{}');
      state.entries=Array.isArray(state.entries)?state.entries:[];
      state.entries.push(entry);
      localStorage.setItem('ascendPathState',JSON.stringify(state));
      return true;
    }catch(error){
      console.warn('ASCEND local Journal fallback failed',error);
      return false;
    }
  }

  function entryFromForm(){
    const values=new FormData(form);
    const entry={created_at:new Date().toISOString()};
    for(const[k,v]of values.entries())entry[k]=String(v).trim();
    return entry;
  }

  function authoritativeProgressRow(){
    const rows=Array.isArray(window.__pathProgress)?window.__pathProgress:[];
    return rows.find(row=>row.status==='active'||row.status==='review')||rows[rows.length-1]||null;
  }

  async function persistenceContext(){
    const row=authoritativeProgressRow();
    let userId=row?.user_id||null;
    let stageId=row?.stage_id||window.currentStage?.id||null;
    if(!userId){
      const currentUser=await window.PathBackend?.me?.();
      userId=currentUser?.id||null;
    }
    return{userId,stageId};
  }

  function returnToToday(){
    requestAnimationFrame(()=>window.ASCENDUX?.activateScreen?.('today'));
  }

  let saving=false;
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(saving)return;

    const status=document.getElementById('journal-status');
    if(!window.ASCENDJournalValidation?.hasMeaningfulContent(form)){
      if(status)status.textContent='Write at least one observation before saving this reflection.';
      form.elements?.namedItem('observation')?.focus();
      return;
    }

    const entry=entryFromForm();
    const signedIn=!!window.PathBackend?.isSignedIn?.();
    saving=true;
    form.setAttribute('aria-busy','true');

    try{
      if(signedIn){
        setSync('SYNCING…');
        const{userId,stageId}=await persistenceContext();
        if(!userId||!stageId)throw new Error('ASCEND is still loading your current stage.');
        await window.PathBackend.saveJournal(userId,stageId,entry);
        if(status)status.textContent='Reflection saved privately to your ASCEND Path journal.';
        setSync('SYNCED',true);
        form.reset();
        window.ASCENDMirror?.load?.('stage');
        document.dispatchEvent(new CustomEvent('ascend:journal-saved',{detail:{remote:true,stageId}}));
        returnToToday();
        return;
      }

      const saved=saveLocal(entry);
      if(status)status.textContent=saved?'Reflection saved privately on this device. Sign in to synchronize it.':'Reflection could not be saved on this device.';
      setSync(saved?'LOCAL':'UNSAVED');
      if(saved)form.reset();
      document.dispatchEvent(new CustomEvent('ascend:journal-saved',{detail:{remote:false,saved}}));
    }catch(error){
      console.error('ASCEND remote Journal save failed',error);
      const saved=saveLocal(entry);
      if(status)status.textContent=saved?'Connection unavailable. Reflection saved on this device and can be synchronized later.':'Reflection could not be saved. Please keep this page open and try again.';
      setSync(saved?'LOCAL':'UNSAVED');
      if(saved)form.reset();
      document.dispatchEvent(new CustomEvent('ascend:journal-saved',{detail:{remote:false,saved}}));
    }finally{
      saving=false;
      form.removeAttribute('aria-busy');
    }
  });
})();