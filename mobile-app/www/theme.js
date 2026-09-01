(()=>{
  const KEY='ascendPathTheme';
  const mq=window.matchMedia('(prefers-color-scheme: dark)');

  function ensureThemeAuthority(){
    if(document.querySelector('link[data-theme-authority]'))return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='theme-authority.css?v=20260901-core-1';
    link.dataset.themeAuthority='true';
    document.head.appendChild(link);
  }

  function retireConflictingRenderStyles(){
    document.querySelectorAll('link[data-approved-render-overrides]').forEach(link=>link.remove());
  }

  ensureThemeAuthority();
  retireConflictingRenderStyles();
  new MutationObserver(retireConflictingRenderStyles).observe(document.head,{childList:true});

  const getPref=()=>localStorage.getItem(KEY)||'auto';
  const resolved=(pref)=>pref==='auto'?(mq.matches?'night':'day'):pref;

  function apply(pref=getPref()){
    const mode=resolved(pref);
    document.documentElement.dataset.theme=mode;
    document.documentElement.dataset.themePreference=pref;
    const meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.setAttribute('content',mode==='day'?'#f4efe3':mode==='twilight'?'#0a2432':'#04131e');
    document.querySelectorAll('.theme-choice').forEach(button=>button.classList.toggle('active',button.dataset.themeChoice===pref));
    const modeLabel=document.getElementById('mode-label');
    const modeSymbol=document.querySelector('#theme-cycle .mode-symbol');
    const stageContext=document.getElementById('stage-eyebrow');
    if(modeLabel)modeLabel.textContent=mode.toUpperCase();
    if(modeSymbol)modeSymbol.textContent=mode==='day'?'☼':mode==='twilight'?'◐':'☾';
    if(stageContext)stageContext.textContent=`${mode==='night'?'TONIGHT':mode==='twilight'?'TWILIGHT':'TODAY'} · CORE FORMATION`;
  }

  function set(pref){
    localStorage.setItem(KEY,pref);
    apply(pref);
  }

  function mount(){
    const me=document.getElementById('me');
    if(!me||document.getElementById('appearance-card'))return;
    const account=me.querySelector('.auth-card');
    const card=document.createElement('article');
    card.id='appearance-card';
    card.className='rhythm-card';
    card.innerHTML=`<h2>Appearance</h2><p class="review-intro">Choose one appearance for the whole ASCEND Path app.</p><div class="appearance-options">
      <button type="button" class="theme-choice" data-theme-choice="auto"><span class="theme-icon">◐</span><span><strong>Auto</strong><small>Follow your device</small></span><span class="theme-check"></span></button>
      <button type="button" class="theme-choice" data-theme-choice="day"><span class="theme-icon">☼</span><span><strong>Day</strong><small>Warm ivory interface</small></span><span class="theme-check"></span></button>
      <button type="button" class="theme-choice" data-theme-choice="twilight"><span class="theme-icon">◐</span><span><strong>Twilight</strong><small>Cinematic dusk interface</small></span><span class="theme-check"></span></button>
      <button type="button" class="theme-choice" data-theme-choice="night"><span class="theme-icon">☾</span><span><strong>Night</strong><small>Deep charcoal interface</small></span><span class="theme-check"></span></button>
    </div><p class="appearance-note">The selected appearance now stays consistent across Today, Path, Journal, Library and Me.</p>`;
    me.insertBefore(card,account||null);
    card.querySelectorAll('.theme-choice').forEach(button=>button.addEventListener('click',()=>set(button.dataset.themeChoice)));

    const cycle=document.getElementById('theme-cycle');
    cycle?.addEventListener('click',()=>{
      const order=['day','twilight','night','auto'];
      const current=getPref();
      set(order[(order.indexOf(current)+1)%order.length]);
    });
    apply();
  }

  mq.addEventListener?.('change',()=>{if(getPref()==='auto')apply('auto')});
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