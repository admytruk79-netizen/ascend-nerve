(()=>{
  const splash=document.getElementById('splash');
  const dismissSplash=()=>splash?.classList.add('done');
  window.addEventListener('load',()=>setTimeout(dismissSplash,2400),{once:true});
  setTimeout(dismissSplash,4200);

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

  document.getElementById('library-list')?.addEventListener('click',e=>{
    const card=e.target.closest('.content-card');
    if(!card||card.classList.contains('locked')||!window.curriculum)return;
    const title=card.querySelector('strong')?.textContent?.trim();
    const item=window.curriculum.content?.find(x=>x.title===title);
    if(!item)return;
    document.getElementById('library-type').textContent=(item.content_type||'TEACHING').toUpperCase();
    document.getElementById('library-title').textContent=item.title||'';
    const body=item.body||item.summary||'This item is available as part of your current Path stage.';
    document.getElementById('library-body').innerHTML=paragraphs(body)+`<div class="source-note">ASCEND Path Library · ${escapeText(item.metadata?.source||'ASCEND curriculum')}</div>`;
    overlay.classList.remove('hidden');
  });

  // Expose curriculum to the reader without changing the Path engine contract.
  const wait=()=>{
    try{if(typeof curriculum!=='undefined'&&curriculum){window.curriculum=curriculum;return}}catch{}
    setTimeout(wait,350);
  };
  wait();
})();
