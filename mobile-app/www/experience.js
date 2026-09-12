(()=>{
  const splash=document.getElementById('splash');
  const SPLASH_MIN_MS=1600;
  const splashStartedAt=performance.now();
  let splashDismissed=false;

  function dismissSplash(){
    if(splashDismissed)return;
    splashDismissed=true;
    const remaining=Math.max(0,SPLASH_MIN_MS-(performance.now()-splashStartedAt));
    setTimeout(()=>{
      splash?.classList.add('is-hidden');
      splash?.setAttribute('aria-hidden','true');
    },remaining);
  }

  splash?.classList.remove('is-hidden');
  splash?.setAttribute('aria-hidden','false');
  if(document.readyState==='complete')dismissSplash();
  else window.addEventListener('load',dismissSplash,{once:true});
  setTimeout(dismissSplash,3200);

  // Overlay dismissal remains here for static/legacy surfaces only. The
  // reconstructed router owns opening Menu/About, and app/screens/library.js
  // owns Library card activation so each interaction is handled exactly once.
  const libraryOverlay=document.getElementById('library-overlay');
  const closeLibrary=()=>libraryOverlay?.classList.add('hidden');
  document.querySelector('.library-close')?.addEventListener('click',closeLibrary);
  libraryOverlay?.addEventListener('click',event=>{if(event.target===libraryOverlay)closeLibrary()});

  const aboutOverlay=document.getElementById('about-overlay');
  const closeAbout=()=>aboutOverlay?.classList.add('hidden');
  document.querySelector('.about-close')?.addEventListener('click',closeAbout);
  aboutOverlay?.addEventListener('click',event=>{if(event.target===aboutOverlay)closeAbout()});
})();
