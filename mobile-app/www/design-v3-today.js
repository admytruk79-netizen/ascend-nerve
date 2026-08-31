(()=>{
  function navTo(screen){document.querySelector(`.bottom-nav button[data-screen="${screen}"]`)?.click()}
  function greeting(){const h=new Date().getHours();return h<12?'Good morning':h<18?'Good afternoon':'Good evening'}
  function formattedDate(){return new Intl.DateTimeFormat(undefined,{weekday:'long',month:'long',day:'numeric'}).format(new Date())}
  function cleanPracticeTitle(raw=''){
    const text=String(raw||'').trim();
    if(!text)return'Self-Contemplation';
    if(/^self[-\s]?contemplation/i.test(text))return'Self-Contemplation';
    const first=text.split(/\s+[·|—–]\s+|\s+at\s+the\s+|\s+at\s+|\s+of\s+the\s+/i)[0]?.trim();
    return(first||text).slice(0,42);
  }
  function ensureLibraryReaderHead(){
    const overlay=document.getElementById('library-overlay'),body=document.getElementById('library-body');
    if(!overlay||!body)return;
    let head=document.getElementById('library-reader-head');
    if(!head){
      head=document.createElement('header');head.id='library-reader-head';head.className='library-reader-head';
      head.innerHTML='<div id="library-reader-type" class="reader-meta">TEACHING</div><h1 id="library-title">Observation Before Interpretation</h1><div class="reader-rule" aria-hidden="true"><i></i></div>';
      body.before(head);
    }
  }
  function ensureMirrorEngine(){
    if(window.ASCENDMirror||document.querySelector('script[data-resonance-engine]'))return;
    const script=document.createElement('script');script.src='mirror-engine.js?v=20260831-resonance-2';script.dataset.resonanceEngine='true';document.body.appendChild(script);
  }
  function tuneApprovedScreens(){
    const pathHero=document.querySelector('#path>.approved-hero');
    if(pathHero){pathHero.classList.add('approved-journey-head');const h=pathHero.querySelector('h1'),p=pathHero.querySelector('p'),k=pathHero.querySelector('.approved-kicker');if(h)h.textContent='MY JOURNEY';if(p)p.textContent='Tracking Your Personal Growth';if(k)k.textContent='THE PRACTICE PATH'}
    const libraryHero=document.querySelector('#library>.approved-hero');
    if(libraryHero){libraryHero.classList.add('approved-library-head');const h=libraryHero.querySelector('h1'),p=libraryHero.querySelector('p'),k=libraryHero.querySelector('.approved-kicker');if(h)h.textContent='LIBRARY OVERVIEW';if(p)p.textContent='Texts, teachings and practices for the stage you are living.';if(k)k.textContent='ASCEND PATH'}
    const meHero=document.querySelector('#me>.approved-hero');
    if(meHero){meHero.classList.add('approved-me-head')}
    const mirrorCard=document.querySelector('#me .rhythm-card:has(#mirror-content)');
    const mirrorHeading=mirrorCard?.querySelector('h2');if(mirrorHeading)mirrorHeading.textContent='Mirror · Resonance';
  }
  function installLayoutGuard(){
    if(document.getElementById('today-v4-layout-guard'))return;
    const style=document.createElement('style');style.id='today-v4-layout-guard';
    style.textContent=`
      #today.today-ritual-screen:not(.active){display:none!important}
      #today.today-ritual-screen.active{display:block!important;grid-template-columns:none!important}
      #today.today-ritual-screen>.ritual-context,
      #today.today-ritual-screen>.ritual-scene,
      #today.today-ritual-screen>.ritual-begin,
      #today.today-ritual-screen>.journey-rail,
      #today.today-ritual-screen>.journal-handoff,
      #today.today-ritual-screen>.rhythm-card,
      #today.today-ritual-screen>.quiet-note{display:none!important}
      #today.today-ritual-screen>#ritual-feedback{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0 0 0 0)!important;white-space:nowrap!important;border:0!important}
      #today .today-v3-action{display:flex!important;width:100%!important;align-items:center!important;justify-content:center!important}
      #today #ritual-portal.today-v3-medallion{position:relative!important;left:auto!important;right:auto!important;top:auto!important;margin:0 auto!important;transform:none!important;flex:0 0 auto!important}
    `;
    document.head.appendChild(style);
  }
  function mount(){
    const today=document.getElementById('today');if(!today||document.getElementById('today-v3'))return;
    installLayoutGuard();ensureMirrorEngine();ensureLibraryReaderHead();
    const shell=document.createElement('div');shell.id='today-v3';shell.className='today-v3';
    shell.innerHTML=`
      <header class="today-v3-intro">
        <div class="today-v3-greeting"><span aria-hidden="true">☼</span><div><strong>${greeting()}</strong><small>${formattedDate()}</small></div></div>
        <h1 id="today-v3-practice">Self-Contemplation</h1>
      </header>
      <section class="today-v3-hero" aria-label="Today's Self-Contemplation practice"></section>
      <p class="today-v3-caption">Morning Serenity <span aria-hidden="true">|</span> Find Inner Peace</p>
      <div class="today-v3-chips" aria-label="Practice options">
        <button type="button" class="today-v3-chip" data-chip="breathing"><span class="chip-mark" aria-hidden="true">◌</span><span><strong>Breathing</strong><small>10 Min · Guided</small></span></button>
        <button type="button" class="today-v3-chip" data-chip="focus"><span class="chip-mark" aria-hidden="true">◇</span><span><strong>Focus</strong><small>15 Min · Stillness</small></span></button>
        <button type="button" class="today-v3-chip" data-chip="calm"><span class="chip-mark" aria-hidden="true">☾</span><span><strong>Evening Calm</strong><small>20 Min · Relax</small></span></button>
      </div>
      <section class="today-v3-action" aria-label="Begin today's practice"><div class="today-v3-medallion-slot" aria-hidden="true"></div></section>`;
    today.prepend(shell);
    const portal=document.getElementById('ritual-portal'),slot=shell.querySelector('.today-v3-medallion-slot');
    if(portal&&slot){portal.classList.add('today-v3-medallion');const strong=portal.querySelector('.ritual-copy strong');if(strong)strong.textContent='Press and Hold to Begin';slot.replaceWith(portal)}
    const originalBegin=today.querySelector('[data-action="practice"]');
    shell.querySelectorAll('.today-v3-chip').forEach(chip=>chip.addEventListener('click',()=>{
      if(chip.dataset.chip==='breathing')originalBegin?.click();
      else if(chip.dataset.chip==='focus')navTo('path');
      else navTo('library');
    }));
    document.querySelector('.bottom-nav button[data-screen="me"]')?.addEventListener('click',()=>setTimeout(()=>window.ASCENDMirror?.load?.('stage'),250));
    sync();tuneApprovedScreens();
    const source=document.getElementById('stage-title');if(source)new MutationObserver(sync).observe(source,{childList:true,subtree:true,characterData:true});
    document.documentElement.classList.add('today-v4-ready');
  }
  function sync(){const raw=document.getElementById('stage-title')?.textContent?.trim();const title=document.getElementById('today-v3-practice');if(title)title.textContent=cleanPracticeTitle(raw)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
  document.addEventListener('ascend:curriculum',()=>{sync();setTimeout(tuneApprovedScreens,0)});
  setTimeout(tuneApprovedScreens,700);
  if(!document.querySelector('script[data-approved-screens]')){const script=document.createElement('script');script.src='approved-screens.js?v=20260831-supplied-2';script.dataset.approvedScreens='true';script.onload=()=>setTimeout(tuneApprovedScreens,0);document.body.appendChild(script)}
})();