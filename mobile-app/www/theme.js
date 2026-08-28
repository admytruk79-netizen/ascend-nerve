(()=>{
  const KEY='ascendPathTheme';
  const mq=window.matchMedia('(prefers-color-scheme: dark)');
  const getPref=()=>localStorage.getItem(KEY)||'auto';
  const resolved=(pref)=>{
    if(pref!=='auto')return pref;
    const hour=new Date().getHours();
    if((hour>=5&&hour<8)||(hour>=17&&hour<20))return 'twilight';
    return hour>=8&&hour<17?'day':'night';
  };
  function apply(pref=getPref()){
    const mode=resolved(pref);
    document.documentElement.dataset.theme=mode;
    document.documentElement.dataset.themePreference=pref;
    const meta=document.querySelector('meta[name="theme-color"]');
    if(meta) meta.setAttribute('content',mode==='day'?'#f3ede3':mode==='twilight'?'#0a2634':'#081521');
    document.querySelectorAll('.theme-choice').forEach(b=>b.classList.toggle('active',b.dataset.themeChoice===pref));
    const modeLabel=document.getElementById('mode-label');
    const modeSymbol=document.querySelector('#theme-cycle .mode-symbol');
    const stageContext=document.getElementById('stage-eyebrow');
    if(modeLabel)modeLabel.textContent=mode.toUpperCase();
    if(modeSymbol)modeSymbol.textContent=mode==='day'?'☼':mode==='twilight'?'◐':'☾';
    if(stageContext)stageContext.textContent=`${mode==='night'?'TONIGHT':mode==='twilight'?'TWILIGHT':'TODAY'} · CORE FORMATION`;
  }
  function set(pref){localStorage.setItem(KEY,pref);apply(pref)}
  function mount(){
    const me=document.getElementById('me');
    if(!me||document.getElementById('appearance-card'))return;
    const account=me.querySelector('.auth-card');
    const card=document.createElement('article');
    card.id='appearance-card';card.className='rhythm-card';
    card.innerHTML=`<h2>Appearance</h2><p class="review-intro">Choose how ASCEND Path responds to light around you.</p><div class="appearance-options">
      <button type="button" class="theme-choice" data-theme-choice="auto"><span class="theme-icon">◐</span><span><strong>Auto</strong><small>Follow your device</small></span><span class="theme-check"></span></button>
      <button type="button" class="theme-choice" data-theme-choice="day"><span class="theme-icon">☼</span><span><strong>Day</strong><small>Warm ivory interface</small></span><span class="theme-check"></span></button>
      <button type="button" class="theme-choice" data-theme-choice="twilight"><span class="theme-icon">◐</span><span><strong>Twilight</strong><small>Cinematic dusk interface</small></span><span class="theme-check"></span></button>
      <button type="button" class="theme-choice" data-theme-choice="night"><span class="theme-icon">☾</span><span><strong>Night</strong><small>Deep charcoal interface</small></span><span class="theme-check"></span></button>
    </div><p class="appearance-note">The living object keeps the same geometry in both modes; only its light changes.</p>`;
    me.insertBefore(card,account||null);
    card.querySelectorAll('.theme-choice').forEach(b=>b.addEventListener('click',()=>set(b.dataset.themeChoice)));
    const cycle=document.getElementById('theme-cycle');
    cycle?.addEventListener('click',()=>{
      const order=['day','twilight','night','auto'],current=getPref();
      set(order[(order.indexOf(current)+1)%order.length]);
    });
    apply();

    // Practice/briefing overlays are mounted by app.js. Re-assert the user's
    // stored appearance whenever either overlay opens so entering a practice
    // can never fall back to a dark/default surface.
    ['practice-briefing','practice-overlay'].forEach(id=>{
      const el=document.getElementById(id);
      if(!el)return;
      new MutationObserver(()=>{if(!el.classList.contains('hidden'))apply(getPref())}).observe(el,{attributes:true,attributeFilter:['class']});
    });
  }
  mq.addEventListener?.('change',()=>{if(getPref()==='auto')apply('auto')});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)apply(getPref())});
  document.addEventListener('DOMContentLoaded',mount);
  apply();
  window.PathTheme={apply,set,get:getPref};
  const historyScript=document.createElement('script');historyScript.src='day-history.js?v=20260823b';historyScript.defer=true;document.head.appendChild(historyScript);
})();
