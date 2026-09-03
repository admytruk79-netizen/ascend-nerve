import {initRouter} from './router.js';
import {initToday} from './screens/today.js';
import {initPath} from './screens/path.js';
import {initJournal} from './screens/journal.js';
import {initLibrary} from './screens/library.js';
import {initMe} from './screens/me.js';

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

async function boot(){
  if(document.documentElement.dataset.ascendMasterBoot==='1')return;
  document.documentElement.dataset.ascendMasterBoot='1';
  document.documentElement.dataset.ascendMasterReady='0';
  document.body.classList.add('ascend-master-loading');

  await waitForLegacyData();
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
