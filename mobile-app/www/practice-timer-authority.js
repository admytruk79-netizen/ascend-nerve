(()=>{
  const overlay=document.getElementById('practice-overlay');
  const briefingBegin=document.getElementById('briefing-begin');
  const originalToggle=document.getElementById('timer-toggle');
  const timer=document.getElementById('timer');
  const finish=document.getElementById('finish-practice');
  const hint=document.getElementById('timer-hint');
  if(!overlay||!briefingBegin||!originalToggle||!timer||!finish||!hint)return;

  const DEFAULT_HINT='Sit with this until the timer ends. Finish Practice becomes available when the timer completes.';
  let toggle=originalToggle;
  let interval=null;
  let running=false;
  let remainingMs=0;
  let deadline=0;

  const durationSeconds=()=>{
    const text=document.getElementById('briefing-duration')?.textContent||'';
    const minutes=Number.parseFloat(text);
    return Number.isFinite(minutes)&&minutes>0?Math.round(minutes*60):600;
  };

  function render(){
    const seconds=Math.max(0,Math.ceil(remainingMs/1000));
    const minutes=Math.floor(seconds/60);
    const rest=seconds%60;
    timer.textContent=`${String(minutes).padStart(2,'0')}:${String(rest).padStart(2,'0')}`;
  }

  function setFinishReady(ready){
    finish.classList.toggle('ready',ready);
    finish.disabled=!ready;
    finish.setAttribute('aria-disabled',String(!ready));
    finish.setAttribute('aria-describedby','timer-hint');
    finish.textContent=ready?'Finish Practice':'Finish Practice · waiting for timer';
  }

  function clearTick(){
    if(interval!==null)window.clearInterval(interval);
    interval=null;
  }

  function complete(){
    clearTick();
    remainingMs=0;
    running=false;
    render();
    toggle.disabled=true;
    toggle.textContent='Timer Complete';
    setFinishReady(true);
    hint.textContent='Timer complete. Finish Practice to record this practice, then continue to your Journal.';
    document.dispatchEvent(new CustomEvent('ascend:practice-timer-complete'));
  }

  function tick(){
    if(!running)return;
    remainingMs=Math.max(0,deadline-Date.now());
    render();
    if(remainingMs<=0)complete();
  }

  function pause(){
    if(!running)return;
    remainingMs=Math.max(0,deadline-Date.now());
    running=false;
    clearTick();
    render();
    toggle.textContent='Resume';
    hint.textContent='Paused. Resume when you are ready; your remaining time is preserved.';
  }

  function start(){
    if(running||remainingMs<=0)return;
    running=true;
    deadline=Date.now()+remainingMs;
    toggle.textContent='Pause';
    hint.textContent='Practice in progress. You can pause without losing your remaining time.';
    tick();
    interval=window.setInterval(tick,250);
  }

  function reset(){
    clearTick();
    running=false;
    remainingMs=durationSeconds()*1000;
    deadline=0;
    toggle.disabled=false;
    toggle.textContent='Begin';
    setFinishReady(false);
    hint.textContent=DEFAULT_HINT;
    render();
  }

  function installToggle(){
    const current=document.getElementById('timer-toggle');
    if(!current||current.dataset.timerAuthority==='true'){
      if(current)toggle=current;
      return;
    }
    const replacement=current.cloneNode(true);
    replacement.dataset.timerAuthority='true';
    current.replaceWith(replacement);
    toggle=replacement;
    toggle.addEventListener('click',()=>running?pause():start());
  }

  briefingBegin.setAttribute('aria-describedby','briefing-intention briefing-duration');
  installToggle();
  reset();

  briefingBegin.addEventListener('click',()=>requestAnimationFrame(reset));
  overlay.querySelector('.overlay-close')?.addEventListener('click',()=>{
    pause();
    reset();
  });
  finish.addEventListener('click',()=>{
    if(!finish.classList.contains('ready'))return;
    finish.disabled=true;
    finish.setAttribute('aria-disabled','true');
    finish.textContent='Recording Practice…';
    hint.textContent='Recording your practice. Your Journal reflection is next.';
    requestAnimationFrame(reset);
  });

  window.ASCENDPracticeTimer={reset,start,pause,tick,isRunning:()=>running,remainingSeconds:()=>Math.ceil(remainingMs/1000)};
})();