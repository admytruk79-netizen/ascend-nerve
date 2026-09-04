import {state,setMonth} from '../state.js';
import {PathEngine} from '../curriculum/path-engine.js';

function monthItem(month){
  return PathEngine.MONTHS?.[month-1]||{month:1,title:'Orientation to the Path'};
}

function completionStatus(){
  let node=document.getElementById('today-completion-status');
  if(node)return node;
  const host=document.getElementById('ritual-feedback');
  if(!host)return null;
  node=document.createElement('div');
  node.id='today-completion-status';
  node.className='today-completion-status hidden';
  node.setAttribute('role','status');
  node.setAttribute('aria-live','polite');
  host.insertAdjacentElement('afterend',node);
  return node;
}

function reflectionHandoff(){return document.getElementById('today-reflect')}

function setReflectionReady(ready){
  const handoff=reflectionHandoff();
  if(!handoff)return;
  handoff.classList.toggle('is-ready',!!ready);
  handoff.dataset.practiceComplete=ready?'true':'false';
  const strong=handoff.querySelector('strong');
  const small=handoff.querySelector('small');
  if(strong)strong.textContent=ready?'Journal reflection':'After practice · Journal reflection';
  if(small)small.textContent=ready?'Record what you noticed while it is still fresh':'Available after you complete today’s practice';
}

function announce(message,{persist=false,practiceComplete=false}={}){
  const node=completionStatus();if(!node)return;
  node.textContent=message;
  node.classList.remove('hidden');
  if(practiceComplete)setReflectionReady(true);
  if(persist)sessionStorage.setItem('ascendTodayCompletion',message);
}

function clearTransientCompletion(){
  const stored=sessionStorage.getItem('ascendTodayCompletion');
  if(stored){
    const practiceComplete=/Practice completed|Reflection saved/.test(stored);
    announce(stored,{practiceComplete});
  }
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
  if(portal)portal.setAttribute('aria-label',`Press and hold for two seconds to open the briefing for ${item.title||'practice'}`);
  if(begin){
    begin.textContent='Can’t hold? Open briefing';
    begin.classList.remove('ascend-secondary-entry');
    begin.classList.add('ascend-accessible-entry');
    begin.setAttribute('aria-label',`Open the practice briefing for ${item.title||'practice'} without using press and hold`);
  }
  setReflectionReady(false);
  clearTransientCompletion();
}

export function initToday(){
  renderToday();
  PathEngine.current().then(context=>{
    if(context&&Number.isFinite(Number(context.month)))renderToday({month:context.month});
  }).catch(()=>{});
  document.addEventListener('ascend:curriculum',()=>renderToday({month:state.month}));
  document.addEventListener('ascend:month',event=>renderToday(event.detail||{}));
  document.addEventListener('ascend:practice-timer-complete',()=>announce('✓ Timer complete — finish the practice to record this step.'));
  document.addEventListener('ascend:practice-completed',()=>announce('✓ Practice completed and recorded. Add your reflection to finish today’s cycle.',{persist:true,practiceComplete:true}));
  document.addEventListener('ascend:journal-saved',event=>{
    if(event.detail?.saved===false)return;
    announce(event.detail?.remote===false?'✓ Reflection saved on this device.':'✓ Reflection saved to your Journal.',{persist:true,practiceComplete:true});
  });
  document.addEventListener('ascend:screen',event=>{
    if(event.detail?.screen==='today')clearTransientCompletion();
  });
}
