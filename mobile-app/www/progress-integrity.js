(()=>{
  const finish=document.getElementById('finish-practice');
  const timerHint=document.getElementById('timer-hint');
  if(!finish||!timerHint)return;

  let submitting=false;

  function activePractice(){return window.ASCENDPracticeRuntime?.practice?.()||currentPractice||null}
  function activeSession(){return window.ASCENDPracticeRuntime?.session?.()||null}
  function authority(){return window.ASCENDProgression?.authority?.()||window.ASCENDAuthority||null}

  function persistPendingAttempt(reason){
    try{
      if(!Array.isArray(localState.pendingPractices)) localState.pendingPractices=[];
      const practice=activePractice();
      const session=activeSession();
      const auth=authority();
      const attempt={
        stage_id:session?.stageId||currentStage?.id||null,
        practice_id:session?.practiceId||practice?.id||null,
        server_session_id:session?.sessionId||null,
        attempted_at:new Date().toISOString(),
        curriculum_date:session?.date||auth?.curriculumDate||null,
        canonical_month:Number(session?.month||auth?.month)||null,
        timezone:session?.timezone||auth?.timezone||null,
        reason:String(reason||'sync_failed')
      };
      const existingIndex=attempt.server_session_id
        ?localState.pendingPractices.findIndex(item=>item?.server_session_id===attempt.server_session_id)
        :-1;
      if(existingIndex>=0)localState.pendingPractices[existingIndex]=attempt;
      else localState.pendingPractices.push(attempt);
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

  async function recordCompletionWithAuthRetry(payload){
    try{
      return await PathBackend.rpc('path_record_practice_completion',payload);
    }catch(error){
      if(Number(error?.status)!==401)throw error;
      const refreshed=await PathBackend.refresh?.();
      if(!refreshed)throw error;
      return PathBackend.rpc('path_record_practice_completion',payload);
    }
  }

  finish.addEventListener('click',async e=>{
    e.preventDefault();
    e.stopImmediatePropagation();

    if(submitting)return;
    window.ASCENDPracticeTimer?.pause?.();

    if(timerRemaining()>0||!finish.classList.contains('ready')){
      timerHint.textContent='Complete the full practice timer before recording this session.';
      finish.classList.remove('ready');
      return;
    }

    const practice=activePractice();
    const session=activeSession();
    const stageId=session?.stageId||currentStage?.id||null;
    if(!user||!stageId||!practice){
      timerHint.textContent='Sign in to record official Path progress. This session has not advanced your stage.';
      setSync('LOCAL');
      return;
    }
    if(!session?.sessionId){
      timerHint.textContent='This practice has no authoritative server session and cannot count toward progression. Start the practice again while connected.';
      setSync('PENDING');
      return;
    }

    const auth=authority();
    const completedScope={
      stageId,
      practiceId:session?.practiceId||practice.id,
      sessionId:session.sessionId,
      userId:user.id,
      month:Number(session?.month||window.ASCENDPracticeRuntime?.canonicalMonth?.()||auth?.month||window.ASCENDState?.month||curriculum?.currentMonth||1),
      date:session?.date||auth?.curriculumDate||null,
      timezone:session?.timezone||auth?.timezone||null
    };

    submitting=true;
    finish.disabled=true;
    finish.textContent='Saving…';
    setSync('SYNCING…');

    try{
      const duration=(practice.default_minutes||10)*60;
      const payload={
        p_stage_id:completedScope.stageId,
        p_practice_id:completedScope.practiceId,
        p_duration_seconds:duration,
        p_session_id:completedScope.sessionId
      };
      const result=await recordCompletionWithAuthRetry(payload);

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
        month:Number(result?.session_canonical_month||result?.canonical_month||completedScope.month),
        date:result?.curriculum_date||completedScope.date,
        timezone:result?.timezone||completedScope.timezone,
        practiceDays:days
      };
      window.ASCENDAuthority={
        ...(window.ASCENDAuthority||{}),
        month:Number(result?.canonical_month||completionDetail.month),
        curriculumDate:completionDetail.date,
        timezone:completionDetail.timezone
      };
      window.ASCENDProgression?.invalidate?.();

      if(result?.current_stage_id&&result.current_stage_id!==completedScope.stageId){
        await loadRemote();
      }else{
        requestPathPaint();
        renderStageReview();
        setSync('SYNCED',true);
      }

      window.ASCENDPracticeRuntime?.complete?.();
      window.ASCENDPracticeRuntime?.closeOverlay?.({resetTimer:true});
      document.dispatchEvent(new CustomEvent('ascend:authority',{detail:window.ASCENDAuthority}));
      document.dispatchEvent(new CustomEvent('ascend:practice-completed',{detail:completionDetail}));
      handoffToJournal();
    }catch(err){
      console.error(err);
      // Crucially, do NOT increment local or visible practice-day progress after failed server verification.
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