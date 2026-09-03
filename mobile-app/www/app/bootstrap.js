import {initRouter} from './router.js';
import {initToday} from './screens/today.js';
import {initPath} from './screens/path.js';
import {initJournal} from './screens/journal.js';
import {initLibrary} from './screens/library.js';
import {initMe} from './screens/me.js';

function loadAuthority(src,attribute){
  if(document.querySelector(`script[${attribute}]`))return;
  const script=document.createElement('script');script.src=src;script.setAttribute(attribute,'true');document.body.appendChild(script);
}

function boot(){
  if(document.documentElement.dataset.ascendMasterBoot==='1')return;
  document.documentElement.dataset.ascendMasterBoot='1';
  document.body.classList.add('ascend-master-ui');

  loadAuthority('journal-sync-authority.js?v=20260902-master-1','data-journal-sync-authority');
  loadAuthority('practice-timer-authority.js?v=20260902-master-1','data-practice-timer-authority');

  initRouter();
  initToday();
  initPath();
  initJournal();
  initLibrary();
  initMe();

  document.dispatchEvent(new CustomEvent('ascend:master-ready'));
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
