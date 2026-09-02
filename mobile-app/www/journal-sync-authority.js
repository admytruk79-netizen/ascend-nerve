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
    }catch(error){console.warn('ASCEND local Journal fallback failed',error)}
  }

  form.addEventListener('submit',async event=>{
    if(!window.PathBackend?.isSignedIn?.())return;
    if(!window.ASCENDJournalValidation?.hasMeaningfulContent(form))return;

    /* Authenticated Journal saves are handled here before the older fallback
       listener so a UI/bootstrap race can never silently turn a signed-in
       reflection into a local-only entry. */
    event.preventDefault();
    event.stopImmediatePropagation();

    const status=document.getElementById('journal-status');
    const values=new FormData(form);
    const entry={created_at:new Date().toISOString()};
    for(const[k,v]of values.entries())entry[k]=String(v).trim();

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
      document.dispatchEvent(new CustomEvent('ascend:journal-saved',{detail:{remote:true,stageId:stage.id}}));
    }catch(error){
      console.error('ASCEND remote Journal save failed',error);
      saveLocal(entry);
      if(status)status.textContent='Connection unavailable. Reflection saved on this device and can be synchronized later.';
      setSync('LOCAL');
      form.reset();
      document.dispatchEvent(new CustomEvent('ascend:journal-saved',{detail:{remote:false}}));
    }
  },{capture:true});
})();
