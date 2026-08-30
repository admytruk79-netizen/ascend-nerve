(()=>{
  const splash=document.getElementById('splash');
  let splashDismissed=false;

  const dismissSplash=()=>{
    if(splashDismissed)return;
    splashDismissed=true;
    splash?.classList.add('done');
  };

  // Fail-safe startup: the splash is decorative only and must never block the app.
  // Dismiss after first paint regardless of auth, entitlement, curriculum, or intro state.
  const scheduleSplashDismiss=()=>{
    requestAnimationFrame(()=>requestAnimationFrame(dismissSplash));
  };
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',scheduleSplashDismiss,{once:true});
  }else{
    scheduleSplashDismiss();
  }
  window.addEventListener('load',scheduleSplashDismiss,{once:true});
  setTimeout(dismissSplash,1200);

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

  // Expose curriculum to the reader without changing the Path engine contract.
  const wait=()=>{
    try{if(typeof curriculum!=='undefined'&&curriculum){window.curriculum=curriculum;return}}catch{}
    setTimeout(wait,350);
  };
  wait();
})();
