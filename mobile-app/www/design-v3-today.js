(()=>{
  function loadScriptOnce(src,attribute){
    if(document.querySelector(`script[${attribute}]`))return;
    const script=document.createElement('script');
    script.src=src;
    script.setAttribute(attribute,'true');
    document.body.appendChild(script);
  }

  loadScriptOnce('journal-sync-authority.js?v=20260902-reconstruction-2','data-journal-sync-authority');
  loadScriptOnce('practice-timer-authority.js?v=20260902-reconstruction-1','data-practice-timer-authority');

  const REFLECTION_ART=[
    {src:'assets/seasonal-art/march-what-am-i-noticing.png',label:'What am I noticing?'},
    {src:'assets/seasonal-art/where-does-will-begin.png',label:'Where does will begin?'},
    {src:'assets/seasonal-art/truth-vs-imagination.png',label:'Truth vs imagination'},
    {src:'assets/seasonal-art/what-am-i-refusing.png',label:'What am I refusing?'},
    {src:'assets/seasonal-art/discipline-or-freedom.png',label:'Discipline or freedom?'}
  ];

  function canonicalMonth(month=1){
    const list=window.ASCENDProgression?.MONTHS||[];
    return list[Math.max(0,Math.min(23,Number(month||1)-1))]||{month:1,title:'Orientation to the Path'};
  }

  function buildTodayFrame(){
    const today=document.getElementById('today');
    if(!today||today.dataset.reconstructed==='1')return;
    today.dataset.reconstructed='1';
    today.classList.add('reconstructed-screen','reconstructed-today');

    const context=today.querySelector('.ritual-context');
    const scene=today.querySelector('.ritual-scene');
    const feedback=document.getElementById('ritual-feedback');
    const begin=today.querySelector('[data-action="practice"]');
    const journey=today.querySelector('.journey-rail');
    const journal=today.querySelector('[data-go-journal]');
    if(!context||!scene||!feedback||!begin||!journey||!journal)return;

    let hero=today.querySelector('.recon-today-hero');
    if(!hero){
      hero=document.createElement('section');
      hero.className='recon-today-hero';
      const label=document.createElement('div');
      label.className='recon-kicker';
      label.textContent='CORE FORMATION · TODAY';
      hero.append(label,context,scene,feedback);
      today.insertBefore(hero,begin);
    }

    begin.textContent='Open Practice Briefing';
    begin.classList.add('recon-primary-action');
    journal.classList.add('recon-journal-action');
    journey.classList.add('recon-journey');
  }

  function buildPathFrame(){
    const path=document.getElementById('path');
    if(!path||path.dataset.reconstructed==='1')return;
    path.dataset.reconstructed='1';
    path.classList.add('reconstructed-screen','reconstructed-path');
    const eyebrow=path.querySelector(':scope>.eyebrow');
    const title=path.querySelector(':scope>h1');
    const copy=path.querySelector(':scope>.path-summary-copy');
    if(eyebrow)eyebrow.textContent='CORE FORMATION · 24 MONTHS';
    if(title)title.textContent='The Path';
    if(copy)copy.textContent='Six developmental phases unfold through practice, observation, reflection, integration and readiness.';
    const branches=path.querySelector('.pathway-section-header');
    if(branches){
      branches.classList.add('recon-section-divider');
      const strong=branches.querySelector('strong');
      const span=branches.querySelector('span');
      if(strong)strong.textContent='Practice Branches';
      if(span)span.textContent='Independent from Core Formation progression';
    }
  }

  function buildReflectionGallery(journal,title){
    if(document.getElementById('reflection-art'))return;
    const gallery=document.createElement('section');
    gallery.id='reflection-art';
    gallery.className='recon-reflection-art';
    gallery.setAttribute('aria-label','Reflection artwork');
    gallery.innerHTML=`
      <div class="recon-reflection-hero">
        <img id="reflection-art-image" src="${REFLECTION_ART[0].src}" alt=""/>
        <div class="recon-reflection-caption"><small>REFLECTION IMAGE</small><strong id="reflection-art-label">${REFLECTION_ART[0].label}</strong></div>
      </div>
      <div class="recon-reflection-choices" role="list" aria-label="Choose a reflection image">
        ${REFLECTION_ART.map((item,index)=>`<button type="button" class="recon-reflection-choice${index===0?' active':''}" data-reflection-index="${index}" aria-label="${item.label}"><img src="${item.src}" alt=""/></button>`).join('')}
      </div>`;
    title?.nextElementSibling?.after(gallery);
  }

  function simplifyJournalForm(){
    const form=document.getElementById('journal-form');
    if(!form||form.dataset.reconstructed==='1')return;
    form.dataset.reconstructed='1';
    form.classList.add('recon-journal-form');

    const interpretation=form.querySelector('textarea[name="interpretation"]')?.closest('label');
    const unresolved=form.querySelector('textarea[name="unresolved"]')?.closest('label');
    const share=form.querySelector('.journal-share-teacher');
    const save=form.querySelector('button.primary,button[type="submit"]');
    if((interpretation||unresolved||share)&&save){
      const details=document.createElement('details');
      details.className='recon-deeper-reflection';
      details.innerHTML='<summary>Deeper reflection <span>Interpretation, unresolved material, teacher sharing</span></summary>';
      if(interpretation)details.appendChild(interpretation);
      if(unresolved)details.appendChild(unresolved);
      if(share)details.appendChild(share);
      form.insertBefore(details,save);
    }
  }

  function buildJournalFrame(){
    const journal=document.getElementById('journal');
    if(!journal||journal.dataset.reconstructed==='1')return;
    journal.dataset.reconstructed='1';
    journal.classList.add('reconstructed-screen','reconstructed-journal');
    const eyebrow=journal.querySelector(':scope>.eyebrow');
    const title=journal.querySelector(':scope>h1');
    if(eyebrow)eyebrow.textContent='OBSERVE · REFLECT · INTEGRATE';
    if(title)title.textContent='Journal';
    const intro=document.createElement('p');
    intro.className='recon-screen-copy';
    intro.textContent='Record what you actually observed. Interpretation can wait.';
    title?.after(intro);
    buildReflectionGallery(journal,title);
    simplifyJournalForm();
  }

  function buildLibraryFrame(){
    const library=document.getElementById('library');
    if(!library||library.dataset.reconstructed==='1')return;
    library.dataset.reconstructed='1';
    library.classList.add('reconstructed-screen','reconstructed-library');
    const eyebrow=library.querySelector(':scope>.eyebrow');
    const title=library.querySelector(':scope>h1');
    if(eyebrow)eyebrow.textContent='CONTEXT FOR YOUR CURRENT PRACTICE';
    if(title)title.textContent='Library';
    const intro=document.createElement('p');
    intro.className='recon-screen-copy';
    intro.textContent='Teachings and references support the month you are living now; they do not advance the Path.';
    title?.after(intro);
  }

  function buildMeFrame(){
    const me=document.getElementById('me');
    if(!me||me.dataset.reconstructed==='1')return;
    me.dataset.reconstructed='1';
    me.classList.add('reconstructed-screen','reconstructed-me');
    const eyebrow=me.querySelector(':scope>.eyebrow');
    const title=me.querySelector(':scope>h1');
    if(eyebrow)eyebrow.textContent='PRACTICE · ACCESS · RESONANCE';
    if(title)title.textContent='My ASCEND';
    const cards=[...me.querySelectorAll(':scope>.rhythm-card')];
    cards.forEach(card=>card.classList.add('recon-profile-card'));
    const mirror=cards.find(card=>card.querySelector('#mirror-content'));
    if(mirror){
      const h2=mirror.querySelector('h2');
      if(h2)h2.textContent='Resonance';
      const button=mirror.querySelector('#refresh-mirror');
      if(button)button.textContent='Refresh Resonance';
    }
  }

  function canonicalizeToday(detail){
    const month=Math.max(1,Math.min(24,Number(detail?.month)||Number(window.curriculum?.progress?.month)||1));
    const item=canonicalMonth(month);
    const title=document.getElementById('stage-title');
    const eyebrow=document.getElementById('stage-eyebrow');
    const portal=document.getElementById('ritual-portal');
    const monthLabel=document.getElementById('today-month-label');
    if(title)title.textContent=item.title||'Orientation to the Path';
    if(eyebrow)eyebrow.textContent=`CORE FORMATION · MONTH ${month}`;
    if(portal)portal.setAttribute('aria-label',`Press and hold for two seconds to begin ${item.title||'practice'}`);
    if(monthLabel)monthLabel.textContent=`Month ${month} of 24`;
  }

  function ensureLibraryReaderHead(){
    const overlay=document.getElementById('library-overlay');
    const body=document.getElementById('library-body');
    if(!overlay||!body||document.getElementById('library-reader-head'))return;
    const head=document.createElement('header');
    head.id='library-reader-head';
    head.className='library-reader-head';
    head.innerHTML='<div id="library-reader-type" class="reader-meta">TEACHING</div><h1 id="library-title">Library</h1><div class="reader-rule" aria-hidden="true"><i></i></div>';
    body.before(head);
  }

  async function refreshMirrorWhenReady(){
    try{
      const me=await window.PathBackend?.me?.();
      if(me)window.ASCENDMirror?.load?.('stage');
    }catch{}
  }

  function bindReflectionArt(){
    document.addEventListener('click',event=>{
      const choice=event.target.closest?.('[data-reflection-index]');
      if(!choice)return;
      const item=REFLECTION_ART[Number(choice.dataset.reflectionIndex)];
      if(!item)return;
      const image=document.getElementById('reflection-art-image');
      const label=document.getElementById('reflection-art-label');
      if(image)image.src=item.src;
      if(label)label.textContent=item.label;
      document.querySelectorAll('[data-reflection-index]').forEach(button=>button.classList.toggle('active',button===choice));
    });
  }

  function mount(){
    buildTodayFrame();
    buildPathFrame();
    buildJournalFrame();
    buildLibraryFrame();
    buildMeFrame();
    ensureLibraryReaderHead();
    canonicalizeToday();
    bindReflectionArt();
    document.querySelector('.bottom-nav button[data-screen="me"]')?.addEventListener('click',()=>requestAnimationFrame(refreshMirrorWhenReady));
  }

  document.addEventListener('ascend:month',event=>canonicalizeToday(event.detail));
  document.addEventListener('ascend:curriculum',()=>canonicalizeToday());
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
  else mount();
})();