import {Auth} from '../data/auth.js';

async function refreshResonance(){
  try{const me=await Auth.me();if(me)window.ASCENDMirror?.load?.('stage')}catch{}
}

export function initMe(){
  const screen=document.getElementById('me');if(!screen)return;
  const eyebrow=screen.querySelector(':scope>.eyebrow');
  const title=screen.querySelector(':scope>h1');
  if(eyebrow)eyebrow.textContent='FORMATION · RHYTHM · RESONANCE';
  if(title)title.textContent='My ASCEND';
  const cards=[...screen.querySelectorAll(':scope>.rhythm-card')];
  const resonance=cards.find(card=>card.querySelector('#mirror-content'));
  if(resonance){
    resonance.dataset.role='resonance';
    const h2=resonance.querySelector('h2');if(h2)h2.textContent='Resonance';
    const button=resonance.querySelector('#refresh-mirror');if(button)button.textContent='Refresh Resonance';
  }
  const stage=cards.find(card=>card.querySelector('#profile-stage'));if(stage)stage.dataset.role='formation';
  const account=screen.querySelector('.auth-card');if(account)account.dataset.role='account';
  document.addEventListener('ascend:screen',event=>{if(event.detail?.screen==='me')requestAnimationFrame(refreshResonance)});
}
