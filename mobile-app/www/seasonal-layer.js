(()=>{
  const KEY='ascendPathSeason';
  const A='assets/seasonal-art/';

  // Seasonal atmosphere is independent from curriculum and practice progression.
  // Auto follows the real calendar. Artwork is reused by semantic fit rather than
  // being locked to the month/page for which it was originally created.
  const data={
    spring:{label:'Spring',theme:'Awakening',months:[
      ['March','Awakening Perception','spring-march-awakening-perception.png'],
      ['April','Clarifying the Will','spring-april-clarifying-the-will.png'],
      ['May','Crossing the Threshold','spring-may-crossing-the-threshold.png']
    ],art:[
      ['Focused Thought','march-focused-thought.png'],['Object Contemplation','march-object-contemplation.png'],['Reverence & Patience','march-reverence-patience.png'],['What Am I Noticing?','march-what-am-i-noticing.png'],['Training the Will','april-training-the-will.png'],['Deliberate Action','april-deliberate-action.png'],['Truth vs Imagination','may-truth-vs-imagination.png'],['Openness & Readiness','may-openness-readiness.png'],['The Heart Opening','heart-opening.png']
    ]},
    summer:{label:'Summer',theme:'Embodied Will',months:[
      ['June','Gathering Energy','june-gathering-energy.png'],['July','Discipline of Fire','july-discipline-fire.png'],['August','Presence & Devotion','august-presence-devotion.png']
    ],art:[
      ['Two Currents Meeting','two-currents-meeting.png'],['Morning & Evening Energy','morning-evening-energy.png'],['Confidence & Humanity','confidence-humanity.png'],['Building or Draining?','building-or-draining.png'],['Mastery of Feeling','mastery-of-feeling.png'],['Star Energy Practice','star-energy-practice.png'],['Self-Control & Gentleness','self-control-gentleness.png'],['The Heart Opening','heart-opening.png'],['Presence & Devotion','presence-devotion.png']
    ]},
    autumn:{label:'Autumn',theme:'Harvest & Integration',months:[
      ['September','Harvest & Reflection','self-observation-humility.png'],['October','Transformation of Forces','discipline-or-freedom.png'],['November','Release & Preparation','ready-to-release.png']
    ],art:[
      ['Self-Observation & Humility','self-observation-humility.png'],['Truth vs Imagination','truth-vs-imagination.png'],['Discipline or Freedom?','discipline-or-freedom.png'],['What Am I Ready to Release?','ready-to-release.png'],['What Am I Refusing?','what-am-i-refusing.png'],['Building or Draining?','building-or-draining.png'],['Acceptance Practice','acceptance-practice.png'],['Reverence & Patience','march-reverence-patience.png'],['Presence & Devotion','presence-devotion.png']
    ]},
    winter:{label:'Winter',theme:'Interiorization',months:[
      ['December','Stillness & Discernment','march-object-contemplation.png'],['January','Consolidation & Inner Will','where-does-will-begin.png'],['February','Renewal & Readiness','openness-readiness.png']
    ],art:[
      ['Object Contemplation','march-object-contemplation.png'],['Focused Thought','march-focused-thought.png'],['Where Does Will Begin?','where-does-will-begin.png'],['Truth vs Imagination','truth-vs-imagination.png'],['Self-Observation & Humility','self-observation-humility.png'],['Morning & Evening Energy','morning-evening-energy.png'],['Openness & Readiness','openness-readiness.png'],['Acceptance Practice','acceptance-practice.png'],['What Am I Ready to Release?','ready-to-release.png']
    ]}
  };

  function natural(){const m=new Date().getMonth()+1;return m>=3&&m<=5?'spring':m>=6&&m<=8?'summer':m>=9&&m<=11?'autumn':'winter'}
  function getPref(){return localStorage.getItem(KEY)||'auto'}
  function resolve(){const p=getPref();return p==='auto'?natural():p}
  function monthIndex(s){const m=new Date().getMonth()+1;if(s==='winter')return m===12?0:m===1?1:2;const start={spring:3,summer:6,autumn:9}[s];return Math.max(0,Math.min(2,m-start))}
  function current(){const s=resolve(),cfg=data[s],mi=monthIndex(s);return {s,cfg,month:cfg.months[mi]||cfg.months[0]}}

  function apply(){
    const {s,cfg,month}=current();
    document.documentElement.dataset.season=s;
    document.documentElement.dataset.seasonPreference=getPref();
    if(month)document.documentElement.style.setProperty('--season-art',`url("${A+month[2]}")`);
    const subtle=document.querySelectorAll('[data-season-context]');
    subtle.forEach(el=>{el.textContent=`${month?.[0]||cfg.label} · ${cfg.theme}`});
    renderLibrary();
  }

  function set(v){localStorage.setItem(KEY,v);apply()}

  // Manual season choice belongs in Library exploration, not main navigation/Today.
  function renderLibrary(){
    const library=document.getElementById('library');if(!library)return;
    let block=document.getElementById('seasonal-wisdom');
    if(!block){block=document.createElement('section');block.id='seasonal-wisdom';block.className='seasonal-wisdom';library.querySelector('.library-tools')?.insertAdjacentElement('afterend',block)}
    const {s,cfg}=current();
    block.innerHTML=`<div class="seasonal-head"><div><div class="eyebrow">SEASONAL WISDOM</div><h2>${cfg.label} · ${cfg.theme}</h2></div><small>Atmosphere, not progression</small></div>
      <div class="season-choice-grid seasonal-library-choice">
        <button type="button" data-season-choice="auto"><strong>Current</strong><small>Calendar</small></button>
        ${Object.entries(data).map(([id,v])=>`<button type="button" data-season-choice="${id}"><strong>${v.label}</strong><small>${v.theme}</small></button>`).join('')}
      </div>
      <div class="season-months">${cfg.months.map(([m,t,img])=>`<article class="season-month"><img src="${A+img}" alt="" loading="lazy"><div><small>${m}</small><strong>${t}</strong></div></article>`).join('')}</div>
      <details class="season-art-more"><summary>Explore ${cfg.label} artwork</summary><div class="season-art-grid">${cfg.art.map(([t,img])=>`<figure><img src="${A+img}" alt="" loading="lazy"><figcaption>${t}</figcaption></figure>`).join('')}</div></details>`;
    block.querySelectorAll('[data-season-choice]').forEach(b=>{b.classList.toggle('active',b.dataset.seasonChoice===getPref());b.addEventListener('click',()=>set(b.dataset.seasonChoice))});
  }

  function mount(){
    // Remove the old prominent settings card if an earlier build created it.
    document.getElementById('season-card')?.remove();
    apply();
  }
  document.addEventListener('DOMContentLoaded',mount);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&getPref()==='auto')apply()});
  window.ASCENDSeason={apply,set,get:getPref,resolve,data};
})();