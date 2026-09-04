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

function currentPractice(){
  const curriculum=window.curriculum;
  const stage=window.currentStage;
  if(!curriculum||!stage)return null;
  const link=curriculum.links?.find(item=>item.stage_id===stage.id&&item.role==='primary');
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
  briefingBegin?.addEventListener('click',()=>start());
  briefingClose?.addEventListener('click',()=>exit());
  overlayClose?.addEventListener('click',()=>exit());
  timerToggle?.addEventListener('click',syncTimerState);
  finish?.addEventListener('click',()=>{
    if(finish.classList.contains('ready'))complete();
  });
  document.addEventListener('ascend:practice-timer-complete',()=>{
    if(activeRenderer.state==='running')pause();
  });

  window.ASCENDPracticeRuntime={
    prepare,start,pause,resume,complete,exit,
    current:()=>activeRenderer,
    selectRenderer
  };
}
