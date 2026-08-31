(()=>{
  function navTo(screen){document.querySelector(`.bottom-nav button[data-screen="${screen}"]`)?.click()}
  function greeting(){const h=new Date().getHours();return h<12?'Good morning.':h<18?'Good afternoon.':'Good evening.'}
  function ensureLibraryReaderHead(){
    const overlay=document.getElementById('library-overlay');
    const body=document.getElementById('library-body');
    if(!overlay||!body||document.getElementById('library-title'))return;
    const head=document.createElement('div');
    head.className='library-reader-head';
    head.innerHTML='<div id="library-reader-type" class="eyebrow"></div><h1 id="library-title"></h1>';
    body.before(head);
  }
  function mount(){
    const today=document.getElementById('today');
    if(!today||document.getElementById('today-v3'))return;
    const shell=document.createElement('div');
    shell.id='today-v3';
    shell.className='today-v3';
    shell.innerHTML=`
      <section class="today-v3-hero" aria-label="ASCEND Path Today">
        <div class="today-v3-logo"><img src="assets/ascend-logo.png" alt="ASCEND Path"></div>
        <h1 id="today-v3-greeting">${greeting()}</h1>
        <p>Keep your ascent steady.</p>
      </section>
      <section class="today-v3-card today-v3-action">
        <div class="today-v3-copy">
          <div class="today-v3-eyebrow">TODAY'S ACTION</div>
          <h2 id="today-v3-practice">Today's Practice</h2>
          <p id="today-v3-practice-note">One clear practice. Begin when you are ready.</p>
          <button type="button" id="today-v3-begin" class="today-v3-primary">Begin Practice</button>
        </div>
        <div class="today-v3-medallion-slot" aria-hidden="true"></div>
      </section>
      <section class="today-v3-card today-v3-path">
        <div class="today-v3-eyebrow">YOUR PATH</div>
        <h2 id="today-v3-stage">Current Stage</h2>
        <p>You are on the Path.</p>
        <div class="today-v3-progress" aria-hidden="true"><i id="today-v3-progress-fill"></i></div>
        <button type="button" id="today-v3-path">View Path <span>›</span></button>
      </section>
      <section class="today-v3-card today-v3-journal">
        <div class="today-v3-eyebrow">JOURNAL PROMPT</div>
        <div class="today-v3-prompt"><span class="today-v3-quote">“</span><h2>What did you actually observe today?</h2></div>
        <button type="button" id="today-v3-journal">Open Journal <span>›</span></button>
      </section>
      <section class="today-v3-card today-v3-seasonal">
        <div class="today-v3-eyebrow">SEASONAL LIBRARY</div>
        <h2>Autumn Collection</h2>
        <p>Explore practices for this season.</p>
        <button type="button" id="today-v3-library" aria-label="Open seasonal collection">›</button>
      </section>`;
    today.prepend(shell);

    const portal=document.getElementById('ritual-portal');
    const slot=shell.querySelector('.today-v3-medallion-slot');
    if(portal&&slot){
      portal.classList.add('today-v3-medallion');
      slot.replaceWith(portal);
    }

    document.getElementById('today-v3-begin')?.addEventListener('click',()=>window.ASCENDOpenPractice?.()||document.querySelector('[data-action="practice"]')?.click());
    document.getElementById('today-v3-path')?.addEventListener('click',()=>navTo('path'));
    document.getElementById('today-v3-journal')?.addEventListener('click',()=>navTo('journal'));
    document.getElementById('today-v3-library')?.addEventListener('click',()=>navTo('library'));
    ensureLibraryReaderHead();
    sync();
    const source=document.getElementById('stage-title');
    if(source)new MutationObserver(sync).observe(source,{childList:true,subtree:true,characterData:true});
    document.documentElement.classList.add('today-v3-ready');
  }
  function sync(){
    const practice=document.getElementById('stage-title')?.textContent?.trim();
    const stage=document.getElementById('profile-stage')?.textContent?.trim();
    const day=document.getElementById('stage-day')?.textContent?.trim();
    if(practice)document.getElementById('today-v3-practice').textContent=practice;
    if(stage)document.getElementById('today-v3-stage').textContent=stage;
    if(day)document.getElementById('today-v3-practice-note').textContent=`${day} · Begin when you are ready.`;
    const days=parseInt(document.getElementById('practice-days')?.textContent||'0',10)||0;
    const req=parseInt((document.getElementById('stage-requirement')?.textContent||'28').match(/\d+/)?.[0]||'28',10)||28;
    const pct=Math.max(0,Math.min(100,Math.round(days/req*100)));
    const fill=document.getElementById('today-v3-progress-fill');if(fill)fill.style.width=`${pct}%`;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
  document.addEventListener('ascend:curriculum',sync);

  if(!document.querySelector('script[data-approved-screens]')){
    const script=document.createElement('script');
    script.src='approved-screens.js?v=20260830-supplied-1';
    script.dataset.approvedScreens='true';
    document.body.appendChild(script);
  }
})();
