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

  const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

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

  function buildJournalFrame(){
    const journal=document.getElementById('journal');
    if(!journal||journal.dataset.reconstructed==='1')return;
    journal.dataset.reconstructed='1';
    journal.classList.add('reconstructed-screen','reconstructed-journal');
    const eyebrow=journal.querySelector(':scope>.eyebrow');
    const title=journal.querySelector(':scope>h1');
    if(eyebrow)eyebrow.textContent='OBSERVATION SECOND';
    if(title)title.textContent='Journal';
    const intro=document.createElement('p');
    intro.className='recon-screen-copy';
    intro.textContent='Record what you actually observed. Interpretation can wait.';
    title?.after(intro);
    const form=document.getElementById('journal-form');
    form?.classList.add('recon-journal-form');
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

  function mount(){
    buildTodayFrame();
    buildPathFrame();
    buildJournalFrame();
    buildLibraryFrame();
    buildMeFrame();
    ensureLibraryReaderHead();
    canonicalizeToday();
    document.querySelector('.bottom-nav button[data-screen="me"]')?.addEventListener('click',()=>requestAnimationFrame(refreshMirrorWhenReady));
  }

  document.addEventListener('ascend:month',event=>canonicalizeToday(event.detail));
  document.addEventListener('ascend:curriculum',()=>canonicalizeToday());
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
  else mount();
})();