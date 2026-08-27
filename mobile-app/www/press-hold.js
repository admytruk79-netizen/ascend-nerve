(()=>{
  const object=document.getElementById('living-object');
  const hint=document.getElementById('press-hold-hint');
  const beginButton=document.querySelector('[data-action="practice"]');
  const fill=object?.querySelector('.living-progress-fill');
  if(!object||!beginButton)return;

  const HOLD_MS=1500;
  const PULSE_TIMES=[500,1000]; // the third pulse coincides with completion itself
  const QUICK_TAP_MS=250;
  const IGNITE_MS=260;

  let circumference=0;
  function measure(){
    if(!fill)return;
    const r=fill.r?.baseVal?.value||96;
    circumference=2*Math.PI*r;
    fill.style.strokeDasharray=`${circumference}`;
    fill.style.strokeDashoffset=`${circumference}`;
  }
  measure();
  window.addEventListener('resize',measure);

  function setFill(ratio){
    if(!fill||!circumference)return;
    const clamped=Math.max(0,Math.min(1,ratio));
    fill.style.strokeDashoffset=`${circumference*(1-clamped)}`;
  }

  function haptic(style){
    try{
      const Haptics=window.Capacitor?.Plugins?.Haptics;
      if(Haptics?.impact){Haptics.impact({style});return}
    }catch{}
    try{
      if(navigator.vibrate)navigator.vibrate(style==='HEAVY'||style==='MEDIUM'?24:10);
    }catch{}
  }

  let pointerId=null,startedAt=0,raf=null,pulseTimers=[],completeTimer=null,hintTimer=null;

  function clearTimers(){
    pulseTimers.forEach(t=>clearTimeout(t));
    pulseTimers=[];
    if(completeTimer){clearTimeout(completeTimer);completeTimer=null}
    if(raf){cancelAnimationFrame(raf);raf=null}
  }

  function showHint(){
    if(!hint)return;
    hint.classList.remove('hidden');
    hint.classList.add('visible');
    clearTimeout(hintTimer);
    hintTimer=setTimeout(()=>hint.classList.remove('visible'),1800);
  }

  function tick(){
    setFill((Date.now()-startedAt)/HOLD_MS);
    if(object.classList.contains('charging'))raf=requestAnimationFrame(tick);
  }

  function beginCharge(){
    object.classList.remove('igniting');
    object.classList.add('charging');
    startedAt=Date.now();
    haptic('LIGHT');
    raf=requestAnimationFrame(tick);
    pulseTimers=PULSE_TIMES.map(ms=>setTimeout(()=>haptic('LIGHT'),ms));
    completeTimer=setTimeout(completeCharge,HOLD_MS);
  }

  function cancelCharge(){
    const wasCharging=object.classList.contains('charging');
    clearTimers();
    if(!wasCharging)return;
    object.classList.remove('charging');
    setFill(0);
  }

  function completeCharge(){
    clearTimers();
    object.classList.remove('charging');
    haptic('MEDIUM');
    object.classList.add('igniting');
    setTimeout(()=>{
      window.ASCENDOpenPractice?.();
      setFill(0);
      setTimeout(()=>object.classList.remove('igniting'),400);
    },IGNITE_MS);
  }

  function beginHold(){
    if(object.classList.contains('charging')||object.classList.contains('igniting'))return;
    beginCharge();
  }

  function endHold(){
    if(!object.classList.contains('charging'))return;
    const heldFor=Date.now()-startedAt;
    cancelCharge();
    if(heldFor<QUICK_TAP_MS)showHint();
  }

  object.addEventListener('pointerdown',event=>{
    if(pointerId!==null)return;
    pointerId=event.pointerId;
    try{object.setPointerCapture?.(pointerId)}catch{}
    beginHold();
  });
  const releasePointer=event=>{
    if(pointerId===null||event.pointerId!==pointerId)return;
    pointerId=null;
    endHold();
  };
  object.addEventListener('pointerup',releasePointer);
  object.addEventListener('pointercancel',releasePointer);
  object.addEventListener('pointerleave',event=>{if(pointerId!==null)releasePointer(event)});

  object.addEventListener('keydown',event=>{
    if(event.key!=='Enter'&&event.key!==' ')return;
    event.preventDefault();
    if(event.repeat)return;
    beginHold();
  });
  object.addEventListener('keyup',event=>{
    if(event.key!=='Enter'&&event.key!==' ')return;
    if(!object.classList.contains('charging'))return;
    clearTimers();
    completeCharge();
  });

  beginButton.addEventListener('click',()=>{
    if(object.classList.contains('charging'))cancelCharge();
    haptic('MEDIUM');
    object.classList.add('igniting');
    setTimeout(()=>object.classList.remove('igniting'),400);
  });
})();
