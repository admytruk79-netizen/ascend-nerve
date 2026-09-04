import {Auth} from '../data/auth.js';

let resonanceBound=false;

async function refreshResonance(){
  try{
    const me=await Auth.me();
    if(!me)return;
    await window.ASCENDMirror?.load?.('stage');
  }catch{}
}

function bindResonance(screen){
  const button=screen.querySelector('#refresh-mirror');
  if(!button||resonanceBound)return;
  resonanceBound=true;
  button.dataset.resonanceOwner='me';
  button.textContent='Refresh Resonance';
  button.addEventListener('click',async()=>{
    button.disabled=true;
    try{await refreshResonance()}finally{button.disabled=false}
  });
}

function applyHierarchy(screen){
  const eyebrow=screen.querySelector(':scope>.eyebrow');
  const title=screen.querySelector(':scope>h1');
  if(eyebrow)eyebrow.textContent='FORMATION · RHYTHM · RESONANCE';
  if(title)title.textContent='My ASCEND';

  const cards=[...screen.querySelectorAll(':scope>.rhythm-card')];
  const formation=cards.find(card=>card.querySelector('#profile-stage'));
  if(formation){
    formation.dataset.role='formation';
    const h2=formation.querySelector('h2');if(h2)h2.textContent='Current Formation';
    const practiceDays=formation.querySelector('#profile-days')?.closest('p');
    if(practiceDays){practiceDays.dataset.role='rhythm';practiceDays.setAttribute('aria-label','Practice rhythm')}
  }

  const resonance=cards.find(card=>card.querySelector('#mirror-content'));
  if(resonance){
    resonance.dataset.role='resonance';
    const h2=resonance.querySelector('h2');if(h2)h2.textContent='Resonance';
  }

  const teacher=screen.querySelector('#teacher-section');
  if(teacher)teacher.dataset.role='teacher-review';

  const account=screen.querySelector('.auth-card');
  if(account){
    account.dataset.role='account';
    const h2=account.querySelector(':scope>h2');if(h2)h2.textContent='Account & Access';
  }
}

export function initMe(){
  const screen=document.getElementById('me');if(!screen)return;
  screen.dataset.meOwner='master';
  applyHierarchy(screen);
  bindResonance(screen);
  document.addEventListener('ascend:screen',event=>{
    if(event.detail?.screen!=='me')return;
    applyHierarchy(screen);
    requestAnimationFrame(refreshResonance);
  });
  document.addEventListener('ascend:journal-saved',()=>window.ASCENDMirror?.resetStage?.());
}
