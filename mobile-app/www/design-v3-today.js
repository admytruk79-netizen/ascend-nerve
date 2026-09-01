(()=>{
  let approvedHeroObjectUrl='';
  function greeting(){const h=new Date().getHours();return h<12?'Good morning':h<18?'Good afternoon':'Good evening'}
  function formattedDate(){return new Intl.DateTimeFormat(undefined,{weekday:'long',month:'long',day:'numeric'}).format(new Date())}
  function cleanPracticeTitle(raw=''){
    const text=String(raw||'').trim();
    if(!text)return'Self-Contemplation';
    if(/^self[-\s]?contemplation/i.test(text))return'Self-Contemplation';
    const first=text.split(/\s+[·|—–]\s+|\s+at\s+the\s+|\s+at\s+|\s+of\s+the\s+/i)[0]?.trim();
    return(first||text).slice(0,42);
  }
  function ensureLibraryReaderHead(){
    const overlay=document.getElementById('library-overlay'),body=document.getElementById('library-body');
    if(!overlay||!body)return;
    let head=document.getElementById('library-reader-head');
    if(!head){
      head=document.createElement('header');head.id='library-reader-head';head.className='library-reader-head';
      head.innerHTML='<div id="library-reader-type" class="reader-meta">TEACHING</div><h1 id="library-title">Observation Before Interpretation</h1><div class="reader-rule" aria-hidden="true"><i></i></div>';
      body.before(head);
    }
  }
  function ensureMirrorEngine(){
    if(window.ASCENDMirror||document.querySelector('script[data-resonance-engine]'))return;
    const script=document.createElement('script');script.src='mirror-engine.js?v=20260831-resonance-2';script.dataset.resonanceEngine='true';document.body.appendChild(script);
  }
  async function loadApprovedHero(hero){
    if(!hero||hero.dataset.approvedHeroLoaded==='true')return;
    try{
      const parts=await Promise.all([1,2,3,4,5,6].map(async index=>{
        const response=await fetch(`assets/approved-today-hero-${index}.txt?v=20260831-approved-2`,{cache:'reload'});
        if(!response.ok)throw new Error(`hero chunk ${index}`);
        return (await response.text()).trim();
      }));
      const binary=atob(parts.join(''));
      const bytes=new Uint8Array(binary.length);
      for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
      if(approvedHeroObjectUrl)URL.revokeObjectURL(approvedHeroObjectUrl);
      approvedHeroObjectUrl=URL.createObjectURL(new Blob([bytes],{type:'image/webp'}));
      hero.style.setProperty('background-image',`url("${approvedHeroObjectUrl}")`,'important');
      hero.dataset.approvedHeroLoaded='true';
    }catch(error){
      console.warn('ASCEND approved Today hero fallback in use',error);
    }
  }
  function tuneHero(hero,{title,subtitle,kicker,className}){
    if(!hero)return;
    if(className)hero.classList.add(className);
    const h=hero.querySelector('h1'),p=hero.querySelector('p'),k=hero.querySelector('.school-mark,.approved-kicker');
    if(h)h.textContent=title;
    if(p)p.textContent=subtitle;
    if(k){k.className='school-mark';k.textContent=kicker}
  }
  function tuneApprovedScreens(){
    tuneHero(document.querySelector('#path>.approved-hero'),{title:'The Practice Path',subtitle:'A 24-month formation that unfolds through sustained practice, reflection, and gateways.',kicker:'CORE FORMATION',className:'approved-journey-head'});
    tuneHero(document.querySelector('#library>.approved-hero'),{title:'Library',subtitle:'Teachings and practices that support the stage you are living now.',kicker:'STUDY',className:'approved-library-head'});
    tuneHero(document.querySelector('#journal>.approved-hero'),{title:'Journal',subtitle:'A private record of observation before interpretation.',kicker:'INNER RECORD'});
    tuneHero(document.querySelector('#me>.approved-hero'),{title:'Mirror · Resonance',subtitle:'Patterns from your own record, reflected without declaring what they mean.',kicker:'MIRROR',className:'approved-me-head'});
    const mirrorCard=document.querySelector('#me .rhythm-card:has(#mirror-content)');
    mirrorCard?.classList.add('mirror-chamber');
    const mirrorHeading=mirrorCard?.querySelector('h2');if(mirrorHeading)mirrorHeading.textContent='Mirror · Resonance';
  }
  function installLayoutGuard(){
    if(document.getElementById('today-v5-layout-guard'))return;
    document.getElementById('today-v4-layout-guard')?.remove();
    const style=document.createElement('style');style.id='today-v5-layout-guard';
    style.textContent=`
      #today.today-ritual-screen:not(.active){display:none!important}
      #today.today-ritual-screen.active{display:block!important;grid-template-columns:none!important}
      #today.today-ritual-screen>.ritual-context,
      #today.today-ritual-screen>.ritual-scene,
      #today.today-ritual-screen>.ritual-begin,
      #today.today-ritual-screen>.journey-rail,
      #today.today-ritual-screen>.journal-handoff,
      #today.today-ritual-screen>.rhythm-card,
      #today.today-ritual-screen>.quiet-note{display:none!important}
      #today.today-ritual-screen>#ritual-feedback{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0 0 0 0)!important;white-space:nowrap!important;border:0!important}
      #today .today-v3-action{display:flex!important;width:100%!important;align-items:center!important;justify-content:center!important}
      #today #ritual-portal.today-v3-medallion{position:relative!important;left:auto!important;right:auto!important;top:auto!important;margin:0 auto!important;transform:none!important;flex:0 0 auto!important}
      #today .today-v3-hero{background-size:cover!important;background-position:center!important;background-repeat:no-repeat!important}
      #today .today-v3-hero:before{display:none!important}
    `;
    document.head.appendChild(style);
  }
  function mount(){
    const today=document.getElementById('today');if(!today||document.getElementById('today-v3'))return;
    installLayoutGuard();ensureMirrorEngine();ensureLibraryReaderHead();
    const shell=document.createElement('div');shell.id='today-v3';shell.className='today-v3';
    shell.innerHTML=`
      <header class="today-v3-intro">
        <div class="today-v3-greeting"><span aria-hidden="true">✦</span><div><strong>${greeting()}</strong><small>${formattedDate()}</small></div></div>
        <h1 id="today-v3-practice">Self-Contemplation</h1>
        <p class="today-v3-subtitle">A quiet return to the inner witness.</p>
        <div class="today-v3-meta"><span id="today-v3-day">Day 1</span><span id="today-v3-duration">10 min</span></div>
      </header>
      <section class="today-v3-hero" aria-label="Today's practice"></section>
      <section class="today-v3-action" aria-label="Begin today's practice"><div class="today-v3-medallion-slot" aria-hidden="true"></div></section>
      <article class="today-v3-support"><small>TODAY'S FOCUS</small><strong>Observation before interpretation</strong><p>Notice what is present before naming what it means.</p></article>`;
    today.prepend(shell);
    const hero=shell.querySelector('.today-v3-hero');
    hero?.style.setProperty('background-image',"url('assets/seasonal-art/self-observation-humility.png')",'important');
    loadApprovedHero(hero);
    const portal=document.getElementById('ritual-portal'),slot=shell.querySelector('.today-v3-medallion-slot');
    if(portal&&slot){
      portal.classList.add('today-v3-medallion');
      const strong=portal.querySelector('.ritual-copy strong');if(strong)strong.textContent='Hold to Begin';
      slot.replaceWith(portal);
    }
    document.querySelector('.bottom-nav button[data-screen="me"]')?.addEventListener('click',()=>setTimeout(()=>window.ASCENDMirror?.load?.('stage'),250));
    sync();tuneApprovedScreens();
    ['stage-title','stage-day','practice-name'].forEach(id=>{
      const source=document.getElementById(id);if(source)new MutationObserver(sync).observe(source,{childList:true,subtree:true,characterData:true});
    });
    document.documentElement.classList.add('today-v5-ready');
  }
  function sync(){
    const title=document.getElementById('today-v3-practice');if(title)title.textContent=cleanPracticeTitle(document.getElementById('stage-title')?.textContent?.trim());
    const day=document.getElementById('today-v3-day');if(day)day.textContent=(document.getElementById('stage-day')?.textContent||'Day 1').trim();
    const duration=document.getElementById('today-v3-duration');if(duration)duration.textContent=(document.getElementById('practice-name')?.textContent||'10 min').trim();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
  document.addEventListener('ascend:curriculum',()=>{sync();setTimeout(tuneApprovedScreens,0)});
  setTimeout(tuneApprovedScreens,700);
  if(!document.querySelector('script[data-approved-screens]')){
    const script=document.createElement('script');script.src='approved-screens.js?v=20260901-dark-cinematic-1';script.dataset.approvedScreens='true';script.onload=()=>setTimeout(tuneApprovedScreens,0);document.body.appendChild(script)
  }
})();
