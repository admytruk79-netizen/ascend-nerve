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

function canonicalMonthLink(curriculum,stage){
  const month=Number(curriculum?.currentMonth||window.ASCENDProgression?.MONTHS?.find(item=>item.month===Number(window.ASCENDState?.month))?.month||window.ASCENDState?.month||1);
  return curriculum?.links?.find(item=>item.stage_id===stage.id&&item.role==='month_primary'&&Number(item.frequency_rule?.canonical_month)===month)||null;
}

function currentPractice(){
  const curriculum=window.curriculum;
  const stage=window.currentStage;
  if(!curriculum||!stage)return null;
  const link=canonicalMonthLink(curriculum,stage)||curriculum.links?.find(item=>item.stage_id===stage.id&&item.role==='primary');
  return link?curriculum.practices?.find(item=>item.id===link.practice_id)||null:null;
}

function requestedRenderer(practice){
  const value=practice?.metadata?.renderer||practice?.metadata?.practice_renderer||practice?.renderer;
  return typeof value==='string'?value.trim().toLowerCase():'';
}

function selectRenderer(practice=currentPractice()){
  activeRenderer=renderers[requestedRenderer(practice)]||observationRenderer;
  return activeRenderer;
}

function context(){
  const practice=currentPractice();
  return {
    practice,
    stage:window.currentStage||null,
    title:practice?.title||document.getElementById('briefing-title')?.textContent?.trim()||'',
    duration:document.getElementById('briefing-duration')?.textContent?.trim()||''
  };
}

function prepare(){
  const renderer=selectRenderer();
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
  prepare();
  briefing.classList.remove('hidden');
  return true;
}

function beginOverlay(){
  const briefing=document.getElementById('practice-briefing');
  const overlay=document.getElementById('practice-overlay');
  if(!overlay)return false;
  briefing?.classList.add('hidden');
  overlay.classList.remove('hidden');
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

  window.ASCENDOpenPractice=openBriefing;
  window.ASCENDPracticeRuntime={
    prepare,start,pause,resume,complete,exit,
    openBriefing,beginOverlay,closeBriefing,closeOverlay,
    current:()=>activeRenderer,
    selectRenderer
  };
}
