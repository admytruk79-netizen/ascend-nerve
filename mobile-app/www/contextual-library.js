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

  function currentStageTitle(){return document.getElementById('profile-stage')?.textContent?.trim()||document.getElementById('stage-title')?.textContent?.trim()||''}
  function minMonth(item){const exact=Number(item?.metadata?.month)||0;const minimum=Number(item?.metadata?.min_month)||0;return exact||minimum||1}
  function eligible(item){return minMonth(item)<=currentMonth}

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
    const type=document.getElementById('library-overlay-type');
    if(type)type.textContent=(item.content_type||'TEACHING').toUpperCase();
    const title=document.getElementById('library-title');
    if(title)title.textContent=item.title||'';
    const body=item.body||item.summary||'This item is available as part of your current Path stage.';
    const bodyEl=document.getElementById('library-body');
    if(bodyEl)bodyEl.innerHTML=paragraphs(body)+`<div class="source-note">ASCEND Path Library · ${esc(item.metadata?.source||'ASCEND curriculum')}</div>`;
    overlay.classList.remove('hidden');
  }

  function makeButton(item,context){
    const b=document.createElement('button');
    b.type='button';
    b.className='related-teaching';
    b.dataset.context=context;
    b.innerHTML=`<span class="related-teaching-mark">✦</span><span class="related-teaching-copy"><small>${context==='practice'?'RELATED TEACHING':'FOR THIS MONTH'}</small><strong>${esc(item.title)}</strong></span><span class="related-teaching-arrow">›</span>`;
    b.addEventListener('click',()=>openItem(item));
    return b;
  }

  function gateLibraryCards(){
    const c=window.curriculum;
    if(!c?.content?.length)return;
    document.querySelectorAll('#library-list .content-card,#library-recommended .content-card').forEach(card=>{
      const item=c.content.find(x=>x.slug===card.dataset.slug);
      if(!item)return;
      const needed=minMonth(item),locked=needed>currentMonth;
      if(locked&&card.closest('#library-recommended')){card.remove();return}
      card.classList.toggle('month-locked',locked);
      if(locked){
        card.classList.add('locked');
        card.setAttribute('aria-disabled','true');
        card.setAttribute('tabindex','-1');
        card.removeAttribute('role');
        card.innerHTML=`<small>LATER</small><strong>${esc(item.title)}</strong><span>Opens in Month ${needed}</span>`;
      }else{
        card.classList.remove('locked');
        card.removeAttribute('aria-disabled');
        card.setAttribute('role','button');
        card.setAttribute('tabindex','0');
        card.setAttribute('aria-label',`Open ${item.title}`);
      }
    });
    const rail=document.getElementById('library-recommended');
    if(rail&&!rail.querySelector('.content-card'))rail.innerHTML='';
  }

  function renderRelatedTeaching(){
    document.querySelectorAll('.related-teaching').forEach(x=>x.remove());
    const item=relatedItems()[0];
    if(!item)return;
    const instructions=document.getElementById('overlay-practice-instructions');
    if(instructions)instructions.after(makeButton(item,'practice'));
  }

  function render(){
    renderRelatedTeaching();
    gateLibraryCards();
  }

  async function syncMonth(){
    try{currentMonth=Math.max(1,Math.min(24,Number((await window.ASCENDProgression?.current?.())?.month)||1))}
    catch{currentMonth=1}
  }

  async function syncAndRender(){
    await syncMonth();
    render();
  }

  document.addEventListener('ascend:month',event=>{
    currentMonth=Math.max(1,Math.min(24,Number(event.detail?.month)||currentMonth));
    render();
  });
  document.addEventListener('ascend:curriculum',syncAndRender);
  document.addEventListener('DOMContentLoaded',syncAndRender,{once:true});
  window.ASCENDContextualLibrary={render:syncAndRender};
})();
