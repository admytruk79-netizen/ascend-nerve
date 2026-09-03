import {Backend} from '../data/backend-adapter.js';

const REFLECTION_ART=[
  {src:'assets/seasonal-art/march-what-am-i-noticing.png',label:'What am I noticing?'},
  {src:'assets/seasonal-art/where-does-will-begin.png',label:'Where does will begin?'},
  {src:'assets/seasonal-art/truth-vs-imagination.png',label:'Truth vs imagination'},
  {src:'assets/seasonal-art/what-am-i-refusing.png',label:'What am I refusing?'},
  {src:'assets/seasonal-art/discipline-or-freedom.png',label:'Discipline or freedom?'}
];

const JOURNAL_FIELDS=['observation','inner_state','life_application','interpretation','unresolved'];

function ensureReflectionHost(screen,title){
  if(document.getElementById('reflection-art'))return;
  const gallery=document.createElement('section');
  gallery.id='reflection-art';
  gallery.className='ascend-reflection-art';
  gallery.setAttribute('aria-label','Reflection artwork');
  gallery.innerHTML=`<div class="ascend-reflection-hero"><img id="reflection-art-image" src="${REFLECTION_ART[0].src}" alt=""/><div><small>REFLECTION</small><strong id="reflection-art-label">${REFLECTION_ART[0].label}</strong></div></div><div class="ascend-reflection-choices" role="list" aria-label="Choose reflection artwork">${REFLECTION_ART.map((item,index)=>`<button type="button" data-reflection-index="${index}" class="${index===0?'active':''}" aria-label="${item.label}"><img src="${item.src}" alt=""/></button>`).join('')}</div>`;
  title?.after(gallery);
}

function organizeForm(){
  const form=document.getElementById('journal-form');
  if(!form||form.dataset.masterOrganized==='1')return;
  form.dataset.masterOrganized='1';
  const interpretation=form.querySelector('textarea[name="interpretation"]')?.closest('label');
  const unresolved=form.querySelector('textarea[name="unresolved"]')?.closest('label');
  const share=form.querySelector('.journal-share-teacher');
  const save=form.querySelector('button.primary,button[type="submit"]');
  if(save&&(interpretation||unresolved||share)){
    const details=document.createElement('details');
    details.className='ascend-deeper-reflection';
    details.innerHTML='<summary>Deeper reflection <span>Interpretation · unresolved · teacher sharing</span></summary>';
    if(interpretation)details.append(interpretation);
    if(unresolved)details.append(unresolved);
    if(share)details.append(share);
    form.insertBefore(details,save);
  }
}

function bindReflectionArt(){
  const screen=document.getElementById('journal');
  if(!screen||screen.dataset.reflectionBound==='1')return;
  screen.dataset.reflectionBound='1';
  screen.addEventListener('click',event=>{
    const choice=event.target.closest('[data-reflection-index]');
    if(!choice)return;
    const item=REFLECTION_ART[Number(choice.dataset.reflectionIndex)];
    if(!item)return;
    const image=document.getElementById('reflection-art-image');
    const label=document.getElementById('reflection-art-label');
    if(image)image.src=item.src;
    if(label)label.textContent=item.label;
    document.querySelectorAll('[data-reflection-index]').forEach(button=>button.classList.toggle('active',button===choice));
  });
}

function setSync(text,online=false){
  const node=document.getElementById('sync-state');
  if(!node)return;
  node.textContent=text;
  node.classList.toggle('online',online);
}

function entryFromForm(form){
  const values=new FormData(form);
  const entry={created_at:new Date().toISOString()};
  for(const[k,v]of values.entries())entry[k]=String(v).trim();
  return entry;
}

function hasMeaningfulContent(form){
  return JOURNAL_FIELDS.some(name=>String(form.elements?.namedItem(name)?.value||'').trim().length>0);
}

function currentProgress(){
  const rows=Array.isArray(window.__pathProgress)?window.__pathProgress:[];
  return rows.find(row=>row.status==='active'||row.status==='review')||rows[rows.length-1]||null;
}

function saveLocal(entry){
  try{
    const state=JSON.parse(localStorage.getItem('ascendPathState')||'{}');
    state.entries=Array.isArray(state.entries)?state.entries:[];
    state.entries.push(entry);
    localStorage.setItem('ascendPathState',JSON.stringify(state));
    return true;
  }catch(error){
    console.warn('ASCEND local Journal fallback failed',error);
    return false;
  }
}

async function persistJournal(form,status){
  const entry=entryFromForm(form);
  if(Backend.isSignedIn()){
    try{
      setSync('SYNCING…');
      const progress=currentProgress();
      const userId=progress?.user_id||(await Backend.me())?.id||null;
      const stageId=progress?.stage_id||window.currentStage?.id||null;
      if(!userId||!stageId)throw new Error('ASCEND is still loading your current stage.');
      if(typeof Backend.raw?.saveJournal!=='function')throw new Error('Journal persistence is unavailable.');
      await Backend.saveJournal(userId,stageId,entry);
      status.textContent='Reflection saved privately to your ASCEND Path journal.';
      setSync('SYNCED',true);
      form.reset();
      window.ASCENDMirror?.load?.('stage');
      document.dispatchEvent(new CustomEvent('ascend:journal-saved',{detail:{remote:true,stageId}}));
      requestAnimationFrame(()=>window.ASCENDUX?.activateScreen?.('today'));
      return;
    }catch(error){
      console.error('ASCEND remote Journal save failed',error);
    }
  }

  const saved=saveLocal(entry);
  status.textContent=Backend.isSignedIn()
    ?(saved?'Connection unavailable. Reflection saved on this device and can be synchronized later.':'Reflection could not be saved. Please keep this page open and try again.')
    :(saved?'Reflection saved privately on this device. Sign in to synchronize it.':'Reflection could not be saved on this device.');
  setSync(saved?'LOCAL':'UNSAVED');
  if(saved)form.reset();
  document.dispatchEvent(new CustomEvent('ascend:journal-saved',{detail:{remote:false,saved}}));
}

async function saveFromMaster(form,status){
  if(form.dataset.masterSaving==='1')return;
  if(!hasMeaningfulContent(form)){
    status.textContent='Write at least one observation before saving this reflection.';
    form.elements?.namedItem('observation')?.focus?.();
    return;
  }
  form.dataset.masterSaving='1';
  try{await persistJournal(form,status)}finally{delete form.dataset.masterSaving}
}

function bindPersistence(screen){
  const form=document.getElementById('journal-form');
  if(!form||screen.dataset.masterPersistence==='1')return;
  screen.dataset.masterPersistence='1';
  form.dataset.remoteAuthority='true';
  const status=document.getElementById('journal-status');
  const save=form.querySelector('button.primary,button[type="submit"]');
  if(save){
    save.type='button';
    save.dataset.masterJournalSave='true';
  }

  screen.addEventListener('click',event=>{
    const button=event.target.closest('[data-master-journal-save],#journal-form button.primary');
    if(!button||!screen.contains(button))return;
    event.preventDefault();
    event.stopImmediatePropagation();
    saveFromMaster(form,status);
  },true);

  form.addEventListener('submit',event=>{
    event.preventDefault();
    event.stopImmediatePropagation();
    saveFromMaster(form,status);
  },true);
}

export function initJournal(){
  const screen=document.getElementById('journal');if(!screen)return;
  const eyebrow=screen.querySelector(':scope>.eyebrow');
  const title=screen.querySelector(':scope>h1');
  if(eyebrow)eyebrow.textContent='OBSERVE · REFLECT · INTEGRATE';
  if(title)title.textContent='Journal';
  ensureReflectionHost(screen,title);
  organizeForm();
  bindReflectionArt();
  bindPersistence(screen);
}
