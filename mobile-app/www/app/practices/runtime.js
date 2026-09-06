import {observationRenderer} from './observation.js';
import {breathRenderer} from './breath.js';
import {sphereRenderer} from './sphere.js';
import {guidedRenderer} from './guided.js';
import {reflectionRenderer} from './reflection.js';

const renderers={
  observation:observationRenderer,
  breath:breathRenderer,
  sphere:sphereRenderer,
  guided:guidedRenderer,
  reflection:reflectionRenderer
};

let activeRenderer=observationRenderer;
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

function syncPracticeCopy(practice){
  if(!practice)return;
  const minutes=Number(practice.default_minutes)||10;
  const set=(id,value)=>{const node=document.getElementById(id);if(node)node.textContent=value};
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

function selectRenderer(practice=resolvedPractice()){
  activeRenderer=renderers[requestedRenderer(practice)]||observationRenderer;
  return activeRenderer;
}

function context(){
  const practice=resolvedPractice();
  return {
    practice,
    stage:window.currentStage||null,
    title:practice?.title||document.getElementById('briefing-title')?.textContent?.trim()||'',
    duration:document.getElementById('briefing-duration')?.textContent?.trim()||''
  };
}

function prepare(){
  const practice=resolvedPractice();
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
function complete(){activeRenderer.complete()}
function exit(){activeRenderer.exit()}

function openBriefing(){
  const briefing=document.getElementById('practice-briefing');
  if(!briefing)return false;
  ensureBriefingAtmosphere();
  prepare();
  briefing.classList.remove('hidden');
  return true;
}

function beginOverlay(){
  const briefing=document.getElementById('practice-briefing');
  const overlay=document.getElementById('practice-overlay');
  if(!overlay)return false;
  const practice=resolvedPractice();
  syncPracticeCopy(practice);
  briefing?.classList.add('hidden');
  overlay.classList.remove('hidden');
  document.dispatchEvent(new CustomEvent('ascend:practice-started',{detail:{practiceId:practice?.id||null,stageId:window.currentStage?.id||null,month:canonicalMonth(window.curriculum),date:window.ASCENDProgression?.authority?.()?.curriculumDate||window.ASCENDAuthority?.curriculumDate||null}}));
  start();
  return true;
}

function closeBriefing(){
  document.getElementById('practice-briefing')?.classList.add('hidden');
  exit();
}

function closeOverlay({resetTimer=false}={}){
  window.ASCENDPracticeTimer?.pause?.();
  if(resetTimer)window.ASCENDPracticeTimer?.reset?.();
  document.getElementById('practice-overlay')?.classList.add('hidden');
  exit();
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
  briefingBegin?.addEventListener('click',()=>beginOverlay());
  briefingClose?.addEventListener('click',()=>closeBriefing());
  overlayClose?.addEventListener('click',()=>closeOverlay({resetTimer:true}));
  timerToggle?.addEventListener('click',syncTimerState);
  finish?.addEventListener('click',()=>{
    if(finish.classList.contains('ready'))complete();
  });
  document.addEventListener('ascend:practice-timer-complete',()=>{
    if(activeRenderer.state==='running')pause();
  });
  document.addEventListener('ascend:authority',()=>{
    if(document.getElementById('practice-briefing')&&!document.getElementById('practice-briefing').classList.contains('hidden'))prepare();
  });

  window.ASCENDOpenPractice=openBriefing;
  window.ASCENDPracticeRuntime={
    prepare,start,pause,resume,complete,exit,
    openBriefing,beginOverlay,closeBriefing,closeOverlay,
    current:()=>activeRenderer,
    practice:()=>resolvedPractice(),
    canonicalMonth:()=>canonicalMonth(window.curriculum),
    selectRenderer
  };
}