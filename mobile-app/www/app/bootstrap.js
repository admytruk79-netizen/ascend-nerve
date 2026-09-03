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

async function boot(){
  if(document.documentElement.dataset.ascendMasterBoot==='1')return;
  document.documentElement.dataset.ascendMasterBoot='1';
  document.body.classList.add('ascend-master-ui');

  await Promise.all([
    loadAuthority('journal-sync-authority.js?v=20260902-master-2','data-journal-sync-authority'),
    loadAuthority('practice-timer-authority.js?v=20260902-master-2','data-practice-timer-authority')
  ]);

  initRouter();
  initToday();
  initPath();
  initJournal();
  initLibrary();
  initMe();

  document.dispatchEvent(new CustomEvent('ascend:master-ready'));
}

const start=()=>boot().catch(error=>{
  console.error('ASCEND master bootstrap failed',error);
  document.documentElement.dataset.ascendMasterBoot='error';
});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
