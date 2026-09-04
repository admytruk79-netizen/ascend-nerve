(()=>{
  const KEY='ascendPathTheme';
  const VALID=['day','twilight','night'];

  function normalizePref(pref){return VALID.includes(pref)?pref:'night'}

  function getPref(){
    const stored=localStorage.getItem(KEY);
    if(!stored){
      localStorage.setItem(KEY,'night');
      return'night';
    }
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

    document.querySelectorAll('.theme-choice').forEach(button=>{
      button.classList.toggle('active',button.dataset.themeChoice===mode);
    });
  }

  function set(pref){
    const mode=normalizePref(pref);
    localStorage.setItem(KEY,mode);
    apply(mode);
  }

  function mount(){
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

  // Set the root theme immediately. CSS is loaded statically through theme.css,
  // so there is no hidden-document interval and no runtime stylesheet race.
  apply();

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',mount,{once:true});
  }else{
    mount();
  }

  window.PathTheme={apply,set,get:getPref};
})();
