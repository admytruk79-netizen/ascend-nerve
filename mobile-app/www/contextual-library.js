(()=>{
  const STAGE_MAP={
    'Self-Contemplation at the Beginning of the Path':['orientation-path','observation-before-interpretation','akharata-taking-inventory','akharata-chapter-01'],
    'Clarity of Thought':['akharata-observation-three-requirements','akharata-chapter-03','observation-before-interpretation'],
    'Will & Constancy':['akharata-chapter-05','akharata-chapter-03'],
    'Equanimity':['akharata-chapter-04','akharata-experience-without-name','observation-before-interpretation'],
    'Positive Perception':['akharata-experience-without-name','akharata-chapter-04'],
    'Openness to the New':['akharata-borrowed-concept','akharata-chapter-02','akharata-experience-without-name'],
    'Impartial Retrospect':['observation-before-interpretation','akharata-observation-three-requirements','akharata-chapter-03'],
    'Tools & Integration':['akharata-chapter-05','akharata-chapter-11','akharata-chapter-12'],
    'Expanded Practice & Integration':['akharata-chapter-11','akharata-chapter-12','akharata-volume-1']
  };
  let currentMonth=1;

  const style=document.createElement('style');
  style.textContent=`
    .related-teaching{margin:16px 0 4px;width:100%;border:1px solid rgba(214,179,106,.24);background:linear-gradient(180deg,rgba(214,179,106,.07),rgba(85,200,189,.035));border-radius:16px;padding:13px 15px;color:var(--ivory);text-align:left;display:flex;align-items:center;gap:12px;font:inherit}
    .related-teaching:active{transform:scale(.99)}
    .related-teaching-mark{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;border:1px solid rgba(214,179,106,.38);color:var(--gold2);flex:0 0 auto}
    .related-teaching-copy{min-width:0;display:block}.related-teaching-copy small{display:block;color:var(--gold);font:9px Arial,sans-serif;letter-spacing:.14em;margin-bottom:3px}.related-teaching-copy strong{display:block;font-size:14px;font-weight:400;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.related-teaching-arrow{margin-left:auto;color:var(--gold);font-size:22px}
    .practice-overlay .related-teaching{max-width:360px;margin:8px 0 18px}
    .content-card.month-locked{pointer-events:none;opacity:.42}
    .library-current-practice{margin:0 0 18px;padding-bottom:18px;border-bottom:1px solid var(--line)}
    .library-current-practice .eyebrow{margin-bottom:8px}
    .library-practice-card{width:100%;display:grid;grid-template-columns:1fr auto;gap:5px 14px;align-items:center;text-align:left;padding:15px 16px;border:1px solid rgba(85,200,189,.28);border-radius:16px;background:linear-gradient(135deg,rgba(85,200,189,.08),var(--panel));color:var(--ivory);font:inherit}
    .library-practice-card small{grid-column:1;color:var(--teal);font:8px Arial,sans-serif;letter-spacing:.13em}.library-practice-card strong{grid-column:1;font-size:15px;font-weight:500}.library-practice-card span{grid-column:1;color:var(--muted);font-size:11px}.library-practice-card i{grid-column:2;grid-row:1/4;font-style:normal;font-size:24px;color:var(--teal)}
    .library-practice-card:focus-visible{outline:2px solid var(--teal);outline-offset:3px}
  `;
  document.head.appendChild(style);

  const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const paragraphs=(text='')=>String(text).split(/\n\s*\n|\n/).map(x=>x.trim()).filter(Boolean).map(p=>`<p>${esc(p)}</p>`).join('');

  function currentStageTitle(){return document.getElementById('stage-title')?.textContent?.trim()||''}
  function minMonth(item){const exact=Number(item?.metadata?.month)||0;const minimum=Number(item?.metadata?.min_month)||0;return exact||minimum||1}
  function eligible(item){return minMonth(item)<=currentMonth}
  function currentPractice(){
    const c=window.curriculum,stage=window.currentStage;
    if(!c||!stage)return null;
    const link=c.links?.find(item=>item.stage_id===stage.id&&item.role==='primary');
    return link?c.practices?.find(item=>item.id===link.practice_id)||null:null;
  }
  function relatedItems(){
    const c=window.curriculum;
    if(!c?.content?.length)return[];
    const exact=c.content.filter(item=>Number(item?.metadata?.month)===currentMonth&&eligible(item));
    if(exact.length)return exact.slice(0,3);
    const wanted=STAGE_MAP[currentStageTitle()]||[];
    const picked=wanted.map(slug=>c.content.find(x=>x.slug===slug)).filter(item=>item&&eligible(item));
    if(picked.length)return picked;
    const words=(currentStageTitle()+' '+(document.getElementById('practice-name')?.textContent||'')).toLowerCase().split(/\W+/).filter(x=>x.length>4);
    return c.content.filter(eligible).map(item=>({item,score:words.reduce((n,w)=>n+(((item.title||'')+' '+(item.summary||'')).toLowerCase().includes(w)?1:0),0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,3).map(x=>x.item);
  }

  function openItem(item){
    if(!item||!eligible(item))return;
    const overlay=document.getElementById('library-overlay');
    if(!overlay)return;
    window.LibraryEngine?.recordLibraryView(item);
    document.getElementById('library-type').textContent=(item.content_type||'TEACHING').toUpperCase();
    document.getElementById('library-title').textContent=item.title||'';
    const body=item.body||item.summary||'This item is available as part of your current Path stage.';
    document.getElementById('library-body').innerHTML=paragraphs(body)+`<div class="source-note">ASCEND Path Library · ${esc(item.metadata?.source||'ASCEND curriculum')}</div>`;
    overlay.classList.remove('hidden');
  }

  function makeButton(item,context){
    const b=document.createElement('button');b.type='button';b.className='related-teaching';b.dataset.context=context;
    b.innerHTML=`<span class="related-teaching-mark">✦</span><span class="related-teaching-copy"><small>${context==='practice'?'RELATED TEACHING':'FOR THIS MONTH'}</small><strong>${esc(item.title)}</strong></span><span class="related-teaching-arrow">›</span>`;
    b.addEventListener('click',()=>openItem(item));return b;
  }

  function mountCurrentPractice(){
    document.getElementById('library-current-practice')?.remove();
    const filter=document.querySelector('.library-filter.active')?.dataset.libraryType||'all';
    if(filter!=='all'&&filter!=='practice')return;
    const practice=currentPractice(),list=document.getElementById('library-list');
    if(!practice||!list)return;
    const section=document.createElement('section');section.id='library-current-practice';section.className='library-current-practice';
    section.innerHTML=`<div class="eyebrow">CURRENT PRACTICE</div><button class="library-practice-card" type="button" aria-label="Open current practice ${esc(practice.title||'Practice')}"><small>MONTH ${currentMonth} · PRACTICE</small><strong>${esc(practice.title||window.currentStage?.title||'Current Practice')}</strong><span>${Number(practice.default_minutes)||10} min · Continue from Today</span><i aria-hidden="true">›</i></button>`;
    section.querySelector('button').addEventListener('click',()=>window.ASCENDOpenPractice?.());
    list.prepend(section);
  }

  function gateLibraryCards(){
    const c=window.curriculum;if(!c?.content?.length){mountCurrentPractice();return}
    document.querySelectorAll('#library-list .content-card,#library-recommended .content-card').forEach(card=>{
      const item=c.content.find(x=>x.slug===card.dataset.slug);if(!item)return;
      const needed=minMonth(item),locked=needed>currentMonth;
      if(locked&&card.closest('#library-recommended')){card.remove();return}
      card.classList.toggle('month-locked',locked);
      if(locked){card.classList.add('locked');card.setAttribute('aria-disabled','true');card.setAttribute('tabindex','-1');card.removeAttribute('role');card.innerHTML=`<small>LATER</small><strong>${esc(item.title)}</strong><span>Opens in Month ${needed}</span>`}
      else{card.classList.remove('locked');card.removeAttribute('aria-disabled');card.setAttribute('role','button');card.setAttribute('tabindex','0');card.setAttribute('aria-label',`Open ${item.title}`)}
    });
    const rail=document.getElementById('library-recommended');
    if(rail&&!rail.querySelector('.content-card'))rail.innerHTML='';
    mountCurrentPractice();
  }

  function render(){
    const items=relatedItems();
    document.querySelectorAll('.related-teaching').forEach(x=>x.remove());
    if(items.length){
      const instructions=document.getElementById('overlay-practice-instructions');
      if(instructions) instructions.after(makeButton(items[0],'practice'));
    }
    gateLibraryCards();
  }

  async function syncMonth(){try{currentMonth=Math.max(1,Math.min(24,Number((await window.ASCENDProgression?.current?.())?.month)||1))}catch{currentMonth=1}}
  let lastKey='';
  async function tick(){
    await syncMonth();
    const key=currentStageTitle()+'|'+currentMonth+'|'+(window.curriculum?.content?.length||0);
    if(key!==lastKey&&window.curriculum?.content?.length){lastKey=key;render()}else gateLibraryCards();
    setTimeout(tick,700);
  }
  document.querySelectorAll('.library-filter').forEach(button=>button.addEventListener('click',()=>setTimeout(mountCurrentPractice,0)));
  document.addEventListener('ascend:month',async event=>{currentMonth=Math.max(1,Math.min(24,Number(event.detail?.month)||currentMonth));lastKey='';render()});
  document.addEventListener('ascend:curriculum',()=>setTimeout(render,0));
  document.addEventListener('DOMContentLoaded',tick);
})();
