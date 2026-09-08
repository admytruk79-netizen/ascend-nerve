(()=>{
  if(window.__ASCEND_MASTER_BOOTSTRAP__)return;
  window.__ASCEND_MASTER_BOOTSTRAP__=true;
  document.body?.classList.add('ascend-master-loading');
  document.documentElement.dataset.ascendMasterReady='0';

  function backgroundImageUrl(node){
    if(!node)return'';
    const value=getComputedStyle(node).backgroundImage||node.style?.backgroundImage||'';
    const match=value.match(/url\(["']?(.*?)["']?\)/i);
    return match?.[1]||'';
  }

  function installReflectionLightbox(){
    if(window.__ASCEND_REFLECTION_LIGHTBOX__)return;
    window.__ASCEND_REFLECTION_LIGHTBOX__=true;

    const overlay=document.createElement('div');
    overlay.id='ascend-art-lightbox';
    overlay.className='ascend-art-lightbox hidden';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-label','ASCEND artwork');
    overlay.innerHTML='<button type="button" class="ascend-art-lightbox-close" aria-label="Close artwork">×</button><figure><img alt=""/><figcaption></figcaption></figure>';
    document.body.appendChild(overlay);

    const close=()=>{
      overlay.classList.add('hidden');
      document.body.classList.remove('art-lightbox-open');
    };
    const openSrc=(src,label='')=>{
      if(!src)return;
      const target=overlay.querySelector('img');
      const caption=overlay.querySelector('figcaption');
      target.src=src;
      target.alt=label||'ASCEND artwork';
      caption.textContent=label||'';
      caption.hidden=!caption.textContent;
      overlay.classList.remove('hidden');
      document.body.classList.add('art-lightbox-open');
      overlay.querySelector('.ascend-art-lightbox-close')?.focus();
    };
    const openImage=(image,label='')=>openSrc(image?.src||'',label||image?.alt||'');

    overlay.querySelector('.ascend-art-lightbox-close')?.addEventListener('click',close);
    overlay.addEventListener('click',event=>{if(event.target===overlay)close()});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!overlay.classList.contains('hidden'))close()});
    document.addEventListener('click',event=>{
      const journalHero=event.target.closest?.('.ascend-reflection-hero');
      if(journalHero&&document.getElementById('journal')?.contains(journalHero)){
        event.preventDefault();
        event.stopPropagation();
        openImage(journalHero.querySelector('img'),journalHero.querySelector('strong')?.textContent?.trim());
        return;
      }

      // Only the art already inside an opened Library reader expands
      // fullscreen. Intercepting .content-card-art too would capture the
      // click before the list card's own listener ever runs (Library cards
      // bind the whole article, art thumbnail included, to open the reader),
      // so tapping a card's art thumbnail would silently skip opening the
      // reader at all instead of showing the fullscreen art from within it.
      const libraryArt=event.target.closest?.('.library-reader-art');
      if(!libraryArt)return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const label=document.getElementById('library-title')?.textContent?.trim()||'ASCEND artwork';
      openSrc(backgroundImageUrl(libraryArt),label);
    },true);
  }

  function formatBriefingCopy(){
    const node=document.getElementById('briefing-intention');
    if(!node||node.querySelector('.briefing-steps'))return;
    const raw=node.textContent?.trim();
    if(!raw)return;
    const labelPattern=/(Orientation|Preparation|Practice|Quiet observation|Completion):\s*/gi;
    const matches=[...raw.matchAll(labelPattern)];
    if(matches.length<3)return;

    const values={};
    matches.forEach((match,index)=>{
      const start=(match.index||0)+match[0].length;
      const end=index+1<matches.length?matches[index+1].index:raw.length;
      values[match[1].toLowerCase()]=raw.slice(start,end).trim();
    });

    const groups=[
      ['Purpose',values.orientation],
      ['Prepare',values.preparation],
      ['Practice',values.practice],
      ['Afterward',[values['quiet observation'],values.completion].filter(Boolean).join(' ')]
    ].filter(([,text])=>text);
    if(!groups.length)return;

    const wrap=document.createElement('div');
    wrap.className='briefing-steps';
    groups.forEach(([heading,text])=>{
      const section=document.createElement('section');
      const title=document.createElement('strong');
      const paragraph=document.createElement('p');
      title.textContent=heading;
      paragraph.textContent=text;
      section.append(title,paragraph);
      wrap.append(section);
    });
    node.replaceChildren(wrap);
  }

  function installBriefingFormatter(){
    const node=document.getElementById('briefing-intention');
    if(!node)return;
    formatBriefingCopy();
    const observer=new MutationObserver(()=>queueMicrotask(formatBriefingCopy));
    observer.observe(node,{childList:true,subtree:true,characterData:true});
  }

  function installPresentationFixes(){
    installReflectionLightbox();
    installBriefingFormatter();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installPresentationFixes,{once:true});
  else installPresentationFixes();

  import('./app/bootstrap.js?v=20260908-master-ready-3').catch(error=>{
    console.error('ASCEND master bootstrap failed',error);
    document.body?.classList.remove('ascend-master-loading');
    document.documentElement.dataset.ascendMasterReady='error';
    window.__ASCEND_MASTER_BOOTSTRAP__=false;
  });
})();
