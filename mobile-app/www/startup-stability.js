(()=>{
  const splash=document.getElementById('splash');
  if(!splash)return;
  splash.classList.remove('is-hidden');
  splash.setAttribute('aria-hidden','false');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let hidden=false;
  function hide(){if(hidden)return;hidden=true;splash.classList.add('is-hidden');splash.setAttribute('aria-hidden','true')}
  // Startup stability owns only the splash. Navigation belongs to ASCENDUX.
  // Removing screen observers prevents async startup work from snapping tabs back.
  const minimum=reduced?150:900;
  const started=performance.now();
  const finish=()=>setTimeout(hide,Math.max(0,minimum-(performance.now()-started)));
  if(document.readyState==='complete')finish();else window.addEventListener('load',finish,{once:true});
  setTimeout(hide,reduced?1200:3200);
})();
