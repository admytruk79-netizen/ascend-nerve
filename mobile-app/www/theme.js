(()=>{
  const KEY='ascendPathTheme';
  let revealTimer=0;

  function revealApp(){
    clearTimeout(revealTimer);
    document.documentElement.style.removeProperty('visibility');
    document.documentElement.classList.add('theme-authority-ready');
  }

  function ensureThemeAuthority(){
    document.documentElement.style.visibility='hidden';
    let link=document.querySelector('link[data-theme-authority]');
    if(link){
      if(link.sheet){revealApp();return}
      link.addEventListener('load',revealApp,{once:true});
      link.addEventListener('error',revealApp,{once:true});
      revealTimer=setTimeout(revealApp,1200);
      return;
    }
    link=document.createElement('link');
    link.rel='stylesheet';
    link.href='theme-authority.css?v=20260901-core-2';
    link.dataset.themeAuthority='true';
    link.addEventListener('load',revealApp,{once:true});
    link.addEventListener('error',revealApp,{once:true});
    document.head.appendChild(link);
    revealTimer=setTimeout(revealApp,1200);
  }

  function retireConflictingRenderStyles(){
    document.querySelectorAll('link[data-approved-render-overrides]').forEach(link=>link.remove());
  }

  ensureThemeAuthority();
  retireConflictingRenderStyles();
  new MutationObserver(retireConflictingRenderStyles).observe(document.head,{childList:true});

  const VALID=['day','twilight','night'];
  function normalizePref(pref){
    return VALID.includes(pref)?pref:'day';
  }
  function getPref(){
    const stored=localStorage.getItem(KEY);
    const normalized=normalizePref(stored);
    if(stored!==normalized)localStorage.setItem(KEY,normalized);
    return normalized;
  }

  function apply(pref=getPref()){
    const mode=normalizePref(pref);
    document.documentElement.dataset.theme=mode;
    document.documentElement.dataset.themePreference=mode;
    const meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.setAttribute('content',mode==='day'?'#f4efe3':mode==='twilight'?'#0a2432':'#04131e');
    document.querySelectorAll('.theme-choice').forEach(button=>button.classList.toggle('active',button.dataset.themeChoice===mode));
    const modeLabel=document.getElementById('mode-label');
    const modeSymbol=document.querySelector('#theme-cycle .mode-symbol');
    const stageContext=document.getElementById('stage-eyebrow');
    if(modeLabel)modeLabel.textContent=mode.toUpperCase();
    if(modeSymbol)modeSymbol.textContent=mode==='day'?'☼':mode==='twilight'?'◐':'☾';
    if(stageContext)stageContext.textContent=`${mode==='night'?'TONIGHT':mode==='twilight'?'TWILIGHT':'TODAY'} · CORE FORMATION`;
  }

  function set(pref){
    const mode=normalizePref(pref);
    localStorage.setItem(KEY,mode);
    apply(mode);
  }

  function mount(){
    const me=document.getElementById('me');
    if(!me||document.getElementById('appearance-card'))return;
    const account=me.querySelector('.auth-card');
    const card=document.createElement('article');
    card.id='appearance-card';
    card.className='rhythm-card';
    card.innerHTML=`<h2>Appearance</h2><p class="review-intro">Choose one appearance for the whole ASCEND Path app. It stays fixed until you change it.</p><div class="appearance-options">
      <button type="button" class="theme-choice" data-theme-choice="day"><span class="theme-icon">☼</span><span><strong>Day</strong><small>Warm ivory interface</small></span><span class="theme-check"></span></button>
      <button type="button" class="theme-choice" data-theme-choice="twilight"><span class="theme-icon">◐</span><span><strong>Twilight</strong><small>Cinematic dusk interface</small></span><span class="theme-check"></span></button>
      <button type="button" class="theme-choice" data-theme-choice="night"><span class="theme-icon">☾</span><span><strong>Night</strong><small>Deep charcoal interface</small></span><span class="theme-check"></span></button>
    </div><p class="appearance-note">ASCEND will not switch appearance automatically with the clock or your device theme.</p>`;
    me.insertBefore(card,account||null);
    card.querySelectorAll('.theme-choice').forEach(button=>button.addEventListener('click',()=>set(button.dataset.themeChoice)));

    const cycle=document.getElementById('theme-cycle');
    cycle?.addEventListener('click',()=>{
      const order=['day','twilight','night'];
      const current=getPref();
      set(order[(order.indexOf(current)+1)%order.length]);
    });
    apply();
  }

  document.addEventListener('DOMContentLoaded',mount);
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