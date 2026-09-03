import {state,setState} from './state.js';

const SCREENS=['today','path','journal','library','me'];

function overlays(){return [...document.querySelectorAll('[role="dialog"]:not(.hidden),.overlay:not(.hidden)')].filter(el=>getComputedStyle(el).display!=='none')}

export function showScreen(name,{replace=false}={}){
  const target=SCREENS.includes(name)?name:'today';
  document.querySelectorAll('#app .screen').forEach(screen=>{
    const active=screen.id===target;
    screen.classList.toggle('active',active);
    screen.setAttribute('aria-hidden',String(!active));
  });
  document.querySelectorAll('.bottom-nav [data-screen]').forEach(button=>{
    const active=button.dataset.screen===target;
    button.classList.toggle('active',active);
    if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
  });
  setState({screen:target});
  const hash=`#${target}`;
  if(location.hash!==hash){
    try{history[replace?'replaceState':'pushState']({ascendScreen:target},'',hash)}catch{}
  }
  document.dispatchEvent(new CustomEvent('ascend:screen',{detail:{screen:target}}));
}

function closeTopOverlay(){
  const open=overlays();
  const top=open.at(-1);
  if(!top)return false;
  const close=top.querySelector('.overlay-close,.branch-close,[data-close],button[aria-label*="Close"]');
  if(close){close.click();return true}
  top.classList.add('hidden');return true;
}

export function handleBack(){
  if(closeTopOverlay())return true;
  if(state.screen!=='today'){showScreen('today',{replace:true});return true}
  return false;
}

export function initRouter(){
  document.querySelector('.bottom-nav')?.addEventListener('click',event=>{
    const button=event.target.closest('[data-screen]');
    if(!button)return;
    event.preventDefault();showScreen(button.dataset.screen);
  });
  window.addEventListener('popstate',()=>showScreen(location.hash.slice(1)||'today',{replace:true}));
  const initial=SCREENS.includes(location.hash.slice(1))?location.hash.slice(1):'today';
  showScreen(initial,{replace:true});
  try{
    window.Capacitor?.Plugins?.App?.addListener?.('backButton',()=>{if(!handleBack())window.Capacitor?.Plugins?.App?.minimizeApp?.()});
  }catch{}
  window.ASCENDRouter={showScreen,handleBack};
}
