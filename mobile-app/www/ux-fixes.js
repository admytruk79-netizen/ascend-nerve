(()=>{
  const screens=[...document.querySelectorAll('.screen')];
  const nav=[...document.querySelectorAll('.bottom-nav button')];
  const screenTrail=[];
  let historyReady=false;
  const currentScreen=()=>screens.find(screen=>screen.classList.contains('active'))?.id||'today';
  function activateScreen(id,{record=true}={}){
    const previous=currentScreen();
    if(record&&previous!==id)screenTrail.push(previous);
    screens.forEach(screen=>{const active=screen.id===id;screen.classList.toggle('active',active);if(!active)screen.classList.remove('motion-enter');screen.setAttribute('aria-hidden',String(!active))});
    nav.forEach(button=>{const active=button.dataset.screen===id;button.classList.toggle('active',active);button.setAttribute('aria-current',active?'page':'false')});
    if(historyReady&&record&&previous!==id)history.pushState({ascend:true,screen:id},'',location.href);
    window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  }
  nav.forEach(button=>button.addEventListener('click',()=>activateScreen(button.dataset.screen),true));

  const authGateStyle=document.createElement('style');
  authGateStyle.textContent=`
    body.auth-required{min-height:100vh}
    body.auth-required #app .topbar,
    body.auth-required #app .screen:not(#me),
    body.auth-required #me> :not(.auth-card),
    body.auth-required .bottom-nav{display:none!important}
    body.auth-required #me{display:flex!important;min-height:100vh;align-items:center;justify-content:center;padding:32px 20px!important}
    body.auth-required #me .auth-card{display:block!important;width:min(100%,460px);margin:0 auto}
    body.auth-required #me .auth-card:before{content:'ASCEND PATH';display:block;letter-spacing:.18em;font-size:.78rem;margin-bottom:14px;opacity:.72}
    .journal-context{margin:-4px 0 20px;opacity:.72;line-height:1.5}
    .journal-saved-panel{margin:18px 0 10px;padding:14px;border:1px solid var(--line);border-radius:14px;background:var(--panel)}
    .journal-saved-panel strong{display:block;color:var(--teal);font-size:13px}
    .journal-saved-panel p{margin:5px 0 0;color:var(--muted);font-size:11px;line-height:1.5}
    .journal-saved-panel button{margin-top:11px}
    .journal-history{margin-top:24px;padding-top:18px;border-top:1px solid var(--line)}
    .journal-history h2{margin-bottom:4px}
    .journal-history-intro{margin:0 0 12px;color:var(--muted);font-size:11px;line-height:1.5}
    .journal-history-list{display:grid;gap:8px}
    .journal-history-entry{padding:12px;border:1px solid var(--line);border-radius:12px;background:var(--panel2)}
    .journal-history-entry small{display:block;color:var(--gold);font-size:8px;letter-spacing:.09em;text-transform:uppercase;margin-bottom:5px}
    .journal-history-entry p{margin:0;color:var(--ivory);font-size:12px;line-height:1.45}
    #today-reflect.complete{border-color:rgba(85,200,189,.48);background:linear-gradient(135deg,rgba(85,200,189,.10),var(--panel))}
    #today-reflect.complete .journal-mark{color:var(--teal)}
  `;
  document.head.appendChild(authGateStyle);

  async function syncAuthGate(){
    let confirmedUser=null;
    try{confirmedUser=await PathBackend.me()}catch{}
    if(!confirmedUser){
      document.body.classList.add('auth-required');
      activateScreen('me',{record:false});
    }else{
      activateScreen('today',{record:false});
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
    if(open){lastFocused=lastFocused||document.activeElement;app?.setAttribute('inert','');bottom?.setAttribute('inert','');requestAnimationFrame(()=>open.querySelector('button,[href],input,textarea,select,[tabindex]:not([tabindex="-1"])')?.focus())}
    else{app?.removeAttribute('inert');bottom?.removeAttribute('inert');lastFocused?.focus?.();lastFocused=null}
  }
  overlays.forEach(item=>new MutationObserver(syncOverlay).observe(item,{attributes:true,attributeFilter:['class']}));

  function backPulse(){
    try{
      const Haptics=window.Capacitor?.Plugins?.Haptics;
      if(Haptics?.impact){Haptics.impact({style:'LIGHT'});return}
    }catch{}
    try{navigator.vibrate?.(8)}catch{}
  }
  function handleBack(){
    const open=activeOverlay();
    if(open){if(open.id==='path-intro')window.ASCENDIntro?.close?.();else open.classList.add('hidden');backPulse();return true}
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

  const journalStatus=document.getElementById('journal-status');
  const journalForm=document.getElementById('journal-form');
  let savedPanel=document.getElementById('journal-saved-panel');
  if(journalStatus&&!savedPanel){
    savedPanel=document.createElement('div');
    savedPanel.id='journal-saved-panel';
    savedPanel.className='journal-saved-panel hidden';
    savedPanel.innerHTML='<strong>Saved to your private Journal ✓</strong><p>This reflection is stored with your ASCEND Path account and appears below in Saved reflections.</p><button class="secondary" type="button" id="journal-back-today">Back to Today</button>';
    journalStatus.insertAdjacentElement('afterend',savedPanel);
    savedPanel.querySelector('#journal-back-today')?.addEventListener('click',()=>activateScreen('today'));
  }

  let historyWrap=document.getElementById('journal-history');
  if(journalStatus&&!historyWrap){
    historyWrap=document.createElement('section');
    historyWrap.id='journal-history';
    historyWrap.className='journal-history';
    historyWrap.innerHTML='<h2>Saved reflections</h2><p class="journal-history-intro">Your recent Journal entries live here. Mirror reads recurring patterns from this private record.</p><div class="journal-history-list" id="journal-history-list"><p class="quiet-note">Loading saved reflections…</p></div>';
    savedPanel?.insertAdjacentElement('afterend',historyWrap);
  }

  const shortText=(row)=>String(row?.observation||row?.inner_state||row?.life_application||row?.interpretation||row?.unresolved||'Reflection saved.').trim();
  const dateLabel=(value)=>{try{return new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric',year:'numeric'}).format(new Date(value))}catch{return value||'Saved reflection'}};
  async function loadJournalHistory(){
    const list=document.getElementById('journal-history-list');if(!list)return;
    let rows=[];
    try{
      const me=await PathBackend.me();
      if(me)rows=await PathBackend.rest('path_journal_entries',{query:`user_id=eq.${me.id}&select=entry_date,created_at,observation,inner_state,life_application,interpretation,unresolved&order=entry_date.desc,created_at.desc&limit=8`});
    }catch{}
    if(!rows.length){
      try{rows=(JSON.parse(localStorage.getItem('ascendPathState')||'{"entries":[]}').entries||[]).slice(-8).reverse()}catch{}
    }
    if(!rows.length){list.innerHTML='<p class="quiet-note">No saved reflections yet. Your first saved entry will appear here.</p>';return}
    list.innerHTML=rows.map(row=>`<article class="journal-history-entry"><small>${dateLabel(row.entry_date||row.created_at)}</small><p>${String(shortText(row)).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])).slice(0,220)}</p></article>`).join('');
  }

  function markJournalComplete(){
    const reflect=document.getElementById('today-reflect');if(!reflect)return;
    reflect.classList.add('complete');
    const strong=reflect.querySelector('strong'),small=reflect.querySelector('small'),mark=reflect.querySelector('.journal-mark');
    if(strong)strong.textContent='Journal reflection saved ✓';
    if(small)small.textContent='Stored in your private Journal';
    if(mark)mark.textContent='✓';
    localStorage.setItem(`ascendJournalDone:${new Date().toISOString().slice(0,10)}`,'1');
  }
  if(localStorage.getItem(`ascendJournalDone:${new Date().toISOString().slice(0,10)}`)==='1')markJournalComplete();

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

  // Saving keeps the user in Journal, makes storage explicit, and updates the daily loop.
  journalForm?.addEventListener('submit',()=>{
    savedPanel?.classList.add('hidden');
    setTimeout(async()=>{
      const text=journalStatus?.textContent||'';
      if(/Reflection saved privately|Connection unavailable\. Reflection saved|Reflection saved privately on this device/i.test(text)){
        if(journalStatus)journalStatus.textContent=/Connection unavailable|on this device/i.test(text)?text:'Saved. This reflection is now in your private Journal below.';
        savedPanel?.classList.remove('hidden');
        markJournalComplete();
        await loadJournalHistory();
      }
    },800);
  });

  document.querySelector('.bottom-nav button[data-screen="journal"]')?.addEventListener('click',()=>setTimeout(loadJournalHistory,80));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&currentScreen()==='journal')loadJournalHistory()});
  setTimeout(loadJournalHistory,1200);

  document.getElementById('google-sign-in')?.addEventListener('click',()=>setTimeout(syncAuthGate,400));
  document.getElementById('sign-out')?.addEventListener('click',()=>setTimeout(syncAuthGate,100));
  window.ASCENDUX={activateScreen,syncOverlay,syncAuthGate,handleBack,loadJournalHistory};
})();
