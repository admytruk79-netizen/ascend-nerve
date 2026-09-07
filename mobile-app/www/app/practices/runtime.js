import {observationRenderer} from './observation.js';
import {breathRenderer} from './breath.js';
import {sphereRenderer} from './sphere.js';
import {guidedRenderer} from './guided.js';
import {reflectionRenderer} from './reflection.js';
import {beginAuthoritativePracticeSession,abandonAuthoritativePracticeSession} from './session-authority.js';

const renderers={
  observation:observationRenderer,
  breath:breathRenderer,
  sphere:sphereRenderer,
  guided:guidedRenderer,
  reflection:reflectionRenderer
};

let activeRenderer=observationRenderer;
let activeSession=null;
let beginAttempt=0;
let beginPending=false;
let mounted=false;

function canonicalMonth(curriculum){
  return Number(window.ASCENDProgression?.authority?.()?.month||window.ASCENDAuthority?.month||window.ASCENDState?.month||curriculum?.currentMonth||1);
}

function canonicalMonthLink(curriculum,stage){
  const month=canonicalMonth(curriculum);
  return curriculum?.links?.find(item=>item.stage_id===stage.id&&item.role==='month_primary'&&Number(item.frequency_rule?.canonical_month)===month)||null;
}

function resolvedPractice(){
  const curriculum=window.curriculum;
  const stage=window.currentStage;
  if(!curriculum||!stage)return null;
  const link=canonicalMonthLink(curriculum,stage)||curriculum.links?.find(item=>item.stage_id===stage.id&&item.role==='primary');
  return link?curriculum.practices?.find(item=>item.id===link.practice_id)||null:null;
}

function activePractice(){return activeSession?.practice||resolvedPractice()}
function activeCanonicalMonth(){return Number(activeSession?.month||canonicalMonth(window.curriculum))}
function activeScope(){return activeSession?{...activeSession}:null}
function clearActiveSession(){activeSession=null}
function abandonSession(sessionId){
  if(!sessionId)return;
  void abandonAuthoritativePracticeSession(sessionId).catch(error=>{
    console.warn('Could not mark ASCEND practice session abandoned',error);
  });
}

function syncPracticeCopy(practice){
  if(!practice)return;
  const minutes=Number(practice.default_minutes)||10;
  const set=(id,value)=>{const node=document.getElementById(id);if(node)node.textContent=value};
  set('practice-name',`${minutes} min`);
  set('briefing-title',practice.title||'Practice');
  set('briefing-intention',practice.instructions||'');
  set('briefing-duration',`${minutes} minutes`);
  set('briefing-begin',`Begin ${minutes}-Minute Practice`);
  set('overlay-practice-title',practice.title||'Practice');
  set('overlay-practice-instructions',practice.instructions||'');
}

function ensureBriefingAtmosphere(){
  const briefing=document.getElementById('practice-briefing');
  if(!briefing)return null;
  let atmosphere=briefing.querySelector(':scope > .briefing-atmosphere');
  if(atmosphere)return atmosphere;
  atmosphere=document.createElement('div');
  atmosphere.className='briefing-atmosphere';
  atmosphere.setAttribute('aria-hidden','true');
  const image=document.createElement('img');
  image.className='briefing-atmosphere-image';
  image.src='assets/ascend-twilight-ritual-bg.jpg';
  image.alt='';
  atmosphere.appendChild(image);
  briefing.prepend(atmosphere);
  return atmosphere;
}

function requestedRenderer(practice){
  const value=practice?.metadata?.renderer||practice?.metadata?.practice_renderer||practice?.renderer;
  return typeof value==='string'?value.trim().toLowerCase():'';
}

function selectRenderer(practice=activePractice()){
  activeRenderer=renderers[requestedRenderer(practice)]||observationRenderer;
  return activeRenderer;
}

function context(){
  const practice=activePractice();
  return {
    practice,
    stage:window.currentStage||null,
    title:practice?.title||document.getElementById('briefing-title')?.textContent?.trim()||'',
    duration:document.getElementById('briefing-duration')?.textContent?.trim()||''
  };
}

function prepare(){
  const practice=activePractice();
  syncPracticeCopy(practice);
  ensureBriefingAtmosphere();
  const renderer=selectRenderer(practice);
  renderer.prepare(context());
  document.documentElement.dataset.practiceRenderer=renderer.name;
  return renderer;
}

function start(){
  if(activeRenderer.state==='idle'||activeRenderer.state==='stopped'||activeRenderer.state==='complete')prepare();
  if(activeRenderer.state==='paused')activeRenderer.resume();
  else activeRenderer.start();
}

function pause(){activeRenderer.pause()}
function resume(){activeRenderer.resume()}
function complete(){activeRenderer.complete();clearActiveSession()}
function exit(){activeRenderer.exit()}

function openBriefing(){
  const briefing=document.getElementById('practice-briefing');
  if(!briefing)return false;
  ensureBriefingAtmosphere();
  prepare();
  briefing.classList.remove('hidden');
  return true;
}

function cancelPendingBegin(){
  beginAttempt+=1;
  beginPending=false;
  const button=document.getElementById('briefing-begin');
  button?.removeAttribute('aria-busy');
  if(button)button.disabled=false;
}

async function beginOverlay(){
  const briefing=document.getElementById('practice-briefing');
  const overlay=document.getElementById('practice-overlay');
  const button=document.getElementById('briefing-begin');
  if(!overlay||!briefing||beginPending)return false;

  const practice=resolvedPractice();
  const stageId=window.currentStage?.id||null;
  const authority=window.ASCENDProgression?.authority?.()||window.ASCENDAuthority||{};
  const attempt=++beginAttempt;
  let serverScope=null;

  beginPending=true;
  overlay.classList.add('hidden');
  button?.setAttribute('aria-busy','true');
  if(button)button.disabled=true;

  try{
    serverScope=await beginAuthoritativePracticeSession({stageId,practiceId:practice?.id||null});

    // The user may dismiss the briefing while the server request is pending.
    // A late response must never reopen the practice overlay and must not leave
    // a live authoritative start row behind.
    if(attempt!==beginAttempt||briefing.classList.contains('hidden')){
      abandonSession(serverScope?.session_id||null);
      return false;
    }

    activeSession={
      practice,
      practiceId:practice?.id||null,
      stageId,
      sessionId:serverScope?.session_id||null,
      month:Number(serverScope?.canonical_month||canonicalMonth(window.curriculum)),
      date:serverScope?.curriculum_date||authority?.curriculumDate||null,
      timezone:serverScope?.timezone||authority?.timezone||null
    };
    syncPracticeCopy(practice);
    briefing.classList.add('hidden');
    overlay.classList.remove('hidden');
    document.dispatchEvent(new CustomEvent('ascend:practice-started',{detail:{practiceId:activeSession.practiceId,stageId:activeSession.stageId,sessionId:activeSession.sessionId,month:activeSession.month,date:activeSession.date,timezone:activeSession.timezone}}));
    start();
    return true;
  }catch(error){
    if(attempt===beginAttempt){
      overlay.classList.add('hidden');
      briefing.classList.remove('hidden');
      const status=document.getElementById('briefing-intention');
      if(status)status.textContent='Could not establish an official practice session. Check your connection and try again.';
      console.error('Could not start authoritative ASCEND practice session',error);
    }
    return false;
  }finally{
    if(attempt===beginAttempt){
      beginPending=false;
      button?.removeAttribute('aria-busy');
      if(button)button.disabled=false;
    }
  }
}

function closeBriefing(){
  cancelPendingBegin();
  document.getElementById('practice-briefing')?.classList.add('hidden');
  exit();
}

function closeOverlay({resetTimer=false}={}){
  cancelPendingBegin();
  const sessionId=activeSession?.sessionId||null;
  window.ASCENDPracticeTimer?.pause?.();
  if(resetTimer)window.ASCENDPracticeTimer?.reset?.();
  document.getElementById('practice-overlay')?.classList.add('hidden');
  exit();
  clearActiveSession();
  abandonSession(sessionId);
}

function syncTimerState(){
  queueMicrotask(()=>{
    const timer=window.ASCENDPracticeTimer;
    if(!timer)return;
    if(timer.isRunning?.()){
      if(activeRenderer.state==='paused')resume();
      else if(activeRenderer.state!=='running')start();
    }else if(activeRenderer.state==='running'&&timer.remainingSeconds?.()>0){
      pause();
    }
  });
}

export function initPracticeRuntime(){
  if(mounted)return;
  mounted=true;

  const portal=document.getElementById('ritual-portal');
  const briefingBegin=document.getElementById('briefing-begin');
  const briefingClose=document.querySelector('#practice-briefing .briefing-close');
  const overlayClose=document.querySelector('#practice-overlay .overlay-close');
  const timerToggle=document.getElementById('timer-toggle');
  const finish=document.getElementById('finish-practice');

  ensureBriefingAtmosphere();
  portal?.addEventListener('pointerdown',()=>prepare(),{passive:true});

  // Runtime owns practice start. Capture prevents the legacy app.js bubble
  // handler from exposing the timer before authoritative scope is established.
  briefingBegin?.addEventListener('click',event=>{
    event.preventDefault();
    event.stopImmediatePropagation();
    void beginOverlay();
  },true);
  briefingClose?.addEventListener('click',event=>{
    event.preventDefault();
    event.stopImmediatePropagation();
    closeBriefing();
  },true);
  overlayClose?.addEventListener('click',event=>{
    event.preventDefault();
    event.stopImmediatePropagation();
    closeOverlay({resetTimer:true});
  },true);
  timerToggle?.addEventListener('click',syncTimerState);
  finish?.addEventListener('click',()=>{
    if(finish.classList.contains('ready'))complete();
  });
  document.addEventListener('ascend:practice-timer-complete',()=>{
    if(activeRenderer.state==='running')pause();
  });
  document.addEventListener('ascend:authority',()=>{
    const practice=resolvedPractice();
    const practiceName=document.getElementById('practice-name');
    if(practice&&practiceName)practiceName.textContent=`${Number(practice.default_minutes)||10} min`;
    const briefing=document.getElementById('practice-briefing');
    const overlay=document.getElementById('practice-overlay');
    const briefingOpen=briefing&&!briefing.classList.contains('hidden');
    const overlayOpen=overlay&&!overlay.classList.contains('hidden');
    if(briefingOpen&&!overlayOpen&&!beginPending)prepare();
  });

  window.ASCENDOpenPractice=openBriefing;
  window.ASCENDPracticeRuntime={
    prepare,start,pause,resume,complete,exit,
    openBriefing,beginOverlay,closeBriefing,closeOverlay,
    current:()=>activeRenderer,
    practice:()=>activePractice(),
    session:()=>activeScope(),
    canonicalMonth:()=>activeCanonicalMonth(),
    selectRenderer
  };
}