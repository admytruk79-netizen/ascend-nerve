(()=>{
  const form=document.getElementById('journal-form');
  if(!form||form.dataset.remoteAuthority==='true')return;
  form.dataset.remoteAuthority='true';

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

  function returnToToday(){
    requestAnimationFrame(()=>window.ASCENDUX?.activateScreen?.('today'));
  }

  form.addEventListener('submit',async event=>{
    event.preventDefault();
    event.stopImmediatePropagation();

    const status=document.getElementById('journal-status');
    if(!window.ASCENDJournalValidation?.hasMeaningfulContent(form)){
      if(status)status.textContent='Write at least one observation before saving this reflection.';
      form.elements?.namedItem('observation')?.focus();
      return;
    }

    const entry=entryFromForm();
    const signedIn=!!window.PathBackend?.isSignedIn?.();

    if(signedIn){
      try{
        setSync('SYNCING…');
        const currentUser=await window.PathBackend.me();
        const stage=window.currentStage;
        if(!currentUser||!stage?.id)throw new Error('ASCEND is still loading your current stage.');
        await window.PathBackend.saveJournal(currentUser.id,stage.id,entry);
        if(status)status.textContent='Reflection saved privately to your ASCEND Path journal.';
        setSync('SYNCED',true);
        form.reset();
        window.ASCENDMirror?.load?.('stage');
        document.dispatchEvent(new CustomEvent('ascend:journal-saved',{detail:{remote:true,stageId:stage.id}}));
        returnToToday();
        return;
      }catch(error){
        console.error('ASCEND remote Journal save failed',error);
      }
    }

    const saved=saveLocal(entry);
    if(status)status.textContent=signedIn
      ?(saved?'Connection unavailable. Reflection saved on this device and can be synchronized later.':'Reflection could not be saved. Please keep this page open and try again.')
      :(saved?'Reflection saved privately on this device. Sign in to synchronize it.':'Reflection could not be saved on this device.');
    setSync(saved?'LOCAL':'UNSAVED');
    if(saved)form.reset();
    document.dispatchEvent(new CustomEvent('ascend:journal-saved',{detail:{remote:false,saved}}));
  },{capture:true});
})();