(()=>{
  const KEY='ascendPathTheme';
  const VALID=['day','twilight','night'];
  let revealTimer=0;

  function revealApp(){
    clearTimeout(revealTimer);
    document.documentElement.style.removeProperty('visibility');
    document.documentElement.classList.add('theme-authority-ready');
    document.dispatchEvent(new CustomEvent('ascend:theme-ready'));
  }

  function ensureThemeAuthority(){
    document.documentElement.style.visibility='hidden';
    let link=document.querySelector('link[data-theme-authority]');
    if(link){
      link.href='theme-authority.css?v=20260901-dark-cinematic-1';
      if(link.sheet){revealApp();return}
      link.addEventListener('load',revealApp,{once:true});
      link.addEventListener('error',revealApp,{once:true});
      revealTimer=setTimeout(revealApp,1200);
      return;
    }
    link=document.createElement('link');
    link.rel='stylesheet';
    link.href='theme-authority.css?v=20260901-dark-cinematic-1';
    link.dataset.themeAuthority='true';
    link.addEventListener('load',revealApp,{once:true});
    link.addEventListener('error',revealApp,{once:true});
    document.head.appendChild(link);
    revealTimer=setTimeout(revealApp,1200);
  }

  function retireConflictingRenderStyles(){
    document.querySelectorAll('link[data-approved-render-overrides]').forEach(link=>link.remove());
  }

  function normalizePref(pref){return VALID.includes(pref)?pref:'night'}
  function getPref(){
    const stored=localStorage.getItem(KEY);
    if(!stored){localStorage.setItem(KEY,'night');return'night'}
    const normalized=normalizePref(stored);
    if(stored!==normalized)localStorage.setItem(KEY,normalized);
    return normalized;
  }

  function apply(pref=getPref()){
    const mode=normalizePref(pref);
    document.documentElement.dataset.theme=mode;
    document.documentElement.dataset.themePreference=mode;
    const meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.setAttribute('content','#06131d');
    const modeLabel=document.getElementById('mode-label');
    const modeSymbol=document.querySelector('#theme-cycle .mode-symbol');
    const stageContext=document.getElementById('stage-eyebrow');
    if(modeLabel)modeLabel.textContent=mode.toUpperCase();
    if(modeSymbol)modeSymbol.textContent=mode==='day'?'☼':mode==='twilight'?'◐':'☾';
    if(stageContext)stageContext.textContent='TODAY · CORE FORMATION';
    document.querySelectorAll('.theme-choice').forEach(button=>button.classList.toggle('active',button.dataset.themeChoice===mode));
  }

  function set(pref){
    const mode=normalizePref(pref);
    localStorage.setItem(KEY,mode);
    apply(mode);
  }

  function mount(){
    document.getElementById('appearance-card')?.remove();
    const cycle=document.getElementById('theme-cycle');
    if(cycle&&!cycle.dataset.themeWired){
      cycle.dataset.themeWired='true';
      cycle.title='Change atmosphere';
      cycle.setAttribute('aria-label','Change ASCEND atmosphere');
      cycle.addEventListener('click',()=>{
        const order=['night','twilight','day'];
        const current=getPref();
        set(order[(order.indexOf(current)+1)%order.length]);
      });
    }
    apply();
  }

  ensureThemeAuthority();
  retireConflictingRenderStyles();
  new MutationObserver(retireConflictingRenderStyles).observe(document.head,{childList:true});
  document.addEventListener('DOMContentLoaded',mount,{once:true});
  apply();
  window.PathTheme={apply,set,get:getPref};

  if(!document.querySelector('script[data-day-history]')){
    const historyScript=document.createElement('script');
    historyScript.src='day-history.js?v=20260823b';
    historyScript.defer=true;
    historyScript.dataset.dayHistory='true';
    document.head.appendChild(historyScript);
  }
})();
