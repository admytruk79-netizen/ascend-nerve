(()=>{
  if(window.__ASCEND_MASTER_BOOTSTRAP__)return;
  window.__ASCEND_MASTER_BOOTSTRAP__=true;
  document.body?.classList.add('ascend-master-loading');
  document.documentElement.dataset.ascendMasterReady='0';

  function installReflectionLightbox(){
    if(window.__ASCEND_REFLECTION_LIGHTBOX__)return;
    window.__ASCEND_REFLECTION_LIGHTBOX__=true;

    const overlay=document.createElement('div');
    overlay.id='ascend-art-lightbox';
    overlay.className='ascend-art-lightbox hidden';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-label','Reflection artwork');
    overlay.innerHTML='<button type="button" class="ascend-art-lightbox-close" aria-label="Close artwork">×</button><figure><img alt=""/><figcaption></figcaption></figure>';
    document.body.appendChild(overlay);

    const close=()=>{
      overlay.classList.add('hidden');
      document.body.classList.remove('art-lightbox-open');
    };
    const open=(image,label='')=>{
      if(!image?.src)return;
      const target=overlay.querySelector('img');
      const caption=overlay.querySelector('figcaption');
      target.src=image.src;
      target.alt=image.alt||label||'Reflection artwork';
      caption.textContent=label||document.getElementById('reflection-art-label')?.textContent?.trim()||'';
      caption.hidden=!caption.textContent;
      overlay.classList.remove('hidden');
      document.body.classList.add('art-lightbox-open');
      overlay.querySelector('.ascend-art-lightbox-close')?.focus();
    };

    overlay.querySelector('.ascend-art-lightbox-close')?.addEventListener('click',close);
    overlay.addEventListener('click',event=>{if(event.target===overlay)close()});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!overlay.classList.contains('hidden'))close()});
    document.addEventListener('click',event=>{
      const hero=event.target.closest?.('.ascend-reflection-hero');
      if(!hero||!document.getElementById('journal')?.contains(hero))return;
      event.preventDefault();
      event.stopPropagation();
      open(hero.querySelector('img'),hero.querySelector('strong')?.textContent?.trim());
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

  import('./app/bootstrap.js?v=20260908-master-ready-2').catch(error=>{
    console.error('ASCEND master bootstrap failed',error);
    document.body?.classList.remove('ascend-master-loading');
    document.documentElement.dataset.ascendMasterReady='error';
    window.__ASCEND_MASTER_BOOTSTRAP__=false;
  });
})();
