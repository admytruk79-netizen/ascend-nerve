(()=>{
  const splash=document.getElementById('splash');
  const screens=[...document.querySelectorAll('.screen')];
  const nav=[...document.querySelectorAll('.bottom-nav button[data-screen]')];
  let userNavigated=false;
  let stableScreen='today';
  const setScreen=(id)=>{
    if(!screens.some(s=>s.id===id))id='today';
    stableScreen=id;
    screens.forEach(s=>{const on=s.id===id;s.classList.toggle('active',on);s.setAttribute('aria-hidden',String(!on))});
    nav.forEach(b=>{const on=b.dataset.screen===id;b.classList.toggle('active',on);b.setAttribute('aria-current',on?'page':'false')});
  };
  nav.forEach(b=>b.addEventListener('click',()=>{userNavigated=true;setScreen(b.dataset.screen)},true));
  document.querySelectorAll('[data-menu-screen]').forEach(b=>b.addEventListener('click',()=>{userNavigated=true;setScreen(b.dataset.menuScreen)},true));
  setScreen('today');
  if(splash){
    splash.classList.remove('is-hidden');
    splash.setAttribute('aria-hidden','false');
    // Mirrors experience.js's reveal-anchored minimum: the entrance animation only
    // starts once theme.js reveals the page, so dismissal must wait on that too.
    let revealed=document.documentElement.classList.contains('theme-authority-ready');
    let wantsFinish=false;
    let splashDone=false;
    const hide=()=>{
      if(splashDone||!revealed||!wantsFinish)return;
      splashDone=true;
      setTimeout(()=>{splash.classList.add('is-hidden');splash.setAttribute('aria-hidden','true')},2600);
    };
    const onRevealed=()=>{revealed=true;hide()};
    if(!revealed)document.addEventListener('ascend:theme-ready',onRevealed,{once:true});
    setTimeout(()=>{if(!revealed)onRevealed()},5000);
    const finish=()=>{wantsFinish=true;hide()};
    if(document.readyState==='complete')finish();else window.addEventListener('load',finish,{once:true});
    setTimeout(finish,3200);
  }
  // Startup/auth modules may select Today or Me while resolving state. Once the user
  // chooses a destination, no background startup callback is allowed to cycle tabs.
  const observer=new MutationObserver(()=>{
    if(!userNavigated)return;
    const active=screens.filter(s=>s.classList.contains('active'));
    if(active.length!==1||active[0]?.id!==stableScreen)setScreen(stableScreen);
  });
  screens.forEach(s=>observer.observe(s,{attributes:true,attributeFilter:['class']}));
})();
