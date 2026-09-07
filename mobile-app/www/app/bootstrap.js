import {initRouter} from './router.js';
import {initToday} from './screens/today.js';
import {initPath} from './screens/path.js';
import {initJournal} from './screens/journal.js';
import {initLibrary} from './screens/library.js';
import {initMe} from './screens/me.js';
import {initPracticeRuntime} from './practices/runtime.js';

function loadAuthority(src,attribute){
  const existing=document.querySelector(`script[${attribute}]`);
  if(existing){
    if(existing.dataset.loaded==='true')return Promise.resolve();
    return new Promise((resolve,reject)=>{
      existing.addEventListener('load',resolve,{once:true});
      existing.addEventListener('error',reject,{once:true});
    });
  }
  return new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    script.src=src;
    script.setAttribute(attribute,'true');
    script.addEventListener('load',()=>{script.dataset.loaded='true';resolve()},{once:true});
    script.addEventListener('error',reject,{once:true});
    document.body.appendChild(script);
  });
}

function legacyDataReady(){
  return Boolean(window.curriculum&&window.currentStage);
}

function waitForLegacyData(){
  if(!window.PathBackend?.isSignedIn?.()||legacyDataReady())return Promise.resolve();
  if(document.body.classList.contains('auth-required')||document.body.classList.contains('access-required'))return Promise.resolve();
  return new Promise(resolve=>{
    let settled=false;
    let timeout=0;
    const finish=()=>{
      if(settled)return;
      settled=true;
      clearTimeout(timeout);
      document.removeEventListener('ascend:curriculum',onCurriculum);
      observer.disconnect();
      resolve();
    };
    const onCurriculum=()=>{if(legacyDataReady())finish()};
    const observer=new MutationObserver(()=>{
      if(legacyDataReady()||document.body.classList.contains('auth-required')||document.body.classList.contains('access-required'))finish();
    });
    document.addEventListener('ascend:curriculum',onCurriculum);
    observer.observe(document.body,{attributes:true,attributeFilter:['class']});
    timeout=setTimeout(finish,15000);
  });
}

/* app.js still owns legacy data/auth wiring while the master frontend is being
   reconstructed. Replace only the three practice controls it historically
   bound so its stale start/close/finish listeners cannot compete with the
   authoritative runtime. Cloning preserves markup/state while dropping every
   listener attached directly to those nodes or their descendants. */
function detachLegacyPracticeControls(){
  for(const selector of ['#today [data-action="practice"]','#practice-briefing','#practice-overlay']){
    const node=document.querySelector(selector);
    if(!node?.parentNode)continue;
    const clone=node.cloneNode(true);
    node.parentNode.replaceChild(clone,node);
  }
  const fallback=document.querySelector('#today [data-action="practice"]');
  fallback?.addEventListener('click',event=>{
    event.preventDefault();
    window.ASCENDOpenPractice?.();
  });
}

function progressForStage(stageId){
  if(!stageId||!Array.isArray(window.__pathProgress))return null;
  return window.__pathProgress.find(row=>row.stage_id===stageId)||null;
}

function syncCompletionResult(result,session){
  const progress=progressForStage(session.stageId);
  const userId=session.userId||progress?.user_id||null;
  const days=Number(result?.practice_days);
  if(Number.isFinite(days)){
    for(const id of ['practice-days','profile-days']){
      const node=document.getElementById(id);
      if(node)node.textContent=String(days);
    }
    const day=document.getElementById('stage-day');
    if(day)day.textContent=`DAY ${Math.max(1,days+1)}`;
    const journeyDay=document.getElementById('journey-now-day');
    if(journeyDay)journeyDay.textContent=`Day ${Math.max(1,days+1)}`;
    if(progress){
      progress.practice_days=days;
      progress.last_practice_date=session.date||progress.last_practice_date;
      if(result?.stage_status)progress.status=result.stage_status;
    }
  }
  document.dispatchEvent(new CustomEvent('ascend:practice-completed',{detail:{
    ...result,
    userId,
    stageId:session.stageId,
    practiceId:session.practiceId,
    sessionId:session.sessionId,
    month:session.month,
    date:session.date,
    timezone:session.timezone
  }}));
  document.dispatchEvent(new CustomEvent('ascend:curriculum'));
}

function bindAuthoritativeFinish(){
  const finish=document.getElementById('finish-practice');
  if(!finish||finish.dataset.completionAuthority==='master')return;
  finish.dataset.completionAuthority='master';
  let pending=false;

  finish.addEventListener('click',async event=>{
    if(!finish.classList.contains('ready')||finish.disabled)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if(pending)return;

    const runtime=window.ASCENDPracticeRuntime;
    const session=runtime?.session?.();
    const timer=window.ASCENDPracticeTimer;
    const hint=document.getElementById('timer-hint');
    if(!session?.sessionId){
      if(hint)hint.textContent='This practice has no official server session. Close it and begin again.';
      return;
    }
    if(Number(timer?.remainingSeconds?.()||0)>0){
      if(hint)hint.textContent='Complete the full practice before recording this step.';
      return;
    }

    pending=true;
    finish.disabled=true;
    finish.setAttribute('aria-busy','true');
    if(hint)hint.textContent='Recording practice…';
    try{
      const seconds=Math.max(1,Math.round((Number(session.practice?.default_minutes)||10)*60));
      const result=await window.PathBackend.rpc('path_record_practice_completion',{
        p_stage_id:session.stageId,
        p_practice_id:session.practiceId,
        p_duration_seconds:seconds,
        p_session_id:session.sessionId
      });
      syncCompletionResult(result,session);
      runtime.complete();
      document.getElementById('practice-overlay')?.classList.add('hidden');
      timer?.reset?.();
      if(hint)hint.textContent='Practice recorded.';
    }catch(error){
      console.error('Could not record authoritative ASCEND practice completion',error);
      if(hint)hint.textContent='Practice was not recorded and does not count toward progression yet. Check your connection and try Finish Practice again.';
    }finally{
      pending=false;
      finish.removeAttribute('aria-busy');
      if(document.getElementById('practice-overlay')&&!document.getElementById('practice-overlay').classList.contains('hidden'))finish.disabled=false;
    }
  },true);
}

async function boot(){
  if(document.documentElement.dataset.ascendMasterBoot==='1')return;
  document.documentElement.dataset.ascendMasterBoot='1';
  document.documentElement.dataset.ascendMasterReady='0';
  document.body.classList.add('ascend-master-loading');

  await waitForLegacyData();
  detachLegacyPracticeControls();
  document.body.classList.add('ascend-master-ui');

  initRouter();
  initToday();
  initPath();
  initJournal();
  initLibrary();
  initMe();

  /* Timer is a self-contained DOM authority with no screen-init dependency in either
     direction, so it loads after the screens take ownership of their controls instead of
     blocking that handoff — a delay here previously left Save Reflection (and other
     screen actions) unbound while this unrelated script was still downloading. */
  await loadAuthority('practice-timer-authority.js?v=20260903-master-ready-1','data-practice-timer-authority');
  initPracticeRuntime();
  bindAuthoritativeFinish();

  document.documentElement.dataset.ascendMasterReady='1';
  document.body.classList.remove('ascend-master-loading');
  document.dispatchEvent(new CustomEvent('ascend:master-ready'));
}

const start=()=>boot().catch(error=>{
  console.error('ASCEND master bootstrap failed',error);
  document.documentElement.dataset.ascendMasterBoot='error';
  document.documentElement.dataset.ascendMasterReady='error';
  document.body.classList.remove('ascend-master-loading');
});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
