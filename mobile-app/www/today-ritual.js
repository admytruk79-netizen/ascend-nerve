(()=>{
  const portal=document.getElementById('ritual-portal');
  const feedback=document.getElementById('ritual-feedback');
  const begin=document.querySelector('#today [data-action="practice"]');
  const reflect=document.getElementById('today-reflect');
  const finishPractice=document.getElementById('finish-practice');
  if(!portal||!begin)return;

  const HOLD_MS=2000;
  const dayKey=()=>new Date().toISOString().slice(0,10);
  const practiceDoneKey=()=>`ascendPracticeDone:${dayKey()}`;
  let frame=0,startAt=0,holding=false,completed=false,pointerId=null;

  const haptic=(style='LIGHT')=>{
    try{
      const Haptics=window.Capacitor?.Plugins?.Haptics;
      if(Haptics?.impact){Haptics.impact({style});return}
    }catch{}
    try{navigator.vibrate?.(12)}catch{}
  };
  const setProgress=value=>{
    const progress=Math.max(0,Math.min(1,value));
    portal.style.setProperty('--hold-progress',`${progress*360}deg`);
    portal.setAttribute('aria-valuenow',String(Math.round(progress*100)));
  };
  const reset=({message='Press and hold to begin.'}={})=>{
    cancelAnimationFrame(frame);frame=0;holding=false;completed=false;pointerId=null;
    portal.classList.remove('is-holding','is-opening');
    portal.setAttribute('aria-label','Press and hold for two seconds to begin Self-Contemplation');
    portal.removeAttribute('aria-valuenow');
    setProgress(0);
    if(feedback)feedback.textContent=message;
  };
  const openPractice=()=>{
    begin.click();
    setTimeout(()=>reset({message:''}),420);
  };
  const finishHold=()=>{
    if(completed)return;
    completed=true;holding=false;setProgress(1);portal.classList.add('is-opening');
    portal.setAttribute('aria-label','Opening practice');
    if(feedback)feedback.textContent='The path is open.';
    haptic('LIGHT');
    setTimeout(openPractice,260);
  };
  const tick=now=>{
    if(!holding)return;
    const progress=(now-startAt)/HOLD_MS;
    setProgress(progress);
    portal.classList.add('is-holding');
    if(progress>=1){finishHold();return}
    frame=requestAnimationFrame(tick);
  };
  const start=event=>{
    if(event.button!==undefined&&event.button!==0)return;
    event.preventDefault();
    reset({message:'Keep holding…'});holding=true;pointerId=event.pointerId??null;startAt=performance.now();
    portal.setPointerCapture?.(pointerId);
    frame=requestAnimationFrame(tick);
  };
  const stopEarly=event=>{
    if(!holding||completed)return;
    if(pointerId!==null&&event?.pointerId!==undefined&&event.pointerId!==pointerId)return;
    reset();
  };

  function reflectionUnlocked(){
    return localStorage.getItem(practiceDoneKey())==='1';
  }
  function syncReflectionState(){
    if(!reflect)return;
    const unlocked=reflectionUnlocked();
    reflect.classList.toggle('locked',!unlocked);
    reflect.classList.toggle('unlocked',unlocked);
    reflect.setAttribute('aria-disabled',String(!unlocked));
    const strong=reflect.querySelector('strong');
    const small=reflect.querySelector('small');
    const mark=reflect.querySelector('.journal-mark');
    if(!reflect.classList.contains('complete')){
      if(strong)strong.textContent=unlocked?'Practice complete · Journal reflection':'After practice · Journal reflection';
      if(small)small.textContent=unlocked?'Record what you noticed':'Complete today’s practice to unlock';
      if(mark)mark.textContent=unlocked?'✦':'○';
    }
    const waypoint=document.querySelector('.journey-waypoint:nth-child(2)');
    if(waypoint){
      waypoint.classList.toggle('available',unlocked);
      const note=waypoint.querySelector('small');
      if(note)note.textContent=unlocked?'Ready':'After practice';
    }
  }
  function unlockReflection(){
    localStorage.setItem(practiceDoneKey(),'1');
    syncReflectionState();
  }

  portal.addEventListener('pointerdown',start);
  portal.addEventListener('pointerup',stopEarly);
  portal.addEventListener('pointercancel',stopEarly);
  portal.addEventListener('lostpointercapture',stopEarly);
  portal.addEventListener('contextmenu',event=>event.preventDefault());
  portal.addEventListener('click',event=>{
    if(event.detail!==0){event.preventDefault();return}
    if(feedback)feedback.textContent='Opening practice.';
    openPractice();
  });

  document.addEventListener('click',event=>{
    const target=event.target.closest?.('#today-reflect');
    if(!target||reflectionUnlocked())return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if(feedback)feedback.textContent='Complete today’s practice first. Your Journal remains available from the navigation below.';
  },true);

  finishPractice?.addEventListener('click',()=>{
    if(!finishPractice.classList.contains('ready'))return;
    unlockReflection();
  },true);

  function syncJourney(event){
    const month=Math.max(1,Math.min(24,Number(event?.detail?.month)||1));
    const label=document.getElementById('today-month-label');
    const bar=document.getElementById('today-month-progress');
    if(label)label.textContent=`Month ${month} of 24`;
    if(bar)bar.style.width=`${Math.max(4.2,month/24*100)}%`;
  }
  document.addEventListener('ascend:month',syncJourney);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncReflectionState()});
  syncJourney();
  syncReflectionState();
  reset({message:''});
  window.ASCENDTodayRitual={reset,syncJourney,syncReflectionState,unlockReflection,reflectionUnlocked,HOLD_MS};
})();
