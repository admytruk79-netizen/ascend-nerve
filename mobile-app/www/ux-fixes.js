(()=>{
  const screens=[...document.querySelectorAll('.screen')];
  const nav=[...document.querySelectorAll('.bottom-nav button')];
  function activateScreen(id){
    screens.forEach(screen=>{const active=screen.id===id;screen.classList.toggle('active',active);if(!active)screen.classList.remove('motion-enter');screen.setAttribute('aria-hidden',String(!active))});
    nav.forEach(button=>{const active=button.dataset.screen===id;button.classList.toggle('active',active);button.setAttribute('aria-current',active?'page':'false')});
    window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  }
  nav.forEach(button=>button.addEventListener('click',()=>activateScreen(button.dataset.screen),true));

  const mirror=document.getElementById('mirror-content');
  if(mirror&&!mirror.textContent.trim())mirror.innerHTML='<p>Sign in and begin journaling to create a grounded reflection from your own observations.</p>';
  const practiceTitle=document.getElementById('overlay-practice-title');
  const practiceInstructions=document.getElementById('overlay-practice-instructions');
  if(practiceTitle&&!practiceTitle.textContent.trim())practiceTitle.textContent='Self-Contemplation';
  if(practiceInstructions&&!practiceInstructions.textContent.trim())practiceInstructions.textContent='Sit quietly and observe the movement of thought without suppressing, following, or judging it. Return to simple observation whenever attention wanders.';

  const journal=document.getElementById('journal-form');
  journal?.addEventListener('submit',event=>{
    const values=[...new FormData(journal).values()].map(value=>String(value).trim());
    if(values.some(Boolean))return;
    event.preventDefault();event.stopImmediatePropagation();
    const status=document.getElementById('journal-status');
    if(status)status.textContent='Write at least one observation before saving this reflection.';
    journal.querySelector('textarea')?.focus();
  },true);

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

  document.addEventListener('click',event=>{if(!event.target.closest('[data-go-signin]'))return;activateScreen('me');setTimeout(()=>document.querySelector('#auth-form input[name="email"]')?.focus(),250)});
  window.ASCENDUX={activateScreen,syncOverlay};
})();
