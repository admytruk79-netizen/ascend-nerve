(()=>{
  const screens=[...document.querySelectorAll('.screen')];
  const nav=[...document.querySelectorAll('.bottom-nav button')];
  nav.forEach(button=>{if(!button.hasAttribute('aria-label'))button.setAttribute('aria-label',button.textContent.trim())});

  const screenTrail=[];
  let historyReady=false;
  const currentScreen=()=>screens.find(screen=>screen.classList.contains('active'))?.id||'today';

  function activateScreen(id,{record=true}={}){
    const previous=currentScreen();
    if(record&&previous!==id)screenTrail.push(previous);
    screens.forEach(screen=>{
      const active=screen.id===id;
      screen.classList.toggle('active',active);
      if(!active)screen.classList.remove('motion-enter');
      screen.setAttribute('aria-hidden',String(!active));
    });
    nav.forEach(button=>{
      const active=button.dataset.screen===id;
      button.classList.toggle('active',active);
      button.setAttribute('aria-current',active?'page':'false');
    });
    if(historyReady&&record&&previous!==id)history.pushState({ascend:true,screen:id},'',location.href);
    window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  }

  nav.forEach(button=>button.addEventListener('click',()=>activateScreen(button.dataset.screen),true));

  async function syncAuthGate(){
    let confirmedUser=null;
    try{confirmedUser=await PathBackend.me()}catch{}
    document.body.classList.toggle('auth-required',!confirmedUser);
    if(!confirmedUser)activateScreen('me',{record:false});
    return confirmedUser;
  }
  syncAuthGate();

  const mirror=document.getElementById('mirror-content');
  if(mirror&&!mirror.textContent.trim())mirror.innerHTML='<p>Sign in and begin journaling to create a grounded reflection from your own observations.</p>';

  const practiceTitle=document.getElementById('overlay-practice-title');
  const practiceInstructions=document.getElementById('overlay-practice-instructions');
  if(practiceTitle&&!practiceTitle.textContent.trim())practiceTitle.textContent='Self-Contemplation';
  if(practiceInstructions&&!practiceInstructions.textContent.trim())practiceInstructions.textContent='Sit quietly and observe the movement of thought without suppressing, following, or judging it. Return to simple observation whenever attention wanders.';

  const overlays=[...document.querySelectorAll('.practice-overlay,.library-overlay,.path-intro,#practice-briefing,#branch-overlay,#menu-overlay,#about-overlay')];
  const app=document.getElementById('app');
  const bottom=document.querySelector('.bottom-nav');
  let lastFocused=null;

  function activeOverlay(){return overlays.find(item=>!item.classList.contains('hidden'))}

  function syncOverlay(){
    const open=activeOverlay();
    overlays.forEach(item=>item.setAttribute('aria-hidden',String(item!==open)));
    if(open){
      lastFocused=lastFocused||document.activeElement;
      app?.setAttribute('inert','');
      bottom?.setAttribute('inert','');
      requestAnimationFrame(()=>open.querySelector('button,[href],input,textarea,select,[tabindex]:not([tabindex="-1"])')?.focus());
    }else{
      app?.removeAttribute('inert');
      bottom?.removeAttribute('inert');
      lastFocused?.focus?.();
      lastFocused=null;
    }
  }

  overlays.forEach(item=>new MutationObserver(syncOverlay).observe(item,{attributes:true,attributeFilter:['class']}));

  function backPulse(){
    try{
      const Haptics=window.Capacitor?.Plugins?.Haptics;
      if(Haptics?.impact){Haptics.impact({style:'LIGHT'});return}
    }catch{}
    try{navigator.vibrate?.(8)}catch{}
  }

  function closeOverlay(open){
    if(!open)return false;
    if(open.id==='path-intro')window.ASCENDIntro?.close?.();
    else open.classList.add('hidden');
    syncOverlay();
    return true;
  }

  function handleBack(){
    const open=activeOverlay();
    if(open){closeOverlay(open);backPulse();return true}

    const current=currentScreen();
    let target=screenTrail.pop();
    if(document.body.classList.contains('auth-required')||document.body.classList.contains('access-required'))target='me';
    else if(!target&&current!=='today')target='today';
    if(target&&target!==current){activateScreen(target,{record:false});backPulse();return true}
    backPulse();
    return true;
  }

  history.replaceState({ascend:true,screen:currentScreen()},'',location.href);
  history.pushState({ascend:true,guard:true},'',location.href);
  historyReady=true;

  window.addEventListener('popstate',()=>{
    handleBack();
    history.pushState({ascend:true,guard:true},'',location.href);
  });
  try{window.Capacitor?.Plugins?.App?.addListener?.('backButton',()=>handleBack())}catch{}

  document.addEventListener('keydown',event=>{
    const open=activeOverlay();
    if(!open)return;
    if(event.key==='Escape'){
      event.preventDefault();
      closeOverlay(open);
      return;
    }
    if(event.key!=='Tab')return;
    const focusable=[...open.querySelectorAll('button:not([disabled]),[href],input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])')];
    if(!focusable.length)return;
    const first=focusable[0],last=focusable[focusable.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  });
  syncOverlay();

  const menu=document.getElementById('menu-overlay');
  const about=document.getElementById('about-overlay');
  document.getElementById('menu-button')?.addEventListener('click',event=>{
    event.preventDefault();
    event.stopImmediatePropagation();
    menu?.classList.remove('hidden');
  },true);
  document.querySelector('.menu-close')?.addEventListener('click',()=>menu?.classList.add('hidden'));
  menu?.addEventListener('click',event=>{if(event.target===menu)menu.classList.add('hidden')});
  menu?.querySelectorAll('[data-menu-screen]').forEach(button=>button.addEventListener('click',()=>{
    menu.classList.add('hidden');
    activateScreen(button.dataset.menuScreen);
  }));
  document.getElementById('menu-about')?.addEventListener('click',()=>{
    menu?.classList.add('hidden');
    about?.classList.remove('hidden');
  });

  document.addEventListener('click',event=>{
    if(!event.target.closest('[data-go-signin]'))return;
    activateScreen('me');
    setTimeout(()=>document.getElementById('google-sign-in')?.focus(),250);
  });

  document.addEventListener('click',event=>{
    if(!event.target.closest('[data-go-journal]'))return;
    activateScreen('journal');
    setTimeout(()=>document.querySelector('#journal-form textarea[name="observation"]')?.focus(),180);
  });

  const journalHeading=document.querySelector('#journal h1');
  if(journalHeading&&!document.querySelector('#journal .journal-context')){
    const context=document.createElement('p');
    context.className='journal-context';
    context.textContent='Record what you observed in practice or ordinary life. One meaningful field is enough.';
    journalHeading.insertAdjacentElement('afterend',context);
  }

  const finishPractice=document.getElementById('finish-practice');
  finishPractice?.addEventListener('click',()=>{
    if(!finishPractice.classList.contains('ready'))return;
    setTimeout(()=>{
      if(!document.getElementById('practice-overlay')?.classList.contains('hidden'))return;
      activateScreen('journal');
      const status=document.getElementById('journal-status');
      if(status)status.textContent='Practice complete. Note anything you want to remember.';
      document.querySelector('#journal-form textarea[name="observation"]')?.focus();
    },250);
  });

  document.addEventListener('ascend:journal-saved',event=>{
    if(event.detail?.saved===false)return;
    activateScreen('today');
  });

  document.getElementById('google-sign-in')?.addEventListener('click',()=>setTimeout(syncAuthGate,400));
  document.getElementById('sign-out')?.addEventListener('click',()=>setTimeout(syncAuthGate,100));

  window.ASCENDUX={activateScreen,syncOverlay,syncAuthGate,handleBack};
})();