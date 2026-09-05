import {state,setMonth} from '../state.js';
import {PathEngine} from '../curriculum/path-engine.js';

const COMPLETION_KEY='ascendTodayCompletionState';

function monthItem(month){
  return PathEngine.MONTHS?.[month-1]||{month:1,title:'Orientation to the Path'};
}

function localDate(){
  const now=new Date();
  const y=now.getFullYear();
  const m=String(now.getMonth()+1).padStart(2,'0');
  const d=String(now.getDate()).padStart(2,'0');
  return`${y}-${m}-${d}`;
}

function activeUserId(){
  const rows=Array.isArray(window.__pathProgress)?window.__pathProgress:[];
  const active=rows.find(row=>row.status==='active'||row.status==='review')||rows[rows.length-1];
  return active?.user_id||null;
}

function currentScope(){
  return{date:localDate(),month:Number(state.month)||1,stageId:window.currentStage?.id||null,userId:activeUserId()};
}

function completionScope(detail={}){
  return{
    date:detail.date||localDate(),
    month:Number(detail.month)||1,
    stageId:detail.stageId||null,
    userId:detail.userId||null
  };
}

function sameScope(a,b){
  return!!a&&!!b&&a.date===b.date&&Number(a.month)===Number(b.month)&&a.stageId===b.stageId&&a.userId===b.userId;
}

function readCompletion(){
  try{const value=JSON.parse(sessionStorage.getItem(COMPLETION_KEY)||'null');return value&&typeof value==='object'?value:null}catch{return null}
}
function writeCompletion(value){if(value)sessionStorage.setItem(COMPLETION_KEY,JSON.stringify(value));else sessionStorage.removeItem(COMPLETION_KEY)}
function scopedCompletion(){const stored=readCompletion();return sameScope(stored?.scope,currentScope())?stored:null}

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
function practiceComplete(){return scopedCompletion()?.practiceComplete===true}

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

function announce(message,{persist=false,practiceComplete:completed=false,scope=null}={}){
  const node=completionStatus();if(!node)return;
  node.textContent=message;
  node.classList.remove('hidden');
  const targetScope=scope||currentScope();
  const appliesHere=sameScope(targetScope,currentScope());
  if(completed&&appliesHere)setReflectionReady(true);
  if(persist)writeCompletion({scope:targetScope,message,practiceComplete:completed});
}

function restoreCompletion(){
  const stored=scopedCompletion();
  if(!stored){
    const stale=readCompletion();if(stale)writeCompletion(null);
    setReflectionReady(false);
    return;
  }
  announce(stored.message||'Practice completed.',{practiceComplete:stored.practiceComplete===true,scope:stored.scope});
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
  restoreCompletion();
}

export function initToday(){
  renderToday();
  PathEngine.current().then(context=>{
    if(context&&Number.isFinite(Number(context.month)))renderToday({month:context.month});
  }).catch(()=>{});
  document.addEventListener('ascend:curriculum',()=>renderToday({month:state.month}));
  document.addEventListener('ascend:month',event=>renderToday(event.detail||{}));
  document.addEventListener('ascend:practice-timer-complete',()=>announce('✓ Timer complete — finish the practice to record this step.'));
  document.addEventListener('ascend:practice-completed',event=>{
    const scope=completionScope(event.detail||{});
    announce('✓ Practice completed and recorded. Add your reflection to finish today’s cycle.',{persist:true,practiceComplete:true,scope});
  });
  document.addEventListener('ascend:journal-saved',event=>{
    if(event.detail?.saved===false)return;
    const completed=practiceComplete();
    announce(event.detail?.remote===false?'✓ Reflection saved on this device.':'✓ Reflection saved to your Journal.',{persist:true,practiceComplete:completed});
  });
  document.addEventListener('ascend:screen',event=>{
    if(event.detail?.screen==='today')restoreCompletion();
  });
  document.addEventListener('ascend:practice-started',()=>{
    writeCompletion(null);
    setReflectionReady(false);
    const node=completionStatus();if(node){node.textContent='';node.classList.add('hidden')}
  });
}