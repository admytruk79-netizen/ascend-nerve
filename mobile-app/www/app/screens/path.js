import {PathEngine} from '../curriculum/path-engine.js';

const PHASES=[
  'Foundation · Attention & Embodiment',
  'Stability · Will & Regulation',
  'Perception · Inner Sensitivity',
  'Integration · Self-Knowledge & Transformation',
  'Resonance · Relational & Subtle Practice',
  'Synthesis · Independent Practice'
];
let lastConfirmedContext=null;

function orientationCard(screen){
  let card=screen.querySelector('[data-path-orientation]');
  if(card)return card;
  card=document.createElement('section');
  card.className='path-orientation';
  card.dataset.pathOrientation='true';
  card.setAttribute('aria-label','Current formation position');
  card.innerHTML='<div><small>CURRENT FORMATION</small><strong data-path-position>Loading current position…</strong></div><div class="path-orientation-next"><small>NEXT</small><span data-path-next>Continue your assigned practice</span></div>';
  const copy=screen.querySelector(':scope>.path-summary-copy');
  copy?.insertAdjacentElement('afterend',card);
  return card;
}

function paintOrientation(card,context,{confirmed=false}={}){
  const month=Math.max(1,Math.min(24,Number(context?.month)||1));
  const phase=Math.ceil(month/4);
  const item=PathEngine.MONTHS?.[month-1];
  const position=card.querySelector('[data-path-position]');
  const next=card.querySelector('[data-path-next]');
  if(position)position.textContent=`Phase ${phase} · Month ${month} of 24`;
  if(next)next.textContent=item?.title?`Continue · ${item.title}`:'Continue your assigned practice';
  card.dataset.phase=String(phase);
  card.dataset.orientationState=confirmed?'confirmed':'cached';
  card.title=PHASES[phase-1]||'';
}

async function renderOrientation(screen,eventContext=null){
  const card=orientationCard(screen);
  if(eventContext&&Number.isFinite(Number(eventContext.month))){
    lastConfirmedContext={...eventContext,month:Number(eventContext.month)};
    paintOrientation(card,lastConfirmedContext,{confirmed:true});
    return;
  }
  try{
    const context=await PathEngine.current();
    if(context&&Number.isFinite(Number(context.month))){
      lastConfirmedContext={...context,month:Number(context.month)};
      paintOrientation(card,lastConfirmedContext,{confirmed:true});
    }
  }catch{
    if(lastConfirmedContext){paintOrientation(card,lastConfirmedContext);return}
    const position=card.querySelector('[data-path-position]');
    const next=card.querySelector('[data-path-next]');
    if(position)position.textContent='Current formation';
    if(next)next.textContent='Continue your assigned practice';
    card.dataset.orientationState='unconfirmed';
  }
}

export function initPath(){
  const screen=document.getElementById('path');
  if(!screen)return;
  const eyebrow=screen.querySelector(':scope>.eyebrow');
  const title=screen.querySelector(':scope>h1');
  const copy=screen.querySelector(':scope>.path-summary-copy');
  if(eyebrow)eyebrow.textContent='SCHOOL · PHASE I';
  if(title)title.textContent='The Path';
  if(copy)copy.textContent='Your current formation comes first. The wider school map shows Core Formation, supporting work, independent Practice Branches and Phase II without mixing their progression.';
  const branches=screen.querySelector('.pathway-section-header');
  if(branches){
    branches.querySelector('strong')?.replaceChildren(document.createTextNode('Practice Branches'));
    branches.querySelector('span')?.replaceChildren(document.createTextNode('Independent progression · does not advance Core Formation'));
  }
  renderOrientation(screen);
  PathEngine.paint();
  document.addEventListener('ascend:screen',event=>{
    if(event.detail?.screen!=='path')return;
    renderOrientation(screen);
    PathEngine.paint();
  });
  document.addEventListener('ascend:month',event=>renderOrientation(screen,event.detail||null));
  document.addEventListener('ascend:curriculum',()=>renderOrientation(screen));
}
