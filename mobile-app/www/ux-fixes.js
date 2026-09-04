(()=>{
  const screens=[...document.querySelectorAll('.screen')];
  const nav=[...document.querySelectorAll('.bottom-nav button[data-screen]')];
  const validScreens=new Set(screens.map(screen=>screen.id));
  const trail=[];
  let historyReady=false;
  let navigating=false;

  nav.forEach(button=>{if(!button.hasAttribute('aria-label'))button.setAttribute('aria-label',button.textContent.trim())});
  const currentScreen=()=>screens.find(screen=>screen.classList.contains('active'))?.id||'today';

  function activateScreen(id,{record=true,history=true,focus=false}={}){
    if(!validScreens.has(id))id='today';
    const previous=currentScreen();
    if(previous===id){
      if(focus)document.getElementById(id)?.focus?.();
      return;
    }
    if(record)trail.push(previous);
    navigating=true;
    screens.forEach(screen=>{
      const active=screen.id===id;
      screen.classList.toggle('active',active);
      if(!active)screen.classList.remove('motion-enter');
      screen.setAttribute('aria-hidden',String(!active));
    });
    nav.forEach(button=>{
      const active=button.dataset.screen===id;
      button.classList.toggle('active',active);
      if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
    });
    if(historyReady&&history&&previous!==id)window.history.pushState({ascend:true,screen:id},'',location.href);
    window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    navigating=false;
    document.dispatchEvent(new CustomEvent('ascend:navigation',{detail:{from:previous,to:id}}));
  }

  nav.forEach(button=>button.addEventListener('click',event=>{
    event.preventDefault();
    activateScreen(button.dataset.screen);
  },true));

  async function syncAuthGate(){
    let confirmedUser=null;
    try{confirmedUser=await PathBackend.me()}catch{}
    if(!confirmedUser){
      document.body.classList.add('auth-required');
      activateScreen('me',{record:false,history:false});
    }
    return confirmedUser;
  }
  syncAuthGate();

  const mirror=document.getElementById('mirror-content');
  if(mirror&&!mirror.textContent.trim())mirror.innerHTML='<p>Sign in and begin journaling to create a grounded reflection from your own observations.</p>';
  const practiceTitle=document.getElementById('overlay-practice-title');
  const practiceInstructions=document.getElementById('overlay-practice-instructions');
  if(practiceTitle&&!practiceTitle.textContent.trim())practiceTitle.textContent='Self-Contemplation';
  if(practiceInstructions&&!practiceInstructions.textContent.trim())practiceInstructions.textContent='Sit quietly and observe the movement of thought without suppressing, following, or judging it. Return to simple observation whenever attention wanders.';

  const overlays=[...document.querySelectorAll('.practice-overlay,.library-overlay,.path-intro')];
  const app=document.getElementById('app'),bottom=document.querySelector('.bottom-nav');
  let lastFocused=null;
  function activeOverlay(){return overlays.find(item=>!item.classList.contains('hidden'))}
  function syncOverlay(){
    const open=activeOverlay();
    overlays.forEach(item=>item.setAttribute('aria-hidden',String(item!==open)));
    if(open){
      lastFocused=lastFocused||document.activeElement;
      app?.setAttribute('inert','');bottom?.setAttribute('inert','');
      requestAnimationFrame(()=>open.querySelector('button,[href],input,textarea,select,[tabindex]:not([tabindex="-1"])')?.focus());
    }else{
      app?.removeAttribute('inert');bottom?.removeAttribute('inert');
      lastFocused?.focus?.();lastFocused=null;
    }
  }
  overlays.forEach(item=>new MutationObserver(syncOverlay).observe(item,{attributes:true,attributeFilter:['class']}));

  function backPulse(){
    try{const Haptics=window.Capacitor?.Plugins?.Haptics;if(Haptics?.impact){Haptics.impact({style:'LIGHT'});return}}catch{}
    try{navigator.vibrate?.(8)}catch{}
  }
  function closeOverlay(open){
    if(open.id==='path-intro')window.ASCENDIntro?.close?.();else open.classList.add('hidden');
    syncOverlay();
  }
  function handleBack(){
    const open=activeOverlay();
    if(open){closeOverlay(open);backPulse();return true}
    const current=currentScreen();
    let target=trail.pop();
    if(document.body.classList.contains('auth-required')||document.body.classList.contains('access-required'))target='me';
    else if(!target&&current!=='today')target='today';
    if(target&&target!==current)activateScreen(target,{record:false,history:false});
    backPulse();
    return true;
  }

  window.history.replaceState({ascend:true,screen:currentScreen()},'',location.href);
  historyReady=true;
  window.addEventListener('popstate',event=>{
    if(navigating)return;
    const target=event.state?.ascend&&validScreens.has(event.state.screen)?event.state.screen:null;
    if(target)activateScreen(target,{record:false,history:false});else handleBack();
  });
  try{window.Capacitor?.Plugins?.App?.addListener?.('backButton',()=>handleBack())}catch{}

  document.addEventListener('keydown',event=>{
    const open=activeOverlay();if(!open)return;
    if(event.key==='Escape'){event.preventDefault();closeOverlay(open);return}
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
  document.getElementById('menu-button')?.addEventListener('click',event=>{event.preventDefault();menu?.classList.remove('hidden')},true);
  document.querySelector('.menu-close')?.addEventListener('click',()=>menu?.classList.add('hidden'));
  menu?.addEventListener('click',event=>{if(event.target===menu)menu.classList.add('hidden')});
  menu?.querySelectorAll('[data-menu-screen]').forEach(button=>button.addEventListener('click',()=>{menu.classList.add('hidden');activateScreen(button.dataset.menuScreen)}));
  document.getElementById('menu-about')?.addEventListener('click',()=>{menu?.classList.add('hidden');about?.classList.remove('hidden')});

  document.addEventListener('click',event=>{
    if(event.target.closest('[data-go-signin]')){activateScreen('me');setTimeout(()=>document.getElementById('google-sign-in')?.focus(),180);return}
    if(event.target.closest('[data-go-journal]')){
      activateScreen('journal');
      setTimeout(()=>document.querySelector('#journal-form textarea[name="observation"]')?.focus(),120);
    }
  });

  const journalHeading=document.querySelector('#journal h1');
  if(journalHeading&&!document.querySelector('#journal .journal-context')){
    const context=document.createElement('p');context.className='journal-context';
    context.textContent='Record what you observed in practice or ordinary life. One meaningful field is enough.';
    journalHeading.insertAdjacentElement('afterend',context);
  }

  // Practice completion service emits this only after the backend confirms a session.
  document.addEventListener('ascend:practice-confirmed',()=>{
    activateScreen('journal');
    const status=document.getElementById('journal-status');
    if(status)status.textContent='Practice complete. Record what you actually observed.';
    setTimeout(()=>document.querySelector('#journal-form textarea[name="observation"]')?.focus(),80);
  });
  document.addEventListener('ascend:journal-saved',()=>activateScreen('today'));

  document.getElementById('google-sign-in')?.addEventListener('click',()=>setTimeout(syncAuthGate,400));
  document.getElementById('sign-out')?.addEventListener('click',()=>setTimeout(syncAuthGate,100));

  window.ASCENDUX={activateScreen,syncOverlay,syncAuthGate,handleBack,currentScreen};
})();
