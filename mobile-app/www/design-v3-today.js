(()=>{
  /*
   * Reconstruction bridge only.
   * Today is owned by static index.html markup and the shared stylesheet system.
   * This bridge supplies only small compatibility authorities that are not yet
   * direct index scripts; it does not rebuild or move the Today screen.
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

  function loadScriptOnce(src,attribute){
    if(document.querySelector(`script[${attribute}]`))return;
    const script=document.createElement('script');
    script.src=src;
    script.setAttribute(attribute,'true');
    script.defer=true;
    document.body.appendChild(script);
  }

  function loadJournalAuthority(){
    loadScriptOnce('journal-sync-authority.js?v=20260902-reconstruction-2','data-journal-sync-authority');
  }

  function loadPracticeTimerAuthority(){
    loadScriptOnce('practice-timer-authority.js?v=20260902-reconstruction-1','data-practice-timer-authority');
  }

  async function refreshMirrorWhenReady(){
    try{
      const me=await window.PathBackend?.me?.();
      if(me)window.ASCENDMirror?.load?.('stage');
    }catch{}
  }

  function mount(){
    ensureLibraryReaderHead();
    loadJournalAuthority();
    loadPracticeTimerAuthority();
    document.querySelector('.bottom-nav button[data-screen="me"]')?.addEventListener('click',()=>{
      requestAnimationFrame(refreshMirrorWhenReady);
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
  else mount();
})();