(()=>{
  function ensureSchoolLayer(){
    if(!document.querySelector('link[data-initiation-school]')){
      const link=document.createElement('link');
      link.rel='stylesheet';
      link.href='initiation-school.css?v=20260901-school-1';
      link.dataset.initiationSchool='true';
      document.head.appendChild(link);
    }
    if(!document.querySelector('link[data-initiation-school-refinements]')){
      const link=document.createElement('link');
      link.rel='stylesheet';
      link.href='initiation-school-refinements.css?v=20260901-school-2';
      link.dataset.initiationSchoolRefinements='true';
      document.head.appendChild(link);
    }
    if(!document.querySelector('link[data-initiation-school-polish]')){
      const link=document.createElement('link');
      link.rel='stylesheet';
      link.href='initiation-school-polish.css?v=20260901-school-3';
      link.dataset.initiationSchoolPolish='true';
      document.head.appendChild(link);
    }
    document.body?.classList.add('initiation-school');
  }

  const hero=(title,subtitle,kicker='ASCEND PATH')=>{
    const el=document.createElement('section');
    el.className='approved-hero';
    el.innerHTML=`<img src="assets/ascend-logo.png" alt=""><div class="school-mark">${kicker}</div><h1>${title}</h1><p>${subtitle}</p>`;
    return el;
  };

  function prependHero(screenId,title,subtitle,kicker){
    const screen=document.getElementById(screenId);if(!screen)return;
    let existing=screen.querySelector(':scope > .approved-hero');
    if(!existing){existing=hero(title,subtitle,kicker);screen.prepend(existing);return}
    const mark=existing.querySelector('.school-mark,.approved-kicker');
    if(mark){mark.className='school-mark';mark.textContent=kicker||'ASCEND PATH'}
    const heading=existing.querySelector('h1');if(heading)heading.textContent=title;
    const copy=existing.querySelector('p');if(copy)copy.textContent=subtitle;
  }

  function decoratePath(){
    prependHero('path','The Practice Path','Formation unfolds through practice, observation, reflection, and gateways.','SCHOOL OF PRACTICE');
  }

  function dayIndex(){return Math.floor((Date.now()-Date.UTC(new Date().getUTCFullYear(),0,0))/864e5)}

  async function tuneLibraryFeature(){
    const feature=document.getElementById('approved-library-feature');if(!feature)return;
    try{
      const{stageTitle,stageMetadata}=await window.ASCENDProgression?.current?.()||{};
      const images=Array.isArray(stageMetadata?.seasonal_images)?stageMetadata.seasonal_images:[];
      const preferred=['august-presence-devotion.png','winter-january-grounding-silence.png','spring-march-awakening-perception.png','march-what-am-i-noticing.png'];
      const candidates=preferred.filter(name=>images.includes(name));
      const pick=candidates.length?candidates[dayIndex()%candidates.length]:'august-presence-devotion.png';
      feature.style.setProperty('background-image',`linear-gradient(90deg,rgba(4,18,27,.94),rgba(4,18,27,.68) 48%,rgba(4,18,27,.12)),url("assets/seasonal-art/${pick}")`,'important');
      const heading=feature.querySelector('h2');if(heading&&stageTitle)heading.textContent=stageTitle;
    }catch(error){console.warn('ASCEND seasonal library image unavailable',error)}
  }

  function decorateLibrary(){
    const screen=document.getElementById('library');if(!screen)return;
    prependHero('library','Library','Texts, practices, and source material for the stage you are living.','THE STUDY');
    if(!document.getElementById('approved-library-feature')){
      const feature=document.createElement('article');
      feature.id='approved-library-feature';feature.className='approved-library-feature';
      feature.innerHTML='<small>STAGE STUDY</small><h2>Beginning</h2><p>Read slowly. Use the Library to deepen the work you are already practicing.</p>';
      const tools=screen.querySelector('.library-tools');
      tools?.insertAdjacentElement('afterend',feature);
    }else{
      const feature=document.getElementById('approved-library-feature');
      const small=feature.querySelector('small');if(small)small.textContent='STAGE STUDY';
      const p=feature.querySelector('p');if(p)p.textContent='Read slowly. Use the Library to deepen the work you are already practicing.';
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
    prependHero('journal','Journal','A private record of observation before interpretation.','THE INNER RECORD');
    let stack=document.getElementById('approved-journal-stack');
    if(!stack){
      stack=document.createElement('section');stack.id='approved-journal-stack';stack.className='approved-journal-stack';
      stack.innerHTML=`
        <article class="approved-prompt-card">
          <div class="approved-card-kicker">TODAY'S QUESTION</div>
          <div class="approved-prompt-row"><span class="approved-quote">“</span><h2>Where did I choose discipline over comfort today?</h2></div>
          <button type="button" class="approved-write-now">Enter the record</button>
        </article>
        <article class="approved-recent-card"><div class="approved-card-kicker">LAST OBSERVATION</div><h3 id="approved-recent-title">Reflection</h3><p id="approved-recent-copy"></p></article>
        <section><div class="approved-card-kicker" style="margin:16px 0 2px">PRACTICE CONTEXT</div><div class="approved-journey-grid">
          <article class="approved-journey-card"><strong id="approved-journey-stage">Current stage</strong><span id="approved-journey-days">Practice rhythm</span><div class="approved-mini-progress"><i id="approved-journey-fill"></i></div></article>
          <article class="approved-journey-card"><strong>Observation Before Interpretation</strong><span>Describe what occurred before assigning meaning to it.</span></article>
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
    const daysEl=document.getElementById('approved-journey-days');if(daysEl)daysEl.textContent=`${days} practice days · ${required} required before review`;
    const fill=document.getElementById('approved-journey-fill');if(fill)fill.style.width=`${pct}%`;
  }

  function decorateMe(){
    prependHero('me','Mirror · Resonance','A reflective chamber for patterns in your own record.','THE MIRROR');
    const me=document.getElementById('me');
    const mirror=document.getElementById('mirror-content')?.closest('.rhythm-card');
    mirror?.classList.add('mirror-chamber');
    const heading=mirror?.querySelector('h2');if(heading)heading.textContent='Mirror · Resonance';
    const position=[...me?.querySelectorAll(':scope > .rhythm-card')||[]].find(card=>card!==mirror&&!card.classList.contains('auth-card')&&card.id!=='appearance-card');
    position?.classList.add('current-position-card');
    const positionHeading=position?.querySelector('h2');if(positionHeading)positionHeading.textContent='Current Position';
    const nav=document.querySelector('.bottom-nav button[data-screen="me"]');if(nav)nav.textContent='Mirror';
    const menu=document.querySelector('.menu-link[data-menu-screen="me"]');if(menu)menu.textContent='Mirror';
  }

  function mount(){
    ensureSchoolLayer();
    decoratePath();decorateLibrary();decorateJournal();decorateMe();
    document.addEventListener('ascend:curriculum',()=>{decoratePath();decorateLibrary();syncJournal();decorateMe()});
    document.getElementById('journal-form')?.addEventListener('submit',()=>setTimeout(syncJournal,900));
  }
  ensureSchoolLayer();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
