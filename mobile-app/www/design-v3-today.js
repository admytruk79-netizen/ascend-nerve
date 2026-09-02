(()=>{
  /*
   * Reconstruction bridge only.
   * Today is owned by static index.html markup and the shared stylesheet system.
   * This bridge only supplies the Library reader header and the Journal save
   * authority that are not yet direct index scripts.
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

  function loadJournalAuthority(){
    if(document.querySelector('script[data-journal-sync-authority]'))return;
    const script=document.createElement('script');
    script.src='journal-sync-authority.js?v=20260902-reconstruction-2';
    script.setAttribute('data-journal-sync-authority','true');
    script.defer=true;
    document.body.appendChild(script);
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
    document.querySelector('.bottom-nav button[data-screen="me"]')?.addEventListener('click',()=>{
      requestAnimationFrame(refreshMirrorWhenReady);
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
  else mount();
})();