(()=>{
  const overlay=document.getElementById('practice-overlay');
  const briefingBegin=document.getElementById('briefing-begin');
  const originalToggle=document.getElementById('timer-toggle');
  const timer=document.getElementById('timer');
  const finish=document.getElementById('finish-practice');
  const hint=document.getElementById('timer-hint');
  if(!overlay||!briefingBegin||!originalToggle||!timer||!finish||!hint)return;

  const DEFAULT_HINT='Sit with this until the timer ends, then tap Finish Practice to record today.';
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
    toggle.textContent='Complete';
    finish.classList.add('ready');
    hint.textContent='Timer complete — tap Finish Practice below.';
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
    toggle.textContent='Begin';
  }

  function start(){
    if(running||remainingMs<=0)return;
    running=true;
    deadline=Date.now()+remainingMs;
    toggle.textContent='Pause';
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
    finish.classList.remove('ready');
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

  installToggle();
  reset();

  briefingBegin.addEventListener('click',()=>requestAnimationFrame(reset));
  overlay.querySelector('.overlay-close')?.addEventListener('click',()=>{
    pause();
    reset();
  });
  finish.addEventListener('click',()=>{
    if(finish.classList.contains('ready'))requestAnimationFrame(reset);
  });

  window.ASCENDPracticeTimer={reset,start,pause,tick,isRunning:()=>running,remainingSeconds:()=>Math.ceil(remainingMs/1000)};
})();