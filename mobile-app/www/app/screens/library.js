function ensureReaderStructure(){
  const overlay=document.getElementById('library-overlay');
  const body=document.getElementById('library-body');
  if(!overlay||!body||document.getElementById('library-title'))return;
  const header=document.createElement('header');
  header.className='library-reader-header';
  header.innerHTML='<div id="library-reader-type" class="eyebrow">TEACHING</div><h1 id="library-title">Library</h1>';
  body.before(header);
}

export function initLibrary(){
  const screen=document.getElementById('library');if(!screen)return;
  const eyebrow=screen.querySelector(':scope>.eyebrow');
  const title=screen.querySelector(':scope>h1');
  if(eyebrow)eyebrow.textContent='FOR YOUR CURRENT MONTH';
  if(title)title.textContent='Library';
  screen.dataset.libraryOwner='master';
  ensureReaderStructure();
  document.addEventListener('ascend:screen',event=>{if(event.detail?.screen==='library')window.ASCENDContextualLibrary?.render?.()});
}
