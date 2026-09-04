(()=>{
  const finish=document.getElementById('finish-practice');
  if(!finish)return;

  let submitting=false;

  function persistPendingAttempt(reason){
    try{
      if(!Array.isArray(localState.pendingPractices))localState.pendingPractices=[];
      localState.pendingPractices.push({
        stage_id:currentStage?.id||null,
        practice_id:currentPractice?.id||null,
        attempted_at:new Date().toISOString(),
        reason:String(reason||'sync_failed')
      });
      localStorage.setItem('ascendPathState',JSON.stringify(localState));
    }catch(err){console.error('Could not persist pending practice attempt',err)}
  }

  async function complete(){
    if(submitting)return false;
    stop();

    if(remaining>0){
      timerHint.textContent='Complete the full practice timer before recording this session.';
      finish.classList.remove('ready');
      return false;
    }
    if(!user||!currentStage||!currentPractice){
      timerHint.textContent='Sign in to record official Path progress. This session has not advanced your stage.';
      setSync('LOCAL');
      return false;
    }

    submitting=true;
    finish.disabled=true;
    finish.textContent='Saving…';
    setSync('SYNCING…');

    try{
      const duration=(currentPractice.default_minutes||10)*60;
      const result=await PathBackend.completePractice({stageId:currentStage.id,practiceId:currentPractice.id,durationSeconds:duration});
      const days=result?.practice_days??progressRow?.practice_days??0;
      if(progressRow){
        progressRow.practice_days=days;
        progressRow.last_practice_date=new Date().toISOString().slice(0,10);
        progressRow.status=result?.stage_status||progressRow.status;
      }
      document.getElementById('primary-check').checked=true;
      renderCounts(days);
      document.getElementById('stage-day').textContent=`DAY ${Math.max(1,days+1)}`;
      timerHint.textContent='Practice confirmed and counted toward your Path.';
      if(result?.current_stage_id&&result.current_stage_id!==currentStage.id)await loadRemote();
      else{renderPath();renderStageReview();setSync('SYNCED',true)}
      resetTimerUI();
      overlay.classList.add('hidden');
      document.dispatchEvent(new CustomEvent('ascend:practice-confirmed',{detail:{stageId:currentStage.id,practiceId:currentPractice.id,practiceDays:days}}));
      return true;
    }catch(err){
      console.error(err);
      persistPendingAttempt(err?.message||'sync_failed');
      timerHint.textContent='Could not verify this completion. It is saved only as a pending attempt and does not count toward progression yet. Retry when connected.';
      setSync('PENDING');
      document.dispatchEvent(new CustomEvent('ascend:practice-pending',{detail:{reason:err?.message||'sync_failed'}}));
      return false;
    }finally{
      submitting=false;
      finish.disabled=false;
      finish.textContent='Finish Practice';
    }
  }

  // This is the sole official progression service. The capture listener keeps
  // the legacy fallback in app.js inert until that monolith is split safely.
  finish.addEventListener('click',event=>{
    event.preventDefault();
    event.stopImmediatePropagation();
    complete();
  },true);

  window.ASCENDPracticeCompletion={complete,isSubmitting:()=>submitting};
})();
