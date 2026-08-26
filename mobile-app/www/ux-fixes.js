(()=>{
  const screens=[...document.querySelectorAll('.screen')];
  const nav=[...document.querySelectorAll('.bottom-nav button')];
  function activateScreen(id){
    screens.forEach(screen=>{const active=screen.id===id;screen.classList.toggle('active',active);if(!active)screen.classList.remove('motion-enter');screen.setAttribute('aria-hidden',String(!active))});
    nav.forEach(button=>{const active=button.dataset.screen===id;button.classList.toggle('active',active);button.setAttribute('aria-current',active?'page':'false')});
    window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  }
  nav.forEach(button=>button.addEventListener('click',()=>activateScreen(button.dataset.screen),true));

  const authGateStyle=document.createElement('style');
  authGateStyle.textContent=`
    body.auth-required,body.paywall-required{min-height:100vh}
    body.auth-required #app .topbar,body.paywall-required #app .topbar,
    body.auth-required #app .screen:not(#me),body.paywall-required #app .screen:not(#me),
    body.auth-required #me> :not(.auth-card),
    body.paywall-required #me> :not(.paywall-card),
    body.auth-required .bottom-nav,body.paywall-required .bottom-nav{display:none!important}
    body.auth-required #me,body.paywall-required #me{display:flex!important;min-height:100vh;align-items:center;justify-content:center;padding:32px 20px!important}
    body.auth-required #me .auth-card{display:block!important;width:min(100%,460px);margin:0 auto}
    body.auth-required #me .auth-card:before{content:'ASCEND PATH';display:block;letter-spacing:.18em;font-size:.78rem;margin-bottom:14px;opacity:.72}
    body.paywall-required #me .paywall-card{display:block!important;width:min(100%,460px);margin:0 auto}
    .journal-context{margin:-4px 0 20px;opacity:.72;line-height:1.5}
  `;
  document.head.appendChild(authGateStyle);

  async function syncAuthGate(){
    let confirmedUser=null;
    try{confirmedUser=await PathBackend.me()}catch{}
    if(!confirmedUser){
      document.body.classList.remove('paywall-required');
      document.body.classList.add('auth-required');
      activateScreen('me');
      return null;
    }
    document.body.classList.remove('auth-required');
    let entitled=false;
    try{const entitlement=await PathBackend.getMyEntitlement(confirmedUser.id);entitled=!!entitlement}catch(e){console.error('ASCEND entitlement check failed',e)}
    document.body.classList.toggle('paywall-required',!entitled);
    if(!entitled)activateScreen('me');
    return confirmedUser;
  }
  syncAuthGate();
  window.AscendBilling?.init();
  window.AscendBilling?.onStatusChange(()=>syncAuthGate());

  const mirror=document.getElementById('mirror-content');
  if(mirror&&!mirror.textContent.trim())mirror.innerHTML='<p>Sign in and begin journaling to create a grounded reflection from your own observations.</p>';
  const practiceTitle=document.getElementById('overlay-practice-title');
  const practiceInstructions=document.getElementById('overlay-practice-instructions');
  if(practiceTitle&&!practiceTitle.textContent.trim())practiceTitle.textContent='Self-Contemplation';
  if(practiceInstructions&&!practiceInstructions.textContent.trim())practiceInstructions.textContent='Sit quietly and observe the movement of thought without suppressing, following, or judging it. Return to simple observation whenever attention wanders.';

  const overlays=[...document.querySelectorAll('.practice-overlay,.library-overlay')];
  const app=document.getElementById('app'),bottom=document.querySelector('.bottom-nav');
  let lastFocused=null;
  function activeOverlay(){return overlays.find(item=>!item.classList.contains('hidden'))}
  function syncOverlay(){
    const open=activeOverlay();
    overlays.forEach(item=>item.setAttribute('aria-hidden',String(item!==open)));
    if(open){lastFocused=lastFocused||document.activeElement;app?.setAttribute('inert','');bottom?.setAttribute('inert','');requestAnimationFrame(()=>open.querySelector('button,[href],input,textarea,select,[tabindex]:not([tabindex="-1"])')?.focus())}
    else{app?.removeAttribute('inert');bottom?.removeAttribute('inert');lastFocused?.focus?.();lastFocused=null}
  }
  overlays.forEach(item=>new MutationObserver(syncOverlay).observe(item,{attributes:true,attributeFilter:['class']}));
  document.addEventListener('keydown',event=>{
    const open=activeOverlay();if(!open)return;
    if(event.key==='Escape'){event.preventDefault();open.classList.add('hidden');return}
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
  document.getElementById('menu-button')?.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();menu?.classList.remove('hidden')},true);
  document.querySelector('.menu-close')?.addEventListener('click',()=>menu?.classList.add('hidden'));
  menu?.addEventListener('click',event=>{if(event.target===menu)menu.classList.add('hidden')});
  menu?.querySelectorAll('[data-menu-screen]').forEach(button=>button.addEventListener('click',()=>{menu.classList.add('hidden');activateScreen(button.dataset.menuScreen)}));
  document.getElementById('menu-about')?.addEventListener('click',()=>{menu?.classList.add('hidden');about?.classList.remove('hidden')});

  document.addEventListener('click',event=>{if(!event.target.closest('[data-go-signin]'))return;activateScreen('me');setTimeout(()=>document.getElementById('google-sign-in')?.focus(),250)});

  // Journal is a first-class part of Today, not a destination users must remember.
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

  // After a genuinely completed practice, move naturally into reflection.
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

  // When a reflection is saved successfully, return to Today to complete the daily loop.
  const journalForm=document.getElementById('journal-form');
  journalForm?.addEventListener('submit',()=>{
    setTimeout(()=>{
      const text=document.getElementById('journal-status')?.textContent||'';
      if(/Reflection saved privately/i.test(text))activateScreen('today');
    },700);
  });

  document.getElementById('google-sign-in')?.addEventListener('click',()=>setTimeout(syncAuthGate,400));
  document.getElementById('sign-out')?.addEventListener('click',()=>setTimeout(syncAuthGate,100));
  window.ASCENDUX={activateScreen,syncOverlay,syncAuthGate};
})();
