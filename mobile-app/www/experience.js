(()=>{
  const splash=document.getElementById('splash');
  const splashStartedAt=Date.now();
  const MIN_SPLASH_MS=2400;
  const MAX_SPLASH_MS=12000;
  let splashDismissed=false;

  const startupStateSettled=()=>{
    try{
      if(!window.PathBackend?.isSignedIn?.())return true;
      if(document.body.classList.contains('access-required'))return true;
      const appReady=!document.body.classList.contains('auth-required')&&!!window.curriculum;
      const introReady=window.__ASCEND_INTRO_DECIDED===true;
      return appReady&&introReady;
    }catch{return false}
  };

  const dismissSplash=()=>{
    if(splashDismissed)return;
    splashDismissed=true;
    // Reveal exactly one resolved route under the cinematic layer.
    document.documentElement.classList.remove('ascend-booting');
    splash?.classList.add('done');
  };

  const finishSplashWhenReady=()=>{
    if(splashDismissed)return;
    const elapsed=Date.now()-splashStartedAt;
    const minimumComplete=elapsed>=MIN_SPLASH_MS;
    const hardLimitReached=elapsed>=MAX_SPLASH_MS;
    if(minimumComplete&&(startupStateSettled()||hardLimitReached)){
      requestAnimationFrame(()=>requestAnimationFrame(dismissSplash));
      return;
    }
    setTimeout(finishSplashWhenReady,80);
  };

  window.addEventListener('load',finishSplashWhenReady,{once:true});
  document.addEventListener('ascend:intro-decided',finishSplashWhenReady);
  setTimeout(finishSplashWhenReady,60);

  const overlay=document.getElementById('library-overlay');
  const close=()=>overlay?.classList.add('hidden');
  document.querySelector('.library-close')?.addEventListener('click',close);
  overlay?.addEventListener('click',e=>{if(e.target===overlay)close()});

  const aboutOverlay=document.getElementById('about-overlay');
  const closeAbout=()=>aboutOverlay?.classList.add('hidden');
  document.getElementById('menu-button')?.addEventListener('click',()=>aboutOverlay?.classList.remove('hidden'));
  document.querySelector('.about-close')?.addEventListener('click',closeAbout);
  aboutOverlay?.addEventListener('click',e=>{if(e.target===aboutOverlay)closeAbout()});

  const escapeText=(value='')=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const paragraphs=(text='')=>String(text).split(/\n\s*\n|\n/).map(x=>x.trim()).filter(Boolean).map(p=>`<p>${escapeText(p)}</p>`).join('');

  const openLibraryItem=e=>{
    const card=e.target.closest('.content-card');
    if(!card||card.classList.contains('locked')||!window.curriculum)return;
    const slug=card.dataset.slug;
    const title=card.querySelector('strong')?.textContent?.trim();
    const item=window.curriculum.content?.find(x=>slug?x.slug===slug:x.title===title);
    if(!item)return;
    window.LibraryEngine?.recordLibraryView(item);
    document.getElementById('library-type').textContent=(item.content_type||'TEACHING').toUpperCase();
    document.getElementById('library-title').textContent=item.title||'';
    const body=item.body||item.summary||'This item is available as part of your current Path stage.';
    document.getElementById('library-body').innerHTML=paragraphs(body)+`<div class="source-note">ASCEND Path Library · ${escapeText(item.metadata?.source||'ASCEND curriculum')}</div>`;
    overlay.classList.remove('hidden');
  };
  document.getElementById('library-list')?.addEventListener('click',openLibraryItem);
  document.getElementById('library-recommended')?.addEventListener('click',openLibraryItem);
  const openLibraryItemFromKeyboard=e=>{
    if(e.key!=='Enter'&&e.key!==' ')return;
    const card=e.target.closest('.content-card[role="button"]');
    if(!card||card.getAttribute('aria-disabled')==='true')return;
    e.preventDefault();openLibraryItem(e);
  };
  document.getElementById('library-list')?.addEventListener('keydown',openLibraryItemFromKeyboard);
  document.getElementById('library-recommended')?.addEventListener('keydown',openLibraryItemFromKeyboard);

  const wait=()=>{
    try{if(typeof curriculum!=='undefined'&&curriculum){window.curriculum=curriculum;return}}catch{}
    setTimeout(wait,350);
  };
  wait();
})();
