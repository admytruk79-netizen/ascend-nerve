import {state,setState} from './state.js';

const SCREENS=['today','path','journal','library','me'];
let lastFocused=null;

function screenName(){return SCREENS.find(id=>document.getElementById(id)?.classList.contains('active'))||state.screen||'today'}
function overlayNodes(){return [...document.querySelectorAll('#path-intro,#practice-briefing,#practice-overlay,#library-overlay,#branch-overlay,#menu-overlay,#about-overlay')];}
function openOverlays(){return overlayNodes().filter(el=>!el.classList.contains('hidden')&&getComputedStyle(el).display!=='none');}

function syncOverlay(){
  const open=openOverlays().at(-1)||null;
  const app=document.getElementById('app');
  const bottom=document.querySelector('.bottom-nav');
  overlayNodes().forEach(item=>item.setAttribute('aria-hidden',String(item!==open)));
  if(open){
    lastFocused=lastFocused||document.activeElement;
    app?.setAttribute('inert','');
    bottom?.setAttribute('inert','');
    requestAnimationFrame(()=>open.querySelector('button,[href],input,textarea,select,[tabindex]:not([tabindex="-1"])')?.focus());
  }else{
    app?.removeAttribute('inert');
    bottom?.removeAttribute('inert');
    lastFocused?.focus?.();
    lastFocused=null;
  }
}

function backPulse(){
  try{const Haptics=window.Capacitor?.Plugins?.Haptics;if(Haptics?.impact){Haptics.impact({style:'LIGHT'});return}}catch{}
  try{navigator.vibrate?.(8)}catch{}
}

export function showScreen(name,{replace=false,history=true}={}){
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
  if(history&&location.hash!==hash){
    try{window.history[replace?'replaceState':'pushState']({ascendScreen:target},'',hash)}catch{}
  }
  window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  document.dispatchEvent(new CustomEvent('ascend:screen',{detail:{screen:target}}));
}

function closeOverlay(open){
  if(!open)return false;
  if(open.id==='path-intro')window.ASCENDIntro?.close?.();
  else{
    const close=open.querySelector('.overlay-close,.branch-close,[data-close],button[aria-label*="Close"]');
    if(close)close.click();else open.classList.add('hidden');
  }
  syncOverlay();
  return true;
}

export function handleBack(){
  const open=openOverlays().at(-1);
  if(open){closeOverlay(open);backPulse();return true}
  if(document.body.classList.contains('auth-required')||document.body.classList.contains('access-required')){
    if(screenName()!=='me')showScreen('me',{replace:true});
    backPulse();return true;
  }
  if(screenName()!=='today'){showScreen('today',{replace:true});backPulse();return true}
  return false;
}

async function syncAuthGate(){
  let confirmedUser=null;
  try{confirmedUser=await window.PathBackend?.me?.()}catch{}
  document.body.classList.toggle('auth-required',!confirmedUser);
  if(!confirmedUser)showScreen('me',{replace:true});
  return confirmedUser;
}

function bindOverlayObservers(){
  overlayNodes().forEach(item=>new MutationObserver(syncOverlay).observe(item,{attributes:true,attributeFilter:['class']}));
  document.addEventListener('keydown',event=>{
    const open=openOverlays().at(-1);if(!open)return;
    if(event.key==='Escape'){event.preventDefault();closeOverlay(open);return}
    if(event.key!=='Tab')return;
    const focusable=[...open.querySelectorAll('button:not([disabled]),[href],input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])')];
    if(!focusable.length)return;
    const first=focusable[0],last=focusable[focusable.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  });
  syncOverlay();
}

function bindMenu(){
  const menu=document.getElementById('menu-overlay');
  const about=document.getElementById('about-overlay');
  document.getElementById('menu-button')?.addEventListener('click',event=>{event.preventDefault();menu?.classList.remove('hidden')});
  menu?.querySelectorAll('[data-menu-screen]').forEach(button=>button.addEventListener('click',()=>{menu.classList.add('hidden');showScreen(button.dataset.menuScreen)}));
  document.getElementById('menu-about')?.addEventListener('click',()=>{menu?.classList.add('hidden');about?.classList.remove('hidden')});
}

function bindContextNavigation(){
  document.addEventListener('click',event=>{
    if(event.target.closest('[data-go-signin]')){showScreen('me');setTimeout(()=>document.getElementById('google-sign-in')?.focus(),200);return}
    if(event.target.closest('[data-go-journal]')){showScreen('journal');setTimeout(()=>document.querySelector('#journal-form textarea[name="observation"]')?.focus(),160)}
  });
  document.addEventListener('ascend:journal-saved',event=>{if(event.detail?.saved===false)return;showScreen('today')});
  const finish=document.getElementById('finish-practice');
  finish?.addEventListener('click',()=>{
    if(!finish.classList.contains('ready'))return;
    setTimeout(()=>{
      if(!document.getElementById('practice-overlay')?.classList.contains('hidden'))return;
      showScreen('journal');
      const status=document.getElementById('journal-status');if(status)status.textContent='Practice complete. Note anything you want to remember.';
      document.querySelector('#journal-form textarea[name="observation"]')?.focus();
    },250);
  });
}

export function initRouter(){
  document.querySelectorAll('.bottom-nav [data-screen]').forEach(button=>{
    if(!button.hasAttribute('aria-label'))button.setAttribute('aria-label',button.textContent.trim());
    button.addEventListener('click',event=>{event.preventDefault();showScreen(button.dataset.screen)});
  });
  window.addEventListener('popstate',()=>showScreen(location.hash.slice(1)||'today',{replace:true,history:false}));
  const initial=SCREENS.includes(location.hash.slice(1))?location.hash.slice(1):'today';
  showScreen(initial,{replace:true});
  bindOverlayObservers();bindMenu();bindContextNavigation();
  try{window.Capacitor?.Plugins?.App?.addListener?.('backButton',()=>{if(!handleBack())window.Capacitor?.Plugins?.App?.minimizeApp?.()})}catch{}
  document.getElementById('google-sign-in')?.addEventListener('click',()=>setTimeout(syncAuthGate,400));
  document.getElementById('sign-out')?.addEventListener('click',()=>setTimeout(syncAuthGate,100));
  syncAuthGate();
  window.ASCENDRouter={showScreen,handleBack,syncOverlay,syncAuthGate};
  window.ASCENDUX={activateScreen:showScreen,syncOverlay,syncAuthGate,handleBack};
}
