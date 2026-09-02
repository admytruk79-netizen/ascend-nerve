(()=>{
  const splash=document.getElementById('splash');
  const SPLASH_MIN_MS=1600;
  const splashStartedAt=performance.now();
  let splashDismissed=false;

  function dismissSplash(){
    if(splashDismissed)return;
    splashDismissed=true;
    const remaining=Math.max(0,SPLASH_MIN_MS-(performance.now()-splashStartedAt));
    setTimeout(()=>{
      splash?.classList.add('is-hidden');
      splash?.setAttribute('aria-hidden','true');
    },remaining);
  }

  splash?.classList.remove('is-hidden');
  splash?.setAttribute('aria-hidden','false');
  if(document.readyState==='complete')dismissSplash();
  else window.addEventListener('load',dismissSplash,{once:true});
  setTimeout(dismissSplash,3200);

  const libraryOverlay=document.getElementById('library-overlay');
  const closeLibrary=()=>libraryOverlay?.classList.add('hidden');
  document.querySelector('.library-close')?.addEventListener('click',closeLibrary);
  libraryOverlay?.addEventListener('click',event=>{if(event.target===libraryOverlay)closeLibrary()});

  const aboutOverlay=document.getElementById('about-overlay');
  const closeAbout=()=>aboutOverlay?.classList.add('hidden');
  document.getElementById('menu-button')?.addEventListener('click',()=>aboutOverlay?.classList.remove('hidden'));
  document.querySelector('.about-close')?.addEventListener('click',closeAbout);
  aboutOverlay?.addEventListener('click',event=>{if(event.target===aboutOverlay)closeAbout()});

  const escapeText=(value='')=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const paragraphs=(text='')=>String(text).split(/\n\s*\n|\n/).map(x=>x.trim()).filter(Boolean).map(p=>`<p>${escapeText(p)}</p>`).join('');

  function openLibraryCard(card){
    if(!card||card.classList.contains('locked')||!window.curriculum)return;
    const slug=card.dataset.slug;
    const title=card.querySelector('strong')?.textContent?.trim();
    const item=window.curriculum.content?.find(entry=>slug?entry.slug===slug:entry.title===title);
    if(!item)return;

    window.LibraryEngine?.recordLibraryView(item);
    const typeTarget=document.getElementById('library-reader-type');
    if(typeTarget)typeTarget.textContent=(item.content_type||'TEACHING').toUpperCase();
    const titleTarget=document.getElementById('library-title');
    if(titleTarget)titleTarget.textContent=item.title||'';
    const body=item.body||item.summary||'This item is available as part of your current Path stage.';
    const bodyTarget=document.getElementById('library-body');
    if(bodyTarget)bodyTarget.innerHTML=paragraphs(body)+`<div class="source-note">ASCEND Path Library · ${escapeText(item.metadata?.source||'ASCEND curriculum')}</div>`;
    libraryOverlay?.classList.remove('hidden');
  }

  const clickLibraryItem=event=>openLibraryCard(event.target.closest('.content-card'));
  const keyLibraryItem=event=>{
    if(event.key!=='Enter'&&event.key!==' ')return;
    const card=event.target.closest('.content-card[role="button"]');
    if(!card||card.getAttribute('aria-disabled')==='true')return;
    event.preventDefault();
    openLibraryCard(card);
  };

  ['library-list','library-recommended'].forEach(id=>{
    const root=document.getElementById(id);
    root?.addEventListener('click',clickLibraryItem);
    root?.addEventListener('keydown',keyLibraryItem);
  });
})();
