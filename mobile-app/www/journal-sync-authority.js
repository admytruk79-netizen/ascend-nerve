(()=>{
  const form=document.getElementById('journal-form');
  if(!form||form.dataset.remoteAuthority==='true')return;
  form.dataset.remoteAuthority='true';

  function setSync(text){
    const node=document.getElementById('sync-state');
    if(node)node.textContent=text;
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
  function buildEntry(){
    const values=new FormData(form);
    const entry={created_at:new Date().toISOString()};
    for(const[k,v]of values.entries())entry[k]=String(v).trim();
    return entry;
  }
  function emitSaved(detail){
    document.dispatchEvent(new CustomEvent('ascend:journal-saved',{detail}));
  }

  form.addEventListener('submit',async event=>{
    if(!window.ASCENDJournalValidation?.hasMeaningfulContent(form))return;

    event.preventDefault();
    event.stopImmediatePropagation();

    const status=document.getElementById('journal-status');
    const entry=buildEntry();
    const signedIn=!!window.PathBackend?.isSignedIn?.();

    if(!signedIn){
      if(saveLocal(entry)){
        if(status)status.textContent='Reflection saved privately on this device. Sign in to synchronize it.';
        setSync('LOCAL');
        form.reset();
        emitSaved({remote:false,signedIn:false});
      }else if(status){
        status.textContent='Reflection could not be saved on this device. Please try again.';
      }
      return;
    }

    try{
      setSync('SYNCING…');
      const currentUser=await window.PathBackend.me();
      const stage=window.currentStage;
      if(!currentUser||!stage?.id)throw new Error('ASCEND is still loading your current stage.');
      await window.PathBackend.saveJournal(currentUser.id,stage.id,entry);
      if(status)status.textContent='Reflection saved privately to your ASCEND Path journal.';
      setSync('SYNCED');
      form.reset();
      window.ASCENDMirror?.load?.('stage');
      emitSaved({remote:true,stageId:stage.id});
    }catch(error){
      console.error('ASCEND remote Journal save failed',error);
      if(saveLocal(entry)){
        if(status)status.textContent='Connection unavailable. Reflection saved on this device and can be synchronized later.';
        setSync('LOCAL');
        form.reset();
        emitSaved({remote:false,signedIn:true});
      }else if(status){
        status.textContent='Reflection could not be saved. Please try again when your connection is available.';
      }
    }
  },{capture:true});
})();
