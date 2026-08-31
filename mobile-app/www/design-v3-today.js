(()=>{
  function ensureLibraryReaderHead(){const overlay=document.getElementById('library-overlay'),body=document.getElementById('library-body');if(!overlay||!body||document.getElementById('library-title'))return;const head=document.createElement('div');head.className='library-reader-head';head.innerHTML='<div id="library-reader-type" class="eyebrow"></div><h1 id="library-title"></h1>';body.before(head)}
  function mount(){
    const today=document.getElementById('today');if(!today||document.getElementById('today-v3'))return;
    const shell=document.createElement('div');shell.id='today-v3';shell.className='today-v3';
    shell.innerHTML=`<section class="today-v3-hero" aria-label="Today's Self-Contemplation"><h1 id="today-v3-practice">Self-Contemplation</h1><p>Morning Serenity | Find Inner Peace</p></section><section class="today-v3-card today-v3-action"><div class="today-v3-copy"><div class="today-v3-eyebrow">TODAY</div><h2>Self-Contemplation</h2><p>Begin when you are ready.</p><button type="button" id="today-v3-begin" class="today-v3-primary">Begin Practice</button></div><div class="today-v3-chips" aria-label="Practice options"><div class="today-v3-chip">Breathing<small>10 Min · Guided</small></div><div class="today-v3-chip">Focus<small>15 Min · Stillness</small></div><div class="today-v3-chip">Evening Calm<small>20 Min · Relax</small></div></div><div class="today-v3-medallion-slot" aria-hidden="true"></div></section>`;
    today.prepend(shell);
    const portal=document.getElementById('ritual-portal'),slot=shell.querySelector('.today-v3-medallion-slot');
    if(portal&&slot){portal.classList.add('today-v3-medallion');slot.replaceWith(portal)}
    ensureLibraryReaderHead();sync();
    const source=document.getElementById('stage-title');if(source)new MutationObserver(sync).observe(source,{childList:true,subtree:true,characterData:true});
    document.documentElement.classList.add('today-v3-ready');
  }
  function sync(){const practice=document.getElementById('stage-title')?.textContent?.trim();if(practice)document.getElementById('today-v3-practice').textContent=practice}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
  document.addEventListener('ascend:curriculum',sync);
  if(!document.querySelector('script[data-approved-screens]')){const script=document.createElement('script');script.src='approved-screens.js?v=20260830-supplied-1';script.dataset.approvedScreens='true';document.body.appendChild(script)}
})();
