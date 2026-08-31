(()=>{
  function navTo(screen){document.querySelector(`.bottom-nav button[data-screen="${screen}"]`)?.click()}
  function greeting(){const h=new Date().getHours();return h<12?'Good morning':h<18?'Good afternoon':'Good evening'}
  function formattedDate(){return new Intl.DateTimeFormat(undefined,{weekday:'long',month:'long',day:'numeric'}).format(new Date())}
  function ensureLibraryReaderHead(){const overlay=document.getElementById('library-overlay'),body=document.getElementById('library-body');if(!overlay||!body||document.getElementById('library-title'))return;const head=document.createElement('div');head.className='library-reader-head';head.innerHTML='<div id="library-reader-type" class="eyebrow"></div><h1 id="library-title"></h1>';body.before(head)}
  function mount(){
    const today=document.getElementById('today');if(!today||document.getElementById('today-v3'))return;
    const shell=document.createElement('div');shell.id='today-v3';shell.className='today-v3';
    shell.innerHTML=`
      <header class="today-v3-intro">
        <div class="today-v3-greeting"><span aria-hidden="true">☼</span><div><strong>${greeting()}</strong><small>${formattedDate()}</small></div></div>
        <h1 id="today-v3-practice">Self-Contemplation</h1>
      </header>
      <section class="today-v3-hero" aria-label="Today's Self-Contemplation practice"><p>Morning Serenity | Find Inner Peace</p></section>
      <div class="today-v3-chips" aria-label="Practice options">
        <button type="button" class="today-v3-chip" data-chip="breathing"><strong>Breathing</strong><small>10 Min · Guided</small></button>
        <button type="button" class="today-v3-chip" data-chip="focus"><strong>Focus</strong><small>15 Min · Stillness</small></button>
        <button type="button" class="today-v3-chip" data-chip="calm"><strong>Evening Calm</strong><small>20 Min · Relax</small></button>
      </div>
      <section class="today-v3-action" aria-label="Begin today's practice"><div class="today-v3-medallion-slot" aria-hidden="true"></div></section>`;
    today.prepend(shell);
    const action=shell.querySelector('.today-v3-action');
    const portal=document.getElementById('ritual-portal'),slot=shell.querySelector('.today-v3-medallion-slot');
    if(portal&&slot){portal.classList.add('today-v3-medallion');const strong=portal.querySelector('.ritual-copy strong');if(strong)strong.textContent='Press and Hold to Begin';slot.replaceWith(portal)}

    const feedback=document.getElementById('ritual-feedback');
    if(feedback&&action){
      action.appendChild(feedback);
      feedback.style.cssText='display:block;margin:10px 0 0;text-align:center;font:11px/1.35 Arial,sans-serif;min-height:15px;opacity:.72';
    }

    const originalBegin=today.querySelector('[data-action="practice"]');
    if(originalBegin&&action&&!document.getElementById('today-v3-fallback')){
      const fallback=document.createElement('button');
      fallback.id='today-v3-fallback';fallback.type='button';fallback.textContent='Begin Practice';
      fallback.style.cssText='display:block;margin:8px auto 0;padding:7px 12px;border:0;background:transparent;color:inherit;font:600 11px/1.2 Arial,sans-serif;text-decoration:underline;text-underline-offset:3px;opacity:.7;cursor:pointer';
      fallback.addEventListener('click',()=>originalBegin.click());
      action.appendChild(fallback);
    }

    shell.querySelectorAll('.today-v3-chip').forEach(chip=>chip.addEventListener('click',()=>{if(chip.dataset.chip==='breathing')originalBegin?.click();else if(chip.dataset.chip==='focus')navTo('path');else navTo('library')}));
    ensureLibraryReaderHead();sync();
    const source=document.getElementById('stage-title');if(source)new MutationObserver(sync).observe(source,{childList:true,subtree:true,characterData:true});
    document.documentElement.classList.add('today-v3-ready');
  }
  function sync(){const practice=document.getElementById('stage-title')?.textContent?.trim();if(practice)document.getElementById('today-v3-practice').textContent=practice}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
  document.addEventListener('ascend:curriculum',sync);
  if(!document.querySelector('script[data-approved-screens]')){const script=document.createElement('script');script.src='approved-screens.js?v=20260830-supplied-1';script.dataset.approvedScreens='true';document.body.appendChild(script)}
})();