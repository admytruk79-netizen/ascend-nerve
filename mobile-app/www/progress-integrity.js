(()=>{
  const finish=document.getElementById('finish-practice');
  const timerHint=document.getElementById('timer-hint');
  const overlay=document.getElementById('practice-overlay');
  if(!finish||!timerHint||!overlay)return;

  let submitting=false;

  function persistPendingAttempt(reason){
    try{
      if(!Array.isArray(localState.pendingPractices)) localState.pendingPractices=[];
      localState.pendingPractices.push({
        stage_id:currentStage?.id||null,
        practice_id:currentPractice?.id||null,
        attempted_at:new Date().toISOString(),
        reason:String(reason||'sync_failed')
      });
      localStorage.setItem('ascendPathState',JSON.stringify(localState));
    }catch(err){
      console.error('Could not persist pending practice attempt',err);
    }
  }

  function timerRemaining(){
    if(window.ASCENDPracticeTimer?.remainingSeconds)return window.ASCENDPracticeTimer.remainingSeconds();
    return Number.POSITIVE_INFINITY;
  }

  function handoffToJournal(){
    requestAnimationFrame(()=>{
      window.ASCENDUX?.activateScreen?.('journal');
      const status=document.getElementById('journal-status');
      if(status)status.textContent='Practice complete. Record what you actually observed.';
      document.querySelector('#journal-form textarea[name="observation"]')?.focus();
    });
  }

  finish.addEventListener('click',async e=>{
    // Capture the click before the legacy completion handler so only this
    // integrity-safe path is allowed to mutate progression UI state.
    e.preventDefault();
    e.stopImmediatePropagation();

    if(submitting)return;
    window.ASCENDPracticeTimer?.pause?.();

    if(timerRemaining()>0||!finish.classList.contains('ready')){
      timerHint.textContent='Complete the full practice timer before recording this session.';
      finish.classList.remove('ready');
      return;
    }

    if(!user||!currentStage||!currentPractice){
      timerHint.textContent='Sign in to record official Path progress. This session has not advanced your stage.';
      setSync('LOCAL');
      return;
    }

    submitting=true;
    finish.disabled=true;
    finish.textContent='Saving…';
    setSync('SYNCING…');

    try{
      const duration=(currentPractice.default_minutes||10)*60;
      const result=await PathBackend.completePractice({
        stageId:currentStage.id,
        practiceId:currentPractice.id,
        durationSeconds:duration
      });

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

      if(result?.current_stage_id&&result.current_stage_id!==currentStage.id){
        await loadRemote();
      }else{
        requestPathPaint();
        renderStageReview();
        setSync('SYNCED',true);
      }

      window.ASCENDPracticeTimer?.reset?.();
      overlay.classList.add('hidden');
      document.dispatchEvent(new CustomEvent('ascend:practice-completed',{detail:{stageId:currentStage.id,practiceId:currentPractice.id,practiceDays:days}}));
      handoffToJournal();
    }catch(err){
      console.error(err);
      // Crucially, do NOT increment local or visible practice-day progress.
      persistPendingAttempt(err?.message||'sync_failed');
      timerHint.textContent='Could not verify this completion. It is saved only as a pending attempt and does not count toward progression yet. Retry when connected.';
      setSync('PENDING');
    }finally{
      submitting=false;
      finish.disabled=false;
      finish.textContent='Finish Practice';
    }
  },true);
})();