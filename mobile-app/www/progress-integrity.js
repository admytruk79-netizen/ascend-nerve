(()=>{
  const finish=document.getElementById('finish-practice');
  const timerHint=document.getElementById('timer-hint');
  if(!finish||!timerHint)return;

  let submitting=false;
  let replaying=false;

  function activePractice(){return window.ASCENDPracticeRuntime?.practice?.()||currentPractice||null}
  function activeSession(){return window.ASCENDPracticeRuntime?.session?.()||null}
  function authority(){return window.ASCENDProgression?.authority?.()||window.ASCENDAuthority||null}

  function persistState(){
    try{localStorage.setItem('ascendPathState',JSON.stringify(localState))}catch(err){console.error('Could not persist ASCEND local state',err)}
  }

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
        duration_seconds:(Number(practice?.default_minutes)||10)*60,
        reason:String(reason||'sync_failed')
      };
      const existingIndex=attempt.server_session_id
        ?localState.pendingPractices.findIndex(item=>item?.server_session_id===attempt.server_session_id)
        :-1;
      if(existingIndex>=0)localState.pendingPractices[existingIndex]=attempt;
      else localState.pendingPractices.push(attempt);
      persistState();
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

  function pendingDuration(item){
    const saved=Number(item?.duration_seconds);
    if(Number.isFinite(saved)&&saved>0)return saved;
    const practice=curriculum?.practices?.find?.(row=>row.id===item?.practice_id);
    return (Number(practice?.default_minutes)||10)*60;
  }

  async function replayPendingAttempts(){
    if(replaying||submitting||!user||!PathBackend?.isSignedIn?.())return;
    const pending=Array.isArray(localState.pendingPractices)?localState.pendingPractices.slice():[];
    if(!pending.length)return;
    replaying=true;
    let recovered=0;
    const keep=[];
    try{
      for(const item of pending){
        if(!item?.stage_id||!item?.practice_id||!item?.server_session_id){keep.push(item);continue}
        const payload={
          p_stage_id:item.stage_id,
          p_practice_id:item.practice_id,
          p_duration_seconds:pendingDuration(item),
          p_session_id:item.server_session_id
        };
        try{
          await recordCompletionWithAuthRetry(payload);
          recovered+=1;
        }catch(error){
          const message=String(error?.message||'').toLowerCase();
          if(message.includes('practice session expired')||message.includes('practice session abandoned')||message.includes('practice session not found')){
            console.warn('ASCEND pending practice can no longer be replayed',item.server_session_id,error);
            continue;
          }
          keep.push({...item,reason:String(error?.message||item.reason||'sync_failed'),last_retry_at:new Date().toISOString()});
        }
      }
      localState.pendingPractices=keep;
      persistState();
      if(recovered>0){
        timerHint.textContent=recovered===1?'A pending practice was verified and restored to your Path.':`${recovered} pending practices were verified and restored to your Path.`;
        try{await loadRemote()}catch(error){console.warn('ASCEND recovered pending completion but could not refresh remote state',error)}
        document.dispatchEvent(new CustomEvent('ascend:pending-practices-recovered',{detail:{count:recovered}}));
      }
    }finally{
      replaying=false;
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

      if(Array.isArray(localState.pendingPractices)){
        localState.pendingPractices=localState.pendingPractices.filter(item=>item?.server_session_id!==completedScope.sessionId);
        persistState();
      }

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
      // Do not increment local or visible practice-day progress after failed server verification.
      // Preserve the authoritative server session so it can be replayed idempotently.
      persistPendingAttempt(err?.message||'sync_failed');
      timerHint.textContent='Could not verify this completion yet. It does not count toward progression yet, but it is safely queued and will retry automatically when your connection is available.';
      setSync('PENDING');
    }finally{
      submitting=false;
      finish.disabled=false;
      finish.textContent='Finish Practice';
    }
  },true);

  window.addEventListener('online',()=>void replayPendingAttempts());
  document.addEventListener('ascend:authority',()=>void replayPendingAttempts());
  setTimeout(()=>void replayPendingAttempts(),1800);
})();