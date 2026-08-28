(()=>{
  const overlay=document.getElementById('path-intro');
  if(!overlay)return;
  window.__ASCEND_INTRO_DECIDED=false;
  const steps=[...overlay.querySelectorAll('[data-intro-step]')];
  const dots=[...overlay.querySelectorAll('[data-intro-dot]')];
  const next=document.getElementById('intro-next');
  const back=document.getElementById('intro-back');
  const skip=document.getElementById('intro-skip');
  let step=0,user=null,cinematicTimer=null,isReplay=false;
  const localKey=id=>`ascendPathIntroComplete:${id}`;
  function render(){steps.forEach((item,index)=>item.classList.toggle('active',index===step));dots.forEach((item,index)=>{item.classList.toggle('active',index===step);item.setAttribute('aria-current',index===step?'step':'false')});back.disabled=step===0;next.textContent=step===steps.length-1?'Begin My ASCEND Path':'Continue';requestAnimationFrame(()=>steps[step]?.querySelector('h1')?.focus?.({preventScroll:true}))}
  function revealGuide(){clearTimeout(cinematicTimer);overlay.classList.remove('is-cinematic');skip.textContent=isReplay?'Close':'Skip introduction';render()}
  async function complete(){if(user?.id){localStorage.setItem(localKey(user.id),'true');try{await PathBackend.completeIntroduction(user.id)}catch(error){console.warn('ASCEND introduction saved on this device',error)}}overlay.classList.add('hidden');overlay.setAttribute('aria-hidden','true');document.getElementById('app')?.removeAttribute('inert');document.querySelector('.bottom-nav')?.removeAttribute('inert');window.ASCENDUX?.activateScreen?.('today',{record:false})}
  function open({replay=false,cinematic=false}={}){clearTimeout(cinematicTimer);step=0;isReplay=replay;overlay.classList.toggle('is-cinematic',cinematic);overlay.classList.remove('hidden');overlay.setAttribute('aria-hidden','false');document.getElementById('app')?.setAttribute('inert','');document.querySelector('.bottom-nav')?.setAttribute('inert','');skip.textContent=cinematic?'Skip animation':replay?'Close':'Skip introduction';render();if(cinematic){cinematicTimer=setTimeout(revealGuide,3900)}else requestAnimationFrame(()=>steps[0]?.querySelector('h1')?.focus?.())}
  async function consider({currentUser,profile}={}){user=currentUser||user;if(!user?.id){window.__ASCEND_INTRO_DECIDED=true;document.dispatchEvent(new CustomEvent('ascend:intro-decided'));return}const params=new URLSearchParams(location.search);const forced=params.get('intro')==='1';let completeLocally=localStorage.getItem(localKey(user.id))==='true';let completeRemotely=!!profile?.onboarding_completed_at;if(!completeRemotely&&!forced){try{const remote=await PathBackend.getIntroductionStatus(user.id);completeRemotely=!!remote?.onboarding_completed_at;if(completeRemotely)localStorage.setItem(localKey(user.id),'true')}catch{}}
    if(forced||(!completeLocally&&!completeRemotely)){const rawStep=params.get('introStep'),requested=rawStep===null?Number.NaN:Number(rawStep);open({cinematic:false});if(Number.isFinite(requested)){step=Math.max(0,Math.min(steps.length-1,requested));render()}}
    window.__ASCEND_INTRO_DECIDED=true;
    document.dispatchEvent(new CustomEvent('ascend:intro-decided'));
  }
  next.addEventListener('click',()=>{if(step===steps.length-1){complete();return}step++;render()});
  back.addEventListener('click',()=>{if(step>0){step--;render()}});
  skip.addEventListener('click',()=>overlay.classList.contains('is-cinematic')?revealGuide():complete());
  dots.forEach(dot=>dot.addEventListener('click',()=>{step=Number(dot.dataset.introDot);render()}));
  document.getElementById('menu-how')?.addEventListener('click',()=>{document.getElementById('menu-overlay')?.classList.add('hidden');PathBackend.me().then(currentUser=>{user=currentUser;open({replay:true,cinematic:false})})});
  window.ASCENDIntro={consider,open,close:complete,revealGuide};
})();