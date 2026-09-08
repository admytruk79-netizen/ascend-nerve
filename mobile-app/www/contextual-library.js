(()=>{
  /*
   * Compatibility bridge during ASCEND reconstruction.
   *
   * Library presentation, current-month gating, related teaching and reader
   * behavior are owned by app/screens/library.js under the master one-owner
   * rule. Legacy callers may still invoke ASCENDContextualLibrary.render()
   * until app.js is retired; delegate those calls to the master owner instead
   * of maintaining a competing Library implementation here.
   */
  async function render(){
    return window.ASCENDLibrary?.render?.();
  }

  function ensureLightbox(){
    let box=document.getElementById('ascend-library-art-lightbox');
    if(box)return box;
    box=document.createElement('div');
    box.id='ascend-library-art-lightbox';
    box.className='ascend-art-lightbox hidden';
    box.setAttribute('role','dialog');
    box.setAttribute('aria-modal','true');
    box.setAttribute('aria-hidden','true');
    box.innerHTML='<button class="ascend-art-lightbox-close" type="button" aria-label="Close artwork">×</button><figure><img alt=""/><figcaption></figcaption></figure>';
    document.body.append(box);
    box.querySelector('.ascend-art-lightbox-close')?.addEventListener('click',closeLightbox);
    box.addEventListener('click',event=>{if(event.target===box)closeLightbox()});
    return box;
  }

  function closeLightbox(){
    const box=document.getElementById('ascend-library-art-lightbox');
    if(!box||box.classList.contains('hidden'))return false;
    box.classList.add('hidden');
    box.setAttribute('aria-hidden','true');
    document.body.classList.remove('art-lightbox-open');
    return true;
  }

  function openLightbox(art){
    if(!art)return;
    const style=getComputedStyle(art).backgroundImage||'';
    const match=style.match(/url\(["']?(.*?)["']?\)/i);
    if(!match?.[1])return;
    const card=art.closest('.content-card');
    const title=card?.querySelector('strong')?.textContent?.trim()||'ASCEND artwork';
    const box=ensureLightbox();
    const image=box.querySelector('img');
    const caption=box.querySelector('figcaption');
    if(image){image.src=match[1];image.alt=title}
    if(caption)caption.textContent=title;
    box.classList.remove('hidden');
    box.setAttribute('aria-hidden','false');
    document.body.classList.add('art-lightbox-open');
    box.querySelector('.ascend-art-lightbox-close')?.focus();
  }

  function prepareArt(art){
    if(!art||art.dataset.libraryArtBound==='1')return;
    art.dataset.libraryArtBound='1';
    art.setAttribute('role','button');
    art.setAttribute('tabindex','0');
    art.setAttribute('aria-label','View artwork full screen');
  }

  document.addEventListener('click',event=>{
    const art=event.target.closest?.('.content-card-art');
    if(!art)return;
    event.preventDefault();
    event.stopPropagation();
    openLightbox(art);
  },true);

  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&closeLightbox()){
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const art=event.target.closest?.('.content-card-art');
    if(!art||(event.key!=='Enter'&&event.key!==' '))return;
    event.preventDefault();
    event.stopPropagation();
    openLightbox(art);
  },true);

  document.addEventListener('backbutton',event=>{
    if(!closeLightbox())return;
    event.preventDefault?.();
    event.stopPropagation?.();
  },true);

  const observer=new MutationObserver(records=>{
    for(const record of records){
      for(const node of record.addedNodes){
        if(!(node instanceof Element))continue;
        if(node.matches?.('.content-card-art'))prepareArt(node);
        node.querySelectorAll?.('.content-card-art').forEach(prepareArt);
      }
    }
  });

  function startArtBinding(){
    document.querySelectorAll('.content-card-art').forEach(prepareArt);
    observer.observe(document.documentElement,{childList:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startArtBinding,{once:true});
  else startArtBinding();

  window.ASCENDContextualLibrary={render,closeArtLightbox:closeLightbox};
})();
