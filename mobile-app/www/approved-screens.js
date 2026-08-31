(()=>{
  const hero=(title,subtitle,kicker='ASCEND PATH')=>{
    const el=document.createElement('section');
    el.className='approved-hero';
    el.innerHTML=`<img src="assets/ascend-logo.png" alt=""><div class="approved-kicker">${kicker}</div><h1>${title}</h1><p>${subtitle}</p>`;
    return el;
  };

  function prependHero(screenId,title,subtitle){
    const screen=document.getElementById(screenId);if(!screen||screen.querySelector(':scope > .approved-hero'))return;
    screen.prepend(hero(title,subtitle));
  }

  function decoratePath(){
    prependHero('path','Your Path','A staged curriculum of formation.','ASCEND PATH');
  }

  function dayIndex(){return Math.floor((Date.now()-Date.UTC(new Date().getUTCFullYear(),0,0))/864e5)}

  async function tuneLibraryFeature(){
    const feature=document.getElementById('approved-library-feature');if(!feature)return;
    try{
      const{stageTitle,stageMetadata}=await window.ASCENDProgression?.current?.()||{};
      const images=Array.isArray(stageMetadata?.seasonal_images)?stageMetadata.seasonal_images:[];
      if(images.length){
        const pick=images[dayIndex()%images.length];
        feature.style.setProperty('background-image',`linear-gradient(90deg,rgba(4,18,27,.96),rgba(4,18,27,.74) 45%,rgba(4,18,27,.12)),url("assets/seasonal-art/${pick}")`,'important');
      }
      const heading=feature.querySelector('h2');if(heading&&stageTitle)heading.textContent=stageTitle;
    }catch(error){console.warn('ASCEND seasonal library image unavailable',error)}
  }

  function decorateLibrary(){
    const screen=document.getElementById('library');if(!screen)return;
    prependHero('library','Library','Teachings for your stage.','ASCEND PATH');
    if(!document.getElementById('approved-library-feature')){
      const feature=document.createElement('article');
      feature.id='approved-library-feature';feature.className='approved-library-feature';
      feature.innerHTML='<small>SEASON OF PRACTICE</small><h2>Beginning</h2><p>Practices that reinforce the quality you are currently forming.</p>';
      const tools=screen.querySelector('.library-tools');
      tools?.insertAdjacentElement('afterend',feature);
    }
    if(!document.getElementById('approved-library-now')){
      const now=document.createElement('article');
      now.id='approved-library-now';now.className='approved-library-now';
      now.innerHTML='<span class="approved-icon">✦</span><span><strong>The Nature of Observation</strong><small>Teaching · Current-stage support</small></span><b>›</b>';
      const feature=document.getElementById('approved-library-feature');
      feature?.insertAdjacentElement('afterend',now);
    }
    tuneLibraryFeature();
  }

  function latestLocalEntry(){
    try{
      const state=JSON.parse(localStorage.getItem('ascendPathState')||'{}');
      return Array.isArray(state.entries)&&state.entries.length?state.entries[state.entries.length-1]:null;
    }catch{return null}
  }
  function excerpt(entry){
    if(!entry)return 'Your next saved reflection will appear here.';
    const value=entry.observation||entry.life_application||entry.inner_state||entry.interpretation||entry.unresolved||'';
    const clean=String(value).trim();
    return clean.length>120?clean.slice(0,117)+'…':clean||'Reflection saved.';
  }
  function progressNumbers(){
    const days=parseInt(document.getElementById('practice-days')?.textContent||'0',10)||0;
    const required=parseInt((document.getElementById('stage-requirement')?.textContent||'7').match(/\d+/)?.[0]||'7',10)||7;
    return{days,required,pct:Math.max(0,Math.min(100,Math.round(days/Math.max(1,required)*100)))};
  }
  function decorateJournal(){
    const screen=document.getElementById('journal');if(!screen)return;
    prependHero('journal','Journal','Tracking your inner work.','ASCEND PATH');
    let stack=document.getElementById('approved-journal-stack');
    if(!stack){
      stack=document.createElement('section');stack.id='approved-journal-stack';stack.className='approved-journal-stack';
      stack.innerHTML=`
        <article class="approved-prompt-card">
          <div class="approved-card-kicker">TODAY'S PROMPT</div>
          <div class="approved-prompt-row"><span class="approved-quote">“</span><h2>Where did I choose discipline over comfort today?</h2></div>
          <button type="button" class="approved-write-now">Write now</button>
        </article>
        <article class="approved-recent-card"><div class="approved-card-kicker">RECENT ENTRY</div><h3 id="approved-recent-title">Reflection</h3><p id="approved-recent-copy"></p></article>
        <section><div class="approved-card-kicker" style="margin:2px 0 8px">JOURNEY</div><div class="approved-journey-grid">
          <article class="approved-journey-card"><strong id="approved-journey-stage">Current stage</strong><span id="approved-journey-days">Practice rhythm</span><div class="approved-mini-progress"><i id="approved-journey-fill"></i></div></article>
          <article class="approved-journey-card"><strong>Will &amp; Constancy</strong><span>Keep returning without rushing the stage.</span><div class="approved-mini-progress"><i style="width:72%"></i></div></article>
        </div></section>`;
      const form=screen.querySelector('#journal-form');form?.before(stack);
      stack.querySelector('.approved-write-now')?.addEventListener('click',()=>{
        screen.querySelector('textarea[name="observation"]')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});
        setTimeout(()=>screen.querySelector('textarea[name="observation"]')?.focus(),180);
      });
    }
    syncJournal();
  }
  function syncJournal(){
    const entry=latestLocalEntry();
    const copy=document.getElementById('approved-recent-copy');if(copy)copy.textContent=excerpt(entry);
    const title=document.getElementById('approved-recent-title');if(title)title.textContent=entry?'Latest reflection':'No recent reflection yet';
    const stage=document.getElementById('profile-stage')?.textContent?.trim()||'Current stage';
    const stageEl=document.getElementById('approved-journey-stage');if(stageEl)stageEl.textContent=stage;
    const{days,required,pct}=progressNumbers();
    const daysEl=document.getElementById('approved-journey-days');if(daysEl)daysEl.textContent=`${days} of ${required} practice days`;
    const fill=document.getElementById('approved-journey-fill');if(fill)fill.style.width=`${pct}%`;
  }

  function decorateMe(){prependHero('me','ASCEND','Your rhythm, access and Mirror.','YOUR ACCOUNT')}

  function mount(){
    decoratePath();decorateLibrary();decorateJournal();decorateMe();
    document.addEventListener('ascend:curriculum',()=>{decoratePath();decorateLibrary();syncJournal()});
    document.getElementById('journal-form')?.addEventListener('submit',()=>setTimeout(syncJournal,900));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
