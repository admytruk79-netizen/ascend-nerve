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
  const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const paragraphs=(text='')=>String(text).split(/\n\s*\n|\n/).map(x=>x.trim()).filter(Boolean).map(p=>`<p>${esc(p)}</p>`).join('');
  const currentStageTitle=()=>document.getElementById('stage-title')?.textContent?.trim()||'';
  const minMonth=item=>{const exact=Number(item?.metadata?.month)||0;const minimum=Number(item?.metadata?.min_month)||0;return exact||minimum||1};

  function stageRule(item){
    const c=window.curriculum;
    const rules=(c?.contentRules||[]).filter(rule=>rule.content_id===item?.id);
    if(!rules.length)return{unlocked:true,label:'Available now'};
    const current=c?.stages?.find(stage=>stage.id===window.currentStage?.id);
    const required=rules.map(rule=>c.stages.find(stage=>stage.id===rule.stage_id)).filter(Boolean).sort((a,b)=>a.sort_order-b.sort_order)[0];
    const unlocked=!required||Number(current?.sort_order||1)>=Number(required.sort_order||1);
    return{unlocked,label:required?`Opens at ${required.title}`:'Opens later on the Path'};
  }
  function access(item){
    const stage=stageRule(item);
    if(!stage.unlocked)return stage;
    const needed=minMonth(item);
    if(needed>currentMonth)return{unlocked:false,label:`Opens in Month ${needed}`};
    return{unlocked:true,label:'Available now'};
  }
  window.ASCENDLibraryAccess={canOpen:item=>access(item).unlocked,describe:access,currentMonth:()=>currentMonth};

  function relatedItems(){const c=window.curriculum;if(!c?.content?.length)return[];const available=c.content.filter(item=>access(item).unlocked);const exact=available.filter(item=>Number(item?.metadata?.month)===currentMonth);if(exact.length)return exact.slice(0,3);const wanted=STAGE_MAP[currentStageTitle()]||[];const picked=wanted.map(slug=>available.find(x=>x.slug===slug)).filter(Boolean);if(picked.length)return picked;const words=(currentStageTitle()+' '+(document.getElementById('practice-name')?.textContent||'')).toLowerCase().split(/\W+/).filter(x=>x.length>4);return available.map(item=>({item,score:words.reduce((n,w)=>n+(((item.title||'')+' '+(item.summary||'')).toLowerCase().includes(w)?1:0),0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,3).map(x=>x.item)}
  function openItem(item){if(!item||!access(item).unlocked)return;const overlay=document.getElementById('library-overlay');if(!overlay)return;window.LibraryEngine?.recordLibraryView(item);const type=document.getElementById('library-reader-type');if(type)type.textContent=(item.content_type||'TEACHING').toUpperCase();const title=document.getElementById('library-title');if(title)title.textContent=item.title||'';const body=item.body||item.summary||'This item is available as part of your current Path stage.';document.getElementById('library-body').innerHTML=paragraphs(body)+`<div class="source-note">ASCEND Path Library · ${esc(item.metadata?.source||'ASCEND curriculum')}</div>`;overlay.classList.remove('hidden')}
  function makeButton(item){const b=document.createElement('button');b.type='button';b.className='related-teaching';b.innerHTML=`<span class="related-teaching-mark">✦</span><span class="related-teaching-copy"><small>RELATED TEACHING</small><strong>${esc(item.title)}</strong></span><span class="related-teaching-arrow">›</span>`;b.addEventListener('click',()=>openItem(item));return b}
  function applyAccess(){const c=window.curriculum;if(!c?.content?.length)return;document.querySelectorAll('#library-list .content-card,#library-recommended .content-card').forEach(card=>{const item=c.content.find(x=>x.slug===card.dataset.slug);if(!item)return;const state=access(item);card.classList.toggle('month-locked',!state.unlocked);card.classList.toggle('locked',!state.unlocked);if(!state.unlocked){if(card.closest('#library-recommended')){card.remove();return}card.setAttribute('aria-disabled','true');card.setAttribute('tabindex','-1');card.removeAttribute('role');card.innerHTML=`<small>LATER</small><strong>${esc(item.title)}</strong><span>${esc(state.label)}</span>`}else{card.removeAttribute('aria-disabled');card.setAttribute('role','button');card.setAttribute('tabindex','0');card.setAttribute('aria-label',`Open ${item.title}`)}});const rail=document.getElementById('library-recommended');if(rail&&!rail.querySelector('.content-card'))rail.innerHTML=''}
  async function syncMonth(){try{currentMonth=Math.max(1,Math.min(24,Number((await window.ASCENDProgression?.current?.())?.month)||1))}catch{currentMonth=1}}
  async function refresh(){await syncMonth();document.querySelectorAll('.related-teaching').forEach(x=>x.remove());const item=relatedItems()[0],instructions=document.getElementById('overlay-practice-instructions');if(item&&instructions)instructions.after(makeButton(item));applyAccess();document.dispatchEvent(new CustomEvent('ascend:library-access',{detail:{month:currentMonth}}))}

  document.addEventListener('ascend:curriculum',()=>queueMicrotask(refresh));
  document.addEventListener('ascend:month',event=>{currentMonth=Math.max(1,Math.min(24,Number(event.detail?.month)||currentMonth));queueMicrotask(refresh)});
  document.addEventListener('ascend:navigation',event=>{if(event.detail?.to==='library')queueMicrotask(refresh)});
  document.getElementById('library-search')?.addEventListener('input',()=>setTimeout(applyAccess,0));
  document.getElementById('library-type')?.addEventListener('click',()=>setTimeout(applyAccess,0));
  if(document.readyState==='complete')refresh();else window.addEventListener('load',refresh,{once:true});
})();
