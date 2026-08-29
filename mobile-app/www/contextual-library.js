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
    .library-now,.library-deeper{margin:4px 0 22px}.library-now-head,.library-deeper-head,.library-reference-head{display:flex;align-items:end;justify-content:space-between;gap:16px;margin:0 2px 10px}.library-now-head strong,.library-deeper-head strong,.library-reference-head strong{font:18px Georgia,serif;font-weight:400;color:var(--gold2)}.library-now-head span,.library-deeper-head span,.library-reference-head span{font:10px Arial,sans-serif;color:var(--muted);text-align:right}
    .library-now-grid,.library-deeper-grid{display:grid;gap:9px}.library-now-card,.library-deeper-card{width:100%;display:grid;grid-template-columns:1fr auto;gap:4px 12px;align-items:center;text-align:left;padding:14px 15px;border:1px solid var(--line);border-radius:16px;background:var(--panel);color:var(--ivory);font:inherit}.library-now-card{border-color:rgba(85,200,189,.28);background:linear-gradient(135deg,rgba(85,200,189,.075),var(--panel))}.library-now-card small,.library-deeper-card small{grid-column:1;color:var(--teal);font:8px Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase}.library-now-card strong,.library-deeper-card strong{grid-column:1;font-size:15px;font-weight:500}.library-now-card span,.library-deeper-card span{grid-column:1;color:var(--muted);font:11px/1.45 Arial,sans-serif}.library-now-card i,.library-deeper-card i{grid-column:2;grid-row:1/4;font-style:normal;font-size:22px;color:var(--teal)}
    .library-current-practice{margin:0 0 9px}.library-practice-card{width:100%;display:grid;grid-template-columns:1fr auto;gap:5px 14px;align-items:center;text-align:left;padding:15px 16px;border:1px solid rgba(214,179,106,.27);border-radius:16px;background:linear-gradient(135deg,rgba(214,179,106,.07),var(--panel));color:var(--ivory);font:inherit}.library-practice-card small{grid-column:1;color:var(--gold);font:8px Arial,sans-serif;letter-spacing:.13em}.library-practice-card strong{grid-column:1;font-size:15px;font-weight:500}.library-practice-card span{grid-column:1;color:var(--muted);font-size:11px}.library-practice-card i{grid-column:2;grid-row:1/4;font-style:normal;font-size:24px;color:var(--gold2)}
    .library-practice-card:focus-visible,.library-now-card:focus-visible,.library-deeper-card:focus-visible{outline:2px solid var(--teal);outline-offset:3px}
    .library-reference{margin-top:26px;padding-top:20px;border-top:1px solid rgba(214,179,106,.14)}
    #library-recommended{display:none!important}
  `;
  document.head.appendChild(style);

  const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const paragraphs=(text='')=>String(text).split(/\n\s*\n|\n/).map(x=>x.trim()).filter(Boolean).map(p=>`<p>${esc(p)}</p>`).join('');
  const currentStageTitle=()=>window.currentStage?.title||document.getElementById('profile-stage')?.textContent?.trim()||'';
  const minMonth=item=>Number(item?.metadata?.month)||Number(item?.metadata?.min_month)||1;
  const eligible=item=>minMonth(item)<=currentMonth;
  function currentPractice(){const c=window.curriculum,stage=window.currentStage;if(!c||!stage)return null;const link=c.links?.find(item=>item.stage_id===stage.id&&item.role==='primary');return link?c.practices?.find(item=>item.id===link.practice_id)||null:null}
  function relatedItems(){
    const c=window.curriculum;if(!c?.content?.length)return[];
    const exact=c.content.filter(item=>Number(item?.metadata?.month)===currentMonth&&eligible(item));if(exact.length)return exact.slice(0,3);
    const wanted=STAGE_MAP[currentStageTitle()]||[];const picked=wanted.map(slug=>c.content.find(x=>x.slug===slug)).filter(item=>item&&eligible(item));if(picked.length)return picked.slice(0,3);
    const words=currentStageTitle().toLowerCase().split(/\W+/).filter(x=>x.length>4);
    return c.content.filter(eligible).map(item=>({item,score:words.reduce((n,w)=>n+(((item.title||'')+' '+(item.summary||'')).toLowerCase().includes(w)?1:0),0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,3).map(x=>x.item);
  }
  function deeperItems(exclude=[]){
    const c=window.curriculum;if(!c?.content?.length)return[];const blocked=new Set(exclude.map(x=>x.id));
    const preference={teaching:0,reading:1,practice:2,reference:3};
    return c.content.filter(item=>eligible(item)&&!blocked.has(item.id)).sort((a,b)=>(preference[a.content_type]??9)-(preference[b.content_type]??9)||minMonth(b)-minMonth(a)).slice(0,4);
  }
  function openItem(item){
    if(!item||!eligible(item))return;const overlay=document.getElementById('library-overlay');if(!overlay)return;
    window.LibraryEngine?.recordLibraryView(item);document.getElementById('library-type').textContent=(item.content_type||'TEACHING').toUpperCase();document.getElementById('library-title').textContent=item.title||'';
    const body=item.body||item.summary||'This item is available as part of your current Path stage.';document.getElementById('library-body').innerHTML=paragraphs(body)+`<div class="source-note">ASCEND Path Library · ${esc(item.metadata?.source||'ASCEND curriculum')}</div>`;overlay.classList.remove('hidden');
  }
  function makeItemButton(item,kind='now'){
    const b=document.createElement('button');b.type='button';b.className=kind==='now'?'library-now-card':'library-deeper-card';b.dataset.slug=item.slug||'';
    b.innerHTML=`<small>${kind==='now'?'FOR WHERE YOU ARE NOW':'GO DEEPER'} · ${(item.content_type||'teaching').toUpperCase()}</small><strong>${esc(item.title)}</strong><span>${esc(item.summary||'Available for your current formation')}</span><i aria-hidden="true">›</i>`;b.addEventListener('click',()=>openItem(item));return b;
  }
  function makeRelatedButton(item){const b=document.createElement('button');b.type='button';b.className='related-teaching';b.innerHTML=`<span class="related-teaching-mark">✦</span><span class="related-teaching-copy"><small>RELATED TEACHING</small><strong>${esc(item.title)}</strong></span><span class="related-teaching-arrow">›</span>`;b.addEventListener('click',()=>openItem(item));return b}
  function gateLibraryCards(){
    const c=window.curriculum;if(!c?.content?.length)return;
    document.querySelectorAll('#library-list .content-card').forEach(card=>{const item=c.content.find(x=>x.slug===card.dataset.slug);if(!item)return;const needed=minMonth(item),locked=needed>currentMonth;card.classList.toggle('month-locked',locked);if(locked){card.classList.add('locked');card.setAttribute('aria-disabled','true');card.setAttribute('tabindex','-1');card.removeAttribute('role');card.innerHTML=`<small>LATER</small><strong>${esc(item.title)}</strong><span>Opens in Month ${needed}</span>`}else{card.classList.remove('locked');card.removeAttribute('aria-disabled');card.setAttribute('role','button');card.setAttribute('tabindex','0');card.setAttribute('aria-label',`Open ${item.title}`)}});
  }
  function renderLibraryLayers(){
    const library=document.getElementById('library'),list=document.getElementById('library-list');if(!library||!list||!window.curriculum)return;
    document.getElementById('library-now')?.remove();document.getElementById('library-deeper')?.remove();document.getElementById('library-reference-head')?.remove();
    const filter=document.querySelector('.library-filter.active')?.dataset.libraryType||'all';if(filter!=='all'){gateLibraryCards();return}
    const nowItems=relatedItems(),deepItems=deeperItems(nowItems),anchor=document.getElementById('library-list-label')||list;
    const now=document.createElement('section');now.id='library-now';now.className='library-now';now.innerHTML='<div class="library-now-head"><strong>For where I am now</strong><span>Practice and support for this formation</span></div><div class="library-now-grid"></div>';
    const grid=now.querySelector('.library-now-grid'),practice=currentPractice();if(practice){const wrap=document.createElement('div');wrap.className='library-current-practice';wrap.innerHTML=`<button class="library-practice-card" type="button"><small>MONTH ${currentMonth} · CURRENT PRACTICE</small><strong>${esc(practice.title||window.currentStage?.title||'Current Practice')}</strong><span>${Number(practice.default_minutes)||10} min · Continue from Today</span><i aria-hidden="true">›</i></button>`;wrap.querySelector('button').addEventListener('click',()=>window.ASCENDOpenPractice?.());grid.appendChild(wrap)}nowItems.forEach(item=>grid.appendChild(makeItemButton(item,'now')));anchor.before(now);
    if(deepItems.length){const deeper=document.createElement('section');deeper.id='library-deeper';deeper.className='library-deeper';deeper.innerHTML='<div class="library-deeper-head"><strong>Go deeper</strong><span>Optional material already open to you</span></div><div class="library-deeper-grid"></div>';deepItems.forEach(item=>deeper.querySelector('.library-deeper-grid').appendChild(makeItemButton(item,'deeper')));anchor.before(deeper)}
    const ref=document.createElement('div');ref.id='library-reference-head';ref.className='library-reference library-reference-head';ref.innerHTML='<strong>Reference library</strong><span>Browse all available material by type</span>';anchor.before(ref);if(anchor.id==='library-list-label')anchor.textContent='BROWSE BY TYPE';gateLibraryCards();
  }
  async function render(){
    await syncMonth();document.querySelectorAll('.related-teaching').forEach(x=>x.remove());const items=relatedItems();if(items.length){const instructions=document.getElementById('overlay-practice-instructions');if(instructions)instructions.after(makeRelatedButton(items[0]))}renderLibraryLayers();
  }
  async function syncMonth(){try{currentMonth=Math.max(1,Math.min(24,Number((await window.ASCENDProgression?.current?.())?.month)||1))}catch{currentMonth=1}}
  document.querySelectorAll('.library-filter').forEach(button=>button.addEventListener('click',()=>setTimeout(renderLibraryLayers,0)));
  document.querySelector('.bottom-nav [data-screen="library"]')?.addEventListener('click',()=>setTimeout(render,0));
  document.addEventListener('ascend:month',event=>{currentMonth=Math.max(1,Math.min(24,Number(event.detail?.month)||currentMonth));render()});
  document.addEventListener('ascend:curriculum',()=>{if(document.getElementById('library')?.classList.contains('active'))render()});
  window.ASCENDContextualLibrary={render,openItem};
})();
