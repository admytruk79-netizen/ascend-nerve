(()=>{
  /*
   * Reconstruction bridge only.
   * Today is now owned by the static markup in index.html and the shared
   * stylesheet system. This file no longer creates a second Today screen,
   * moves the ritual portal, injects layout CSS, or rewrites other screens.
   */

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

  function loadOnce(src,attribute){
    if(document.querySelector(`script[${attribute}]`))return;
    const script=document.createElement('script');
    script.src=src;
    script.setAttribute(attribute,'true');
    script.defer=true;
    document.body.appendChild(script);
  }

  function mount(){
    ensureLibraryReaderHead();
    loadOnce('mirror-engine.js?v=20260902-reconstruction-1','data-resonance-engine');
    loadOnce('journal-sync-authority.js?v=20260902-reconstruction-1','data-journal-sync-authority');

    document.querySelector('.bottom-nav button[data-screen="me"]')?.addEventListener('click',()=>{
      requestAnimationFrame(()=>window.ASCENDMirror?.load?.('stage'));
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
  else mount();
})();
