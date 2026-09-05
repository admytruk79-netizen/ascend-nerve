(()=>{
  const finish=document.getElementById('finish-practice');
  const timerHint=document.getElementById('timer-hint');
  if(!finish||!timerHint)return;

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

  function localDate(){
    const now=new Date();
    const y=now.getFullYear();
    const m=String(now.getMonth()+1).padStart(2,'0');
    const d=String(now.getDate()).padStart(2,'0');
    return`${y}-${m}-${d}`;
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

    // Freeze the identity of the practice being completed before the RPC can
    // advance progression and loadRemote() replaces the mutable globals.
    const completedScope={
      stageId:currentStage.id,
      practiceId:currentPractice.id,
      userId:user.id,
      month:Number(curriculum?.currentMonth||window.ASCENDState?.month||1),
      date:localDate()
    };

    submitting=true;
    finish.disabled=true;
    finish.textContent='Saving…';
    setSync('SYNCING…');

    try{
      const duration=(currentPractice.default_minutes||10)*60;
      const result=await PathBackend.completePractice({
        stageId:completedScope.stageId,
        practiceId:completedScope.practiceId,
        durationSeconds:duration
      });

      const days=result?.practice_days??progressRow?.practice_days??0;
      if(progressRow){
        progressRow.practice_days=days;
        progressRow.last_practice_date=result?.curriculum_date||completedScope.date;
        progressRow.status=result?.stage_status||progressRow.status;
      }

      document.getElementById('primary-check').checked=true;
      renderCounts(days);
      document.getElementById('stage-day').textContent=`DAY ${Math.max(1,days+1)}`;
      timerHint.textContent='Practice confirmed and counted toward your Path.';

      const completionDetail={
        ...completedScope,
        month:Number(result?.canonical_month||completedScope.month),
        date:result?.curriculum_date||completedScope.date,
        practiceDays:days
      };

      if(result?.current_stage_id&&result.current_stage_id!==completedScope.stageId){
        await loadRemote();
      }else{
        requestPathPaint();
        renderStageReview();
        setSync('SYNCED',true);
      }

      window.ASCENDPracticeRuntime?.complete?.();
      window.ASCENDPracticeRuntime?.closeOverlay?.({resetTimer:true});
      document.dispatchEvent(new CustomEvent('ascend:practice-completed',{detail:completionDetail}));
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