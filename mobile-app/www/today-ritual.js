(()=>{
  const portal=document.getElementById('ritual-portal');
  const feedback=document.getElementById('ritual-feedback');
  const begin=document.querySelector('#today [data-action="practice"]');
  if(!portal||!begin)return;

  const HOLD_MS=1500;
  const PULSES=[0,.34,.67,.92];
  let frame=0,startAt=0,pulseIndex=0,holding=false,completed=false,pointerId=null;

  const vibrate=(pattern,style='LIGHT')=>{
    try{
      const Haptics=window.Capacitor?.Plugins?.Haptics;
      if(Haptics?.impact){Haptics.impact({style});return}
    }catch{}
    try{navigator.vibrate?.(pattern)}catch{}
  };
  const setProgress=value=>{
    const progress=Math.max(0,Math.min(1,value));
    portal.style.setProperty('--hold-progress',`${progress*360}deg`);
    portal.setAttribute('aria-valuenow',String(Math.round(progress*100)));
  };
  const reset=({message='Press and hold to begin.'}={})=>{
    cancelAnimationFrame(frame);frame=0;holding=false;completed=false;pointerId=null;pulseIndex=0;
    portal.classList.remove('is-holding','is-opening');
    portal.setAttribute('aria-label','Press and hold to begin Self-Contemplation');
    portal.removeAttribute('aria-valuenow');
    setProgress(0);
    if(feedback)feedback.textContent=message;
  };
  const openPractice=()=>{
    begin.click();
    setTimeout(()=>reset({message:'Press and hold to begin.'}),420);
  };
  const finishHold=()=>{
    if(completed)return;
    completed=true;holding=false;setProgress(1);portal.classList.remove('is-holding');portal.classList.add('is-opening');
    portal.setAttribute('aria-label','Opening practice');
    if(feedback)feedback.textContent='The path is open.';
    vibrate([35,35,55],'MEDIUM');
    setTimeout(openPractice,260);
  };
  const tick=now=>{
    if(!holding)return;
    const progress=(now-startAt)/HOLD_MS;
    setProgress(progress);
    while(pulseIndex<PULSES.length&&progress>=PULSES[pulseIndex]){
      vibrate(pulseIndex===0?9:pulseIndex===3?22:13,pulseIndex===3?'MEDIUM':'LIGHT');
      pulseIndex++;
    }
    if(progress>=1){finishHold();return}
    frame=requestAnimationFrame(tick);
  };
  const start=event=>{
    if(event.button!==undefined&&event.button!==0)return;
    event.preventDefault();
    reset({message:'Keep holding…'});
    holding=true;pointerId=event.pointerId??null;startAt=performance.now();
    portal.classList.add('is-holding');
    frame=requestAnimationFrame(tick);
  };
  const stopEarly=event=>{
    if(!holding||completed)return;
    if(pointerId!==null&&event?.pointerId!==undefined&&event.pointerId!==pointerId)return;
    reset();
  };

  portal.addEventListener('pointerdown',start);
  document.addEventListener('pointerup',stopEarly);
  document.addEventListener('pointercancel',stopEarly);
  portal.addEventListener('contextmenu',event=>event.preventDefault());
  portal.addEventListener('click',event=>{
    if(event.detail!==0){
      event.preventDefault();
      if(!holding&&!completed&&feedback)feedback.textContent='Press and hold to begin.';
      return;
    }
    if(feedback)feedback.textContent='Opening practice.';
    vibrate(18,'MEDIUM');openPractice();
  });

  function syncJourney(event){
    const month=Math.max(1,Math.min(24,Number(event?.detail?.month)||1));
    const label=document.getElementById('today-month-label');
    const bar=document.getElementById('today-month-progress');
    if(label)label.textContent=`Month ${month} of 24`;
    if(bar)bar.style.width=`${Math.max(4.2,month/24*100)}%`;
  }
  document.addEventListener('ascend:month',syncJourney);
  syncJourney();
  reset();
  window.ASCENDTodayRitual={reset,syncJourney,HOLD_MS};
})();