export function initPath(){
  const screen=document.getElementById('path');
  if(!screen)return;
  const eyebrow=screen.querySelector(':scope>.eyebrow');
  const title=screen.querySelector(':scope>h1');
  const copy=screen.querySelector(':scope>.path-summary-copy');
  if(eyebrow)eyebrow.textContent='SCHOOL · PHASE I';
  if(title)title.textContent='The Path';
  if(copy)copy.textContent='Core Formation unfolds through six phases, 24 months and six readiness gates. Practice Branches and Phase II remain separate.';
  const branches=screen.querySelector('.pathway-section-header');
  if(branches){
    branches.querySelector('strong')?.replaceChildren(document.createTextNode('Practice Branches'));
    branches.querySelector('span')?.replaceChildren(document.createTextNode('Independent progression · does not advance Core Formation'));
  }
  window.ASCENDMonthPath?.paint?.({fresh:true});
  document.addEventListener('ascend:screen',event=>{if(event.detail?.screen==='path')window.ASCENDMonthPath?.paint?.({fresh:true})});
}
