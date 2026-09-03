import {Backend} from '../data/backend-adapter.js';

const REFLECTION_ART=[
  {src:'assets/seasonal-art/march-what-am-i-noticing.png',label:'What am I noticing?'},
  {src:'assets/seasonal-art/where-does-will-begin.png',label:'Where does will begin?'},
  {src:'assets/seasonal-art/truth-vs-imagination.png',label:'Truth vs imagination'},
  {src:'assets/seasonal-art/what-am-i-refusing.png',label:'What am I refusing?'},
  {src:'assets/seasonal-art/discipline-or-freedom.png',label:'Discipline or freedom?'}
];

const JOURNAL_FIELDS=['observation','inner_state','life_application','interpretation','unresolved'];
let persistenceContext={userId:null,stageId:null};

function ensureReflectionHost(screen,title){
  if(document.getElementById('reflection-art'))return;
  const gallery=document.createElement('section');
  gallery.id='reflection-art';
  gallery.className='ascend-reflection-art';
  gallery.setAttribute('aria-label','Reflection artwork');
  gallery.innerHTML=`<div class="ascend-reflection-hero"><img id="reflection-art-image" src="${REFLECTION_ART[0].src}" alt=""/><div><small>REFLECTION</small><strong id="reflection-art-label">${REFLECTION_ART[0].label}</strong></div></div><div class="ascend-reflection-choices" role="list" aria-label="Choose reflection artwork">${REFLECTION_ART.map((item,index)=>`<button type="button" data-reflection-index="${index}" class="${index===0?'active':''}" aria-label="${item.label}"><img src="${item.src}" alt=""/></button>`).join('')}</div>`;
  title?.after(gallery);
}

function ensureHistoryHost(screen){
  let host=document.getElementById('journal-history');
  if(host)return host;
  host=document.createElement('section');
  host.id='journal-history';
  host.className='journal-history';
  host.setAttribute('aria-labelledby','journal-history-title');
  const heading=document.createElement('div');
  heading.className='pathway-section-header';
  heading.innerHTML='<div><strong id="journal-history-title">Journal History</strong><span>Review saved observations and reflections</span></div>';
  const list=document.createElement('div');
  list.id='journal-history-list';
  list.setAttribute('aria-live','polite');
  host.append(heading,list);
  screen.append(host);
  return host;
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

function refreshPersistenceContext(){
  const progress=currentProgress();
  persistenceContext={
    userId:progress?.user_id||persistenceContext.userId||null,
    stageId:progress?.stage_id||window.currentStage?.id||persistenceContext.stageId||null
  };
  const form=document.getElementById('journal-form');
  if(form){
    form.dataset.masterUserId=persistenceContext.userId||'';
    form.dataset.masterStageId=persistenceContext.stageId||'';
  }
  return persistenceContext;
}

function localEntries(){
  try{
    const state=JSON.parse(localStorage.getItem('ascendPathState')||'{}');
    return Array.isArray(state.entries)?state.entries:[];
  }catch{return[]}
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

function journalDate(entry){
  const raw=entry.entry_date||entry.created_at;
  if(!raw)return 'Saved reflection';
  const date=new Date(raw.length===10?`${raw}T12:00:00`:raw);
  if(Number.isNaN(date.getTime()))return String(raw);
  return new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric',year:'numeric'}).format(date);
}

function firstMeaningful(entry){
  return JOURNAL_FIELDS.map(name=>String(entry?.[name]||'').trim()).find(Boolean)||'Saved reflection';
}

function appendReflection(list,entry,{local=false}={}){
  const details=document.createElement('details');
  details.className='rhythm-card journal-history-entry';
  const summary=document.createElement('summary');
  const title=document.createElement('strong');
  title.textContent=journalDate(entry);
  const preview=document.createElement('span');
  preview.textContent=firstMeaningful(entry).slice(0,120);
  summary.append(title,preview);
  details.append(summary);
  const body=document.createElement('div');
  body.className='journal-history-body';
  for(const[name,label]of [['observation','Observation'],['inner_state','Inner State'],['life_application','Life Application'],['interpretation','Interpretation'],['unresolved','Unresolved']]){
    const value=String(entry?.[name]||'').trim();
    if(!value)continue;
    const section=document.createElement('section');
    const heading=document.createElement('strong');
    heading.textContent=label;
    const paragraph=document.createElement('p');
    paragraph.textContent=value;
    section.append(heading,paragraph);
    body.append(section);
  }
  if(local){
    const note=document.createElement('small');
    note.textContent='Saved on this device · awaiting synchronization';
    body.append(note);
  }
  details.append(body);
  list.append(details);
}

async function loadHistory(){
  const list=document.getElementById('journal-history-list');
  if(!list)return;
  list.replaceChildren();
  const context=refreshPersistenceContext();
  const locals=localEntries().slice().reverse();
  let remote=[];
  if(Backend.isSignedIn()){
    try{
      let userId=context.userId;
      if(!userId)userId=(await Backend.me())?.id||null;
      if(userId){
        persistenceContext.userId=userId;
        remote=await Backend.journalEntries(userId,20);
      }
    }catch(error){console.warn('ASCEND Journal history unavailable',error)}
  }
  if(!remote.length&&!locals.length){
    const empty=document.createElement('p');
    empty.className='quiet-note';
    empty.textContent='Your saved reflections will appear here.';
    list.append(empty);
    return;
  }
  remote.forEach(entry=>appendReflection(list,entry));
  locals.forEach(entry=>appendReflection(list,entry,{local:true}));
}

async function persistJournal(form,status){
  const entry=entryFromForm(form);
  if(Backend.isSignedIn()){
    try{
      setSync('SYNCING…');
      const context=refreshPersistenceContext();
      let userId=context.userId;
      const stageId=context.stageId;
      if(!userId)userId=(await Backend.me())?.id||null;
      if(userId)persistenceContext.userId=userId;
      if(!userId||!stageId)throw new Error('ASCEND is still loading your current stage.');
      if(typeof Backend.raw?.saveJournal!=='function')throw new Error('Journal persistence is unavailable.');
      await Backend.saveJournal(userId,stageId,entry);
      status.textContent='Reflection saved privately to your ASCEND Path journal.';
      setSync('SYNCED',true);
      form.reset();
      window.ASCENDMirror?.load?.('stage');
      await loadHistory();
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
  if(saved)await loadHistory();
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
  refreshPersistenceContext();
  const status=document.getElementById('journal-status');
  const save=form.querySelector('button.primary,button[type="submit"]');
  if(save){
    save.id='journal-save';
    save.type='button';
    save.dataset.masterJournalSave='true';
    save.addEventListener('click',event=>{
      event.preventDefault();
      event.stopImmediatePropagation();
      saveFromMaster(form,status);
    });
  }

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
  ensureHistoryHost(screen);
  bindReflectionArt();
  bindPersistence(screen);
  document.addEventListener('ascend:screen',event=>{
    if(event.detail?.screen!=='journal')return;
    refreshPersistenceContext();
    loadHistory();
  });
}
