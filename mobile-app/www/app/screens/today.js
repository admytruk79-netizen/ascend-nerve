import {state,setMonth} from '../state.js';
import {PathEngine} from '../curriculum/path-engine.js';

function monthItem(month){
  return PathEngine.MONTHS?.[month-1]||{month:1,title:'Orientation to the Path'};
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
  // The first ascend:curriculum dispatch (from the legacy loadRemote/
  // renderStage flow) fires before this module's own listeners exist -
  // boot() only registers them after that same event has resolved
  // waitForLegacyData() and returned control here. month-path.js's
  // ascend:curriculum listener (registered earlier, at script load) reacts
  // to that first dispatch by fetching the real progression and broadcasting
  // ascend:month, but that broadcast can land before or after this
  // registration depending on scheduling, so it cannot be the only source
  // for the *initial* paint. Ask PathEngine directly (it shares
  // month-path.js's cache, so this is normally an instant cache hit rather
  // than a duplicate fetch) to make the first paint correct regardless of
  // that race.
  PathEngine.current().then(context=>{
    if(context&&Number.isFinite(Number(context.month)))renderToday({month:context.month});
  }).catch(()=>{});
  // ascend:month carries the authoritative month for every later reload;
  // ascend:curriculum itself carries none, so re-rendering off it directly
  // must reuse the last confirmed month (state.month) rather than default
  // to 1 - defaulting meant every curriculum reload (sign-in, practice
  // completion, journal save, stage change) reset this screen to the
  // Month 1 placeholder regardless of the student's actual reading/practice.
  document.addEventListener('ascend:curriculum',()=>renderToday({month:state.month}));
  document.addEventListener('ascend:month',event=>renderToday(event.detail||{}));
}
