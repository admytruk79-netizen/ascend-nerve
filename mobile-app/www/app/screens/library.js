export function initLibrary(){
  const screen=document.getElementById('library');if(!screen)return;
  const eyebrow=screen.querySelector(':scope>.eyebrow');
  const title=screen.querySelector(':scope>h1');
  if(eyebrow)eyebrow.textContent='FOR YOUR CURRENT MONTH';
  if(title)title.textContent='Library';
  screen.dataset.libraryOwner='master';
  document.addEventListener('ascend:screen',event=>{if(event.detail?.screen==='library')window.ASCENDContextualLibrary?.render?.()});
}
