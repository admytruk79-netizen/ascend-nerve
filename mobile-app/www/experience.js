(()=>{
  // Experience owns Library reading only. Splash lifecycle belongs to
  // startup-stability.js and global navigation/menu behavior belongs to ASCENDUX.
  const overlay=document.getElementById('library-overlay');
  const close=()=>overlay?.classList.add('hidden');
  document.querySelector('.library-close')?.addEventListener('click',close);
  overlay?.addEventListener('click',event=>{if(event.target===overlay)close()});

  const escapeText=(value='')=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const paragraphs=(text='')=>String(text).split(/\n\s*\n|\n/).map(x=>x.trim()).filter(Boolean).map(p=>`<p>${escapeText(p)}</p>`).join('');

  function openLibraryItem(event){
    const card=event.target.closest('.content-card');
    if(!card||card.classList.contains('locked')||card.getAttribute('aria-disabled')==='true'||!window.curriculum)return;
    const slug=card.dataset.slug;
    const title=card.querySelector('strong')?.textContent?.trim();
    const item=window.curriculum.content?.find(x=>slug?x.slug===slug:x.title===title);
    if(!item||window.ASCENDLibraryAccess&&!window.ASCENDLibraryAccess.canOpen(item))return;
    window.LibraryEngine?.recordLibraryView(item);
    const typeTarget=document.getElementById('library-reader-type');
    if(typeTarget)typeTarget.textContent=(item.content_type||'TEACHING').toUpperCase();
    const titleTarget=document.getElementById('library-title');
    if(titleTarget)titleTarget.textContent=item.title||'';
    const body=item.body||item.summary||'This item is available as part of your current Path stage.';
    document.getElementById('library-body').innerHTML=paragraphs(body)+`<div class="source-note">ASCEND Path Library · ${escapeText(item.metadata?.source||'ASCEND curriculum')}</div>`;
    overlay?.classList.remove('hidden');
  }

  document.getElementById('library-list')?.addEventListener('click',openLibraryItem);
  document.getElementById('library-recommended')?.addEventListener('click',openLibraryItem);
  function openFromKeyboard(event){
    if(event.key!=='Enter'&&event.key!==' ')return;
    const card=event.target.closest('.content-card[role="button"]');
    if(!card||card.getAttribute('aria-disabled')==='true')return;
    event.preventDefault();openLibraryItem(event);
  }
  document.getElementById('library-list')?.addEventListener('keydown',openFromKeyboard);
  document.getElementById('library-recommended')?.addEventListener('keydown',openFromKeyboard);

  function exposeCurriculum(){try{if(typeof curriculum!=='undefined'&&curriculum)window.curriculum=curriculum}catch{}}
  document.addEventListener('ascend:curriculum',exposeCurriculum);
  exposeCurriculum();
})();
