import {state,setMonth} from '../state.js';

function monthItem(month){
  return window.ASCENDProgression?.MONTHS?.[month-1]||{month:1,title:'Orientation to the Path'};
}

export function renderToday(detail={}){
  const month=Math.max(1,Math.min(24,Number(detail.month)||1));
  const item=monthItem(month);
  setMonth(month);
  const title=document.getElementById('stage-title');
  const eyebrow=document.getElementById('stage-eyebrow');
  const monthLabel=document.getElementById('today-month-label');
  const portal=document.getElementById('ritual-portal');
  const begin=document.querySelector('#today [data-action="practice"]');
  if(title)title.textContent=item.title||'Orientation to the Path';
  if(eyebrow)eyebrow.textContent=`CORE FORMATION · MONTH ${month}`;
  if(monthLabel)monthLabel.textContent=`Month ${month} of 24`;
  if(portal)portal.setAttribute('aria-label',`Press and hold for two seconds to begin ${item.title||'practice'}`);
  if(begin){begin.textContent='Open Practice Briefing';begin.classList.add('ascend-secondary-entry')}
}

export function initToday(){
  renderToday();
  // ascend:month (dispatched by month-path.js off this same ascend:curriculum
  // reload, once it has actually resolved the student's real progression) is
  // the authoritative source for the current month - re-render with its
  // detail whenever it arrives. ascend:curriculum itself carries no month,
  // so re-rendering directly off it must reuse the last confirmed month
  // (state.month) rather than defaulting to 1: defaulting meant every
  // curriculum reload (sign-in, practice completion, journal save, stage
  // change) reset this screen to the Month 1 placeholder regardless of the
  // student's actual reading/practice, until - or unless - ascend:month
  // caught up.
  document.addEventListener('ascend:curriculum',()=>renderToday({month:state.month}));
  document.addEventListener('ascend:month',event=>renderToday(event.detail||{}));
}
