(()=>{
  const KEY='ascendPathSeason';
  const A='assets/seasonal-art/';

  // Seasons are an experience layer only. They follow the calendar (Auto)
  // or the user's manual choice. Curriculum/practice progression never
  // selects or changes the season.
  const data={
    spring:{label:'Spring',theme:'Awakening',months:[
      ['March','Awakening Perception','spring-march-awakening-perception.png'],
      ['April','Clarifying the Will','spring-april-clarifying-the-will.png'],
      ['May','Crossing the Threshold','spring-may-crossing-the-threshold.png']
    ],art:[
      ['Focused Thought','march-focused-thought.png'],
      ['Object Contemplation','march-object-contemplation.png'],
      ['Reverence & Patience','march-reverence-patience.png'],
      ['What Am I Noticing?','march-what-am-i-noticing.png'],
      ['Training the Will','april-training-the-will.png'],
      ['Deliberate Action','april-deliberate-action.png'],
      ['Truth vs Imagination','may-truth-vs-imagination.png'],
      ['Openness & Readiness','may-openness-readiness.png'],
      ['The Heart Opening','heart-opening.png']
    ]},

    summer:{label:'Summer',theme:'Embodied Will',months:[
      ['June','Gathering Energy','june-gathering-energy.png'],
      ['July','Discipline of Fire','july-discipline-fire.png'],
      ['August','Presence & Devotion','august-presence-devotion.png']
    ],art:[
      ['Two Currents Meeting','two-currents-meeting.png'],
      ['Morning & Evening Energy','morning-evening-energy.png'],
      ['Confidence & Humanity','confidence-humanity.png'],
      ['Building or Draining?','building-or-draining.png'],
      ['Mastery of Feeling','mastery-of-feeling.png'],
      ['Star Energy Practice','star-energy-practice.png'],
      ['Self-Control & Gentleness','self-control-gentleness.png'],
      ['The Heart Opening','heart-opening.png'],
      ['Presence & Devotion','presence-devotion.png']
    ]},

    autumn:{label:'Autumn',theme:'Harvest & Integration',months:[
      ['September','Harvest & Reflection','self-observation-humility.png'],
      ['October','Transformation of Forces','discipline-or-freedom.png'],
      ['November','Release & Preparation','ready-to-release.png']
    ],art:[
      ['Self-Observation & Humility','self-observation-humility.png'],
      ['Truth vs Imagination','truth-vs-imagination.png'],
      ['Discipline or Freedom?','discipline-or-freedom.png'],
      ['What Am I Ready to Release?','ready-to-release.png'],
      ['What Am I Refusing?','what-am-i-refusing.png'],
      ['Building or Draining?','building-or-draining.png'],
      ['Acceptance Practice','acceptance-practice.png'],
      ['Reverence & Patience','march-reverence-patience.png'],
      ['Presence & Devotion','presence-devotion.png']
    ]},

    winter:{label:'Winter',theme:'Interiorization',months:[
      ['December','Stillness & Discernment','object-contemplation.png'],
      ['January','Consolidation & Inner Will','where-does-will-begin.png'],
      ['February','Renewal & Readiness','openness-readiness.png']
    ],art:[
      ['Object Contemplation','march-object-contemplation.png'],
      ['Focused Thought','march-focused-thought.png'],
      ['Where Does Will Begin?','where-does-will-begin.png'],
      ['Truth vs Imagination','truth-vs-imagination.png'],
      ['Self-Observation & Humility','self-observation-humility.png'],
      ['Morning & Evening Energy','morning-evening-energy.png'],
      ['Openness & Readiness','openness-readiness.png'],
      ['Acceptance Practice','acceptance-practice.png'],
      ['What Am I Ready to Release?','ready-to-release.png']
    ]}
  };

  // Fix any accidental filename alias used in presentation data.
  data.winter.months[0][2]='march-object-contemplation.png';

  function natural(){
    const m=new Date().getMonth()+1;
    return m>=3&&m<=5?'spring':m>=6&&m<=8?'summer':m>=9&&m<=11?'autumn':'winter';
  }
  function getPref(){return localStorage.getItem(KEY)||'auto'}
  function resolve(){const p=getPref();return p==='auto'?natural():p}
  function currentMonthIndex(season){
    const m=new Date().getMonth()+1;
    const starts={spring:3,summer:6,autumn:9,winter:12};
    if(season==='winter')return m===12?0:m===1?1:2;
    return Math.max(0,Math.min(2,m-starts[season]));
  }
  function apply(){
    const s=resolve(),cfg=data[s];
    document.documentElement.dataset.season=s;
    document.documentElement.dataset.seasonPreference=getPref();
    const hero=cfg.months[currentMonthIndex(s)]||cfg.months[0];
    if(hero)document.documentElement.style.setProperty('--season-art',`url("${A+hero[2]}")`);
    document.querySelectorAll('[data-season-choice]').forEach(b=>b.classList.toggle('active',b.dataset.seasonChoice===getPref()));
    const label=document.getElementById('season-current-label');
    if(label)label.textContent=`${cfg.label} · ${cfg.theme}`;
    renderLibrary();
  }
  function set(v){localStorage.setItem(KEY,v);apply()}

  function mountControls(){
    const me=document.getElementById('me');
    if(!me||document.getElementById('season-card'))return;
    const appearance=document.getElementById('appearance-card'),account=me.querySelector('.auth-card');
    const card=document.createElement('article');
    card.id='season-card';card.className='rhythm-card seasonal-settings';
    card.innerHTML=`<h2>Seasonal atmosphere</h2><p class="review-intro">Season is independent from your practice and curriculum. Auto follows the calendar; manual choice lets you explore another atmosphere.</p><div class="season-choice-grid">
      <button type="button" data-season-choice="auto"><strong>Auto</strong><small>Follow the calendar</small></button>
      <button type="button" data-season-choice="spring"><strong>Spring</strong><small>Awakening</small></button>
      <button type="button" data-season-choice="summer"><strong>Summer</strong><small>Embodied Will</small></button>
      <button type="button" data-season-choice="autumn"><strong>Autumn</strong><small>Integration</small></button>
      <button type="button" data-season-choice="winter"><strong>Winter</strong><small>Interiorization</small></button>
    </div>`;
    appearance?.nextSibling?me.insertBefore(card,appearance.nextSibling):me.insertBefore(card,account||null);
    card.querySelectorAll('[data-season-choice]').forEach(b=>b.addEventListener('click',()=>set(b.dataset.seasonChoice)));
  }

  function renderLibrary(){
    const library=document.getElementById('library');if(!library)return;
    let block=document.getElementById('seasonal-wisdom');
    if(!block){
      block=document.createElement('section');block.id='seasonal-wisdom';block.className='seasonal-wisdom';
      library.querySelector('.library-tools')?.insertAdjacentElement('afterend',block);
    }
    const s=resolve(),cfg=data[s];
    block.innerHTML=`<div class="seasonal-head"><div><div class="eyebrow">SEASONAL WISDOM</div><h2 id="season-current-label">${cfg.label} · ${cfg.theme}</h2></div><small>Independent experience layer</small></div><div class="season-months">${cfg.months.map(([m,t,img])=>`<article class="season-month"><img src="${A+img}" alt="" loading="lazy"><div><small>${m}</small><strong>${t}</strong></div></article>`).join('')}</div><details class="season-art-more"><summary>Explore ${cfg.label} artwork</summary><div class="season-art-grid">${cfg.art.map(([t,img])=>`<figure><img src="${A+img}" alt="" loading="lazy"><figcaption>${t}</figcaption></figure>`).join('')}</div></details>`;
  }

  function mount(){mountControls();apply()}
  document.addEventListener('DOMContentLoaded',mount);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&getPref()==='auto')apply()});
  window.ASCENDSeason={apply,set,get:getPref,resolve,data};
})();