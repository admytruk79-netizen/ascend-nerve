const SEASONAL_ART={
  spring:['self-observation-humility.png','march-focused-thought.png','march-object-contemplation.png','march-reverence-patience.png','march-what-am-i-noticing.png','spring-march-awakening-perception.png','spring-april-clarifying-the-will.png','discipline-or-freedom.png'],
  summer:['heart-opening.png','july-discipline-fire.png','may-openness-readiness.png','openness-readiness.png','self-control-gentleness.png','where-does-will-begin.png','april-where-does-will-begin.png','april-training-the-will.png'],
  autumn:['august-presence-devotion.png','june-gathering-energy.png','confidence-humanity.png','mastery-of-feeling.png','presence-devotion.png','what-am-i-refusing.png','morning-evening-energy.png','april-deliberate-action.png'],
  winter:['building-or-draining.png','emotional-composure.png','may-ready-to-release.png','ready-to-release.png','may-truth-vs-imagination.png','truth-vs-imagination.png','spring-may-crossing-the-threshold.png','star-energy-practice.png','two-currents-meeting.png','acceptance-practice.png']
};

let currentMonth=1;
let query='';
let type='all';

const esc=(value='')=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const minMonth=item=>Math.max(1,Number(item?.metadata?.month)||Number(item?.metadata?.min_month)||1);
const eligible=item=>minMonth(item)<=currentMonth;

function seasonForMonth(month){
  const value=Math.max(1,Math.min(24,Number(month)||1));
  return value<=6?'spring':value<=12?'summer':value<=18?'autumn':'winter';
}

function hashSlug(value=''){
  let hash=0;
  for(let index=0;index<value.length;index++)hash=(hash*31+value.charCodeAt(index))|0;
  return Math.abs(hash);
}

function artFor(item){
  const images=SEASONAL_ART[seasonForMonth(minMonth(item))]||[];
  if(!images.length)return null;
  return images[hashSlug(item?.slug||item?.id||item?.title||'library')%images.length];
}

function ensureReaderStructure(){
  const body=document.getElementById('library-body');
  if(!body||document.getElementById('library-title'))return;
  const header=document.createElement('header');
  header.className='library-reader-header';
  header.innerHTML='<div id="library-reader-type" class="eyebrow">TEACHING</div><h1 id="library-title">Library</h1>';
  body.before(header);
}

function paragraphs(text=''){
  return String(text).split(/\n\s*\n|\n/).map(value=>value.trim()).filter(Boolean).map(value=>`<p>${esc(value)}</p>`).join('');
}

function openItem(item){
  if(!item||!eligible(item))return;
  const overlay=document.getElementById('library-overlay');
  if(!overlay)return;
  window.LibraryEngine?.recordLibraryView?.(item);
  const readerType=document.getElementById('library-reader-type');
  const title=document.getElementById('library-title');
  const body=document.getElementById('library-body');
  if(readerType)readerType.textContent=String(item.content_type||'teaching').toUpperCase();
  if(title)title.textContent=item.title||'Library';
  if(body){
    const copy=item.body||item.summary||'This item is available as part of your current Path month.';
    body.innerHTML=paragraphs(copy)+`<div class="source-note">ASCEND Path Library · ${esc(item.metadata?.source||'ASCEND curriculum')}</div>`;
  }
  overlay.classList.remove('hidden');
  overlay.setAttribute('aria-hidden','false');
}

function card(item,{recommended=false}={}){
  const node=document.createElement('article');
  const locked=!eligible(item);
  node.className='content-card'+(locked?' locked':'');
  if(item.slug)node.dataset.slug=item.slug;
  const image=artFor(item);
  if(locked){
    node.setAttribute('aria-disabled','true');
    node.setAttribute('tabindex','-1');
    node.innerHTML=`<small>LATER</small><strong>${esc(item.title)}</strong><span>Opens in Month ${minMonth(item)}</span>`;
    return node;
  }
  node.setAttribute('role','button');
  node.setAttribute('tabindex','0');
  node.setAttribute('aria-label',`Open ${item.title}`);
  node.innerHTML=`${image?`<div class="content-card-art" style="background-image:url('assets/seasonal-art/${image}')"></div>`:''}<small>${esc(String(item.content_type||'teaching').toUpperCase())}</small><strong>${esc(item.title)}</strong><span>${esc(item.summary||'Available now')}</span>`;
  const activate=()=>openItem(item);
  node.addEventListener('click',activate);
  node.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();activate()}});
  if(recommended)node.dataset.libraryRecommended='true';
  return node;
}

function localJournalText(){
  try{
    const state=JSON.parse(localStorage.getItem('ascendPathState')||'{}');
    const entries=Array.isArray(state.entries)?state.entries.slice(-8):[];
    return entries.map(entry=>[entry.observation,entry.inner_state,entry.life_application,entry.interpretation,entry.unresolved].filter(Boolean).join(' ')).join(' ');
  }catch{return''}
}

function currentMonthItems(content){
  return content.filter(item=>Number(item?.metadata?.month)===currentMonth&&eligible(item));
}

function relatedItems(content){
  const exact=currentMonthItems(content);
  if(exact.length)return exact;
  return content.filter(eligible).sort((a,b)=>minMonth(b)-minMonth(a));
}

function renderRelatedTeaching(content){
  document.querySelectorAll('.related-teaching[data-owner="master-library"]').forEach(node=>node.remove());
  const item=relatedItems(content).find(entry=>entry.content_type==='teaching'||entry.content_type==='reference')||relatedItems(content)[0];
  const instructions=document.getElementById('overlay-practice-instructions');
  if(!item||!instructions)return;
  const button=document.createElement('button');
  button.type='button';
  button.className='related-teaching';
  button.dataset.owner='master-library';
  button.innerHTML=`<span class="related-teaching-mark">✦</span><span class="related-teaching-copy"><small>RELATED TEACHING</small><strong>${esc(item.title)}</strong></span><span class="related-teaching-arrow">›</span>`;
  button.addEventListener('click',()=>openItem(item));
  instructions.after(button);
}

function renderRecommended(content){
  const host=document.getElementById('library-recommended');
  if(!host)return;
  host.replaceChildren();
  if(query||type!=='all')return;
  const exact=currentMonthItems(content);
  const pool=exact.length?exact:content.filter(eligible);
  if(!pool.length)return;
  const picks=window.LibraryEngine?.recommend
    ?window.LibraryEngine.recommend(pool,{history:window.LibraryEngine.loadLibraryHistory?.()||[],journalText:localJournalText(),n:3})
    :pool.slice(0,3);
  if(!picks.length)return;
  const heading=document.createElement('div');
  heading.className='eyebrow';
  heading.textContent=exact.length?'FOR YOUR CURRENT MONTH':'RECOMMENDED FOR YOU';
  host.append(heading);
  picks.forEach(item=>host.append(card(item,{recommended:true})));
}

function renderBrowse(content){
  const list=document.getElementById('library-list');
  const count=document.getElementById('library-count');
  const label=document.getElementById('library-list-label');
  if(!list)return;
  list.replaceChildren();
  const normalized=query.trim().toLowerCase();
  const typed=content.filter(item=>type==='all'||item.content_type===type);
  const visible=typed.filter(item=>!normalized||[item.title,item.summary,item.content_type].some(value=>String(value||'').toLowerCase().includes(normalized)));
  const grouped=!normalized&&type==='all';
  if(grouped){
    [['teaching','Teachings'],['practice','Practices'],['reading','Readings'],['reference','References']].forEach(([kind,title])=>{
      const items=visible.filter(item=>item.content_type===kind);
      if(!items.length)return;
      const details=document.createElement('details');
      details.className='library-group';
      const summary=document.createElement('summary');
      summary.innerHTML=`<span>${title}</span><small>${items.length}</small>`;
      const wrap=document.createElement('div');
      wrap.className='library-group-items';
      items.forEach(item=>wrap.append(card(item)));
      details.append(summary,wrap);
      list.append(details);
    });
  }else{
    visible.forEach(item=>list.append(card(item)));
  }
  if(!visible.length)list.innerHTML='<div class="empty-state"><h2>No matching teaching</h2><p>Try another word or content type.</p></div>';
  if(count)count.textContent=`${visible.length} of ${content.length} Library items`;
  if(label){
    label.textContent=grouped?'BROWSE LIBRARY':'RESULTS';
    label.classList.remove('hidden');
  }
}

async function syncMonth(){
  try{
    currentMonth=Math.max(1,Math.min(24,Number((await window.ASCENDProgression?.current?.())?.month)||1));
  }catch{currentMonth=1}
}

async function render(){
  await syncMonth();
  const content=Array.isArray(window.curriculum?.content)?window.curriculum.content:[];
  renderRecommended(content);
  renderBrowse(content);
  renderRelatedTeaching(content);
  const screen=document.getElementById('library');
  if(screen)screen.dataset.currentMonth=String(currentMonth);
}

function bindControls(screen){
  if(screen.dataset.libraryControlsBound==='1')return;
  screen.dataset.libraryControlsBound='1';
  const search=document.getElementById('library-search');
  if(search)search.addEventListener('input',event=>{query=event.target.value||'';render()});
  document.getElementById('library-type')?.addEventListener('click',event=>{
    const button=event.target.closest('[data-library-type]');
    if(!button)return;
    type=button.dataset.libraryType||'all';
    document.querySelectorAll('[data-library-type]').forEach(node=>node.classList.toggle('active',node===button));
    render();
  });
}

export function initLibrary(){
  const screen=document.getElementById('library');
  if(!screen)return;
  const eyebrow=screen.querySelector(':scope>.eyebrow');
  const title=screen.querySelector(':scope>h1');
  if(eyebrow)eyebrow.textContent='FOR YOUR CURRENT MONTH';
  if(title)title.textContent='Library';
  screen.dataset.libraryOwner='master';
  ensureReaderStructure();
  bindControls(screen);
  window.ASCENDLibrary={render,openItem};
  document.addEventListener('ascend:screen',event=>{if(event.detail?.screen==='library')render()});
  document.addEventListener('ascend:month',render);
  document.addEventListener('ascend:curriculum',render);
  render();
}
