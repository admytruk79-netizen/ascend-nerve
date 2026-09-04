(()=>{
  const KEY='ascendPathTheme';
  const VALID=['day','twilight','night'];

  function normalizePref(pref){return VALID.includes(pref)?pref:'night'}
  function getPref(){
    const stored=localStorage.getItem(KEY);
    const normalized=normalizePref(stored||'night');
    if(stored!==normalized)localStorage.setItem(KEY,normalized);
    return normalized;
  }

  function apply(pref=getPref()){
    const mode=normalizePref(pref);
    document.documentElement.dataset.theme=mode;
    document.documentElement.dataset.themePreference=mode;
    document.documentElement.classList.add('theme-authority-ready');
    const meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.setAttribute('content','#06131d');
    const modeLabel=document.getElementById('mode-label');
    const modeSymbol=document.querySelector('#theme-cycle .mode-symbol');
    const stageContext=document.getElementById('stage-eyebrow');
    if(modeLabel)modeLabel.textContent=mode.toUpperCase();
    if(modeSymbol)modeSymbol.textContent=mode==='day'?'☼':mode==='twilight'?'◐':'☾';
    if(stageContext&&/TONIGHT|TODAY|CORE FORMATION/i.test(stageContext.textContent||''))stageContext.textContent='TODAY · CORE FORMATION';
    document.querySelectorAll('.theme-choice').forEach(button=>button.classList.toggle('active',button.dataset.themeChoice===mode));
    document.dispatchEvent(new CustomEvent('ascend:theme-ready',{detail:{mode}}));
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

  // Theme choice is applied immediately; CSS authority is loaded statically from
  // index.html. Never hide the document or inject a stylesheet at runtime.
  apply();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
  window.PathTheme={apply,set,get:getPref};
})();
