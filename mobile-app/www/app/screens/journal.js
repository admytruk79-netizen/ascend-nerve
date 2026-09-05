import {Backend} from '../data/backend-adapter.js';

const REFLECTION_ART=[
  {src:'assets/seasonal-art/march-what-am-i-noticing.png',label:'What am I noticing?'},
  {src:'assets/seasonal-art/where-does-will-begin.png',label:'Where does will begin?'},
  {src:'assets/seasonal-art/truth-vs-imagination.png',label:'Truth vs imagination'},
  {src:'assets/seasonal-art/what-am-i-refusing.png',label:'What am I refusing?'},
  {src:'assets/seasonal-art/discipline-or-freedom.png',label:'Discipline or freedom?'}
];

const JOURNAL_FIELDS=['observation','inner_state','life_application','interpretation','unresolved'];
const CONTEXT_KEYS=['kind','branchId','branchSlug','branchTitle','moduleId','moduleNumber','moduleTitle'];
let persistenceContext={userId:null,stageId:null};
let journalContext=null;

function cleanJournalContext(value){
  if(!value||typeof value!=='object')return null;
  const clean={};
  for(const key of CONTEXT_KEYS){const item=value[key];if(item===undefined||item===null||item==='')continue;clean[key]=typeof item==='number'?item:String(item).slice(0,240)}
  return Object.keys(clean).length?clean:null;
}

function contextText(context=journalContext){
  if(!context)return window.currentStage?.title?`Core Formation · ${window.currentStage.title}`:'Today’s Core Formation practice';
  if(context.kind==='phase_ii')return`Phase II · ${context.moduleTitle||'Advanced Formation'}`;
  if(context.kind==='phase_i_additional')return`Phase I additional · ${context.moduleTitle||context.branchTitle||'Practice'}`;
  if(context.kind==='practice_branch')return`${context.branchTitle||'Practice Branch'} · ${context.moduleTitle||'Session'}`;
  return context.moduleTitle||context.branchTitle||'Current practice';
}

function renderContext(){
  const screen=document.getElementById('journal');if(!screen)return;
  let orientation=document.getElementById('journal-orientation');
  if(!orientation){orientation=document.createElement('aside');orientation.id='journal-orientation';orientation.className='journal-orientation';orientation.setAttribute('aria-label','Reflection context');screen.querySelector('h1')?.insertAdjacentElement('afterend',orientation)}
  orientation.replaceChildren();
  const eyebrow=document.createElement('small');eyebrow.textContent='REFLECTING ON';
  const heading=document.createElement('strong');heading.textContent=contextText();
  const helper=document.createElement('span');helper.textContent='Begin with what you actually noticed. One honest observation is enough; the other fields are optional.';
  orientation.append(eyebrow,heading,helper);
  const observation=screen.querySelector('textarea[name="observation"]');
  observation?.setAttribute('placeholder','What did you actually notice during or after the practice?');
  observation?.setAttribute('aria-describedby','journal-orientation');
}

function setJournalContext(value){
  journalContext=cleanJournalContext(value);window.ASCENDJournalContext=journalContext;
  const form=document.getElementById('journal-form');if(form)form.dataset.curriculumContext=journalContext?.kind||'';
  const screen=document.getElementById('journal');if(screen)screen.dataset.curriculumContext=journalContext?.kind||'';
  renderContext();
}
function clearJournalContext(){setJournalContext(null)}

function bindReflectionArt(){
  const screen=document.getElementById('journal');if(!screen||screen.dataset.reflectionBound==='1')return;screen.dataset.reflectionBound='1';
  screen.addEventListener('click',event=>{const choice=event.target.closest('[data-reflection-index]');if(!choice)return;const item=REFLECTION_ART[Number(choice.dataset.reflectionIndex)];if(!item)return;const image=document.getElementById('reflection-art-image');const label=document.getElementById('reflection-art-label');if(image)image.src=item.src;if(label)label.textContent=item.label;document.querySelectorAll('[data-reflection-index]').forEach(button=>button.classList.toggle('active',button===choice))});
}
function setSync(text,online=false){const node=document.getElementById('sync-state');if(!node)return;node.textContent=text;node.classList.toggle('online',online)}
function setJournalStatus(status,state,text){if(!status)return;status.dataset.state=state;status.textContent=text}
function setSaving(form,saving){form.dataset.masterSaving=saving?'1':'';const save=document.getElementById('journal-save');if(save){save.disabled=saving;save.textContent=saving?'Saving…':'Save Reflection'}}
function entryFromForm(form){const values=new FormData(form);const entry={created_at:new Date().toISOString()};for(const[k,v]of values.entries())entry[k]=String(v).trim();const context=cleanJournalContext(journalContext||window.ASCENDJournalContext);if(context)entry.context=context;return entry}
function hasMeaningfulContent(form){return JOURNAL_FIELDS.some(name=>String(form.elements?.namedItem(name)?.value||'').trim().length>0)}
function currentProgress(){const rows=Array.isArray(window.__pathProgress)?window.__pathProgress:[];return rows.find(row=>row.status==='active'||row.status==='review')||rows[rows.length-1]||null}
function refreshPersistenceContext(){const progress=currentProgress();persistenceContext={userId:progress?.user_id||persistenceContext.userId||null,stageId:progress?.stage_id||window.currentStage?.id||persistenceContext.stageId||null};const form=document.getElementById('journal-form');if(form){form.dataset.masterUserId=persistenceContext.userId||'';form.dataset.masterStageId=persistenceContext.stageId||''}renderContext();return persistenceContext}
function localEntries(){try{return Array.isArray(window.localState?.entries)?window.localState.entries:[]}catch{return[]}}
function saveLocal(entry){try{if(!window.localState)return false;window.localState.entries=Array.isArray(window.localState.entries)?window.localState.entries:[];window.localState.entries.push(entry);window.saveLocal?.();return true}catch(error){console.warn('ASCEND local Journal fallback failed',error);return false}}
function journalDate(entry){const raw=entry.entry_date||entry.created_at;if(!raw)return'Saved reflection';const date=new Date(raw.length===10?`${raw}T12:00:00`:raw);if(Number.isNaN(date.getTime()))return String(raw);return new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric',year:'numeric'}).format(date)}
function firstMeaningful(entry){return JOURNAL_FIELDS.map(name=>String(entry?.[name]||'').trim()).find(Boolean)||'Saved reflection'}
function contextLabel(entry){return entry?.context&&typeof entry.context==='object'?contextText(entry.context):''}
function appendReflection(list,entry,{local=false}={}){const details=document.createElement('details');details.className='rhythm-card journal-history-entry';const summary=document.createElement('summary');const title=document.createElement('strong');title.textContent=journalDate(entry);const preview=document.createElement('span');const label=contextLabel(entry);preview.textContent=(label?`${label} · `:'')+firstMeaningful(entry).slice(0,120);summary.append(title,preview);details.append(summary);const body=document.createElement('div');body.className='journal-history-body';if(label){const source=document.createElement('small');source.className='journal-context-label';source.textContent=label;body.append(source)}for(const[name,fieldLabel]of [['observation','Observation'],['inner_state','Inner State'],['life_application','Life Application'],['interpretation','Interpretation'],['unresolved','Unresolved']]){const value=String(entry?.[name]||'').trim();if(!value)continue;const section=document.createElement('section');const heading=document.createElement('strong');heading.textContent=fieldLabel;const paragraph=document.createElement('p');paragraph.textContent=value;section.append(heading,paragraph);body.append(section)}if(local){const note=document.createElement('small');note.textContent='Saved on this device · awaiting synchronization';body.append(note)}details.append(body);list.append(details)}
async function loadHistory(){const list=document.getElementById('journal-history-list');if(!list)return;list.replaceChildren();const context=refreshPersistenceContext();const locals=localEntries().slice().reverse();let remote=[];if(Backend.isSignedIn()){try{let userId=context.userId;if(!userId)userId=(await Backend.me())?.id||null;if(userId){persistenceContext.userId=userId;remote=await Backend.journalEntries(userId,20)}}catch(error){console.warn('ASCEND Journal history unavailable',error)}}if(!remote.length&&!locals.length){const empty=document.createElement('p');empty.className='quiet-note';empty.textContent='Your saved reflections will appear here.';list.append(empty);return}remote.forEach(entry=>appendReflection(list,entry));locals.forEach(entry=>appendReflection(list,entry,{local:true}))}

async function persistJournal(form,status){
  const entry=entryFromForm(form);
  if(Backend.isSignedIn()){
    try{setJournalStatus(status,'saving','Saving your reflection…');setSync('SYNCING…');const context=refreshPersistenceContext();let userId=context.userId;const stageId=context.stageId;if(!userId)userId=(await Backend.me())?.id||null;if(userId)persistenceContext.userId=userId;if(!userId||!stageId)throw new Error('ASCEND is still loading your current stage.');if(typeof Backend.raw?.saveJournal!=='function')throw new Error('Journal persistence is unavailable.');await Backend.saveJournal(userId,stageId,entry);setJournalStatus(status,'synced','✓ Reflection saved and synced to your private Journal. Returning to Today…');setSync('SYNCED',true);form.reset();const savedContext=entry.context||null;clearJournalContext();window.ASCENDMirror?.load?.('stage');await loadHistory();document.dispatchEvent(new CustomEvent('ascend:journal-saved',{detail:{remote:true,stageId,context:savedContext}}));setTimeout(()=>window.ASCENDUX?.activateScreen?.('today'),650);return}catch(error){console.error('ASCEND remote Journal save failed',error)}
  }
  const saved=saveLocal(entry);
  setJournalStatus(status,saved?'local':'error',Backend.isSignedIn()?(saved?'✓ Connection unavailable. Reflection is saved on this device and waiting to sync.':'Reflection was not saved. Keep this page open and try again.'):(saved?'✓ Reflection saved privately on this device. Sign in to synchronize it.':'Reflection was not saved on this device.'));
  setSync(saved?'LOCAL':'UNSAVED');if(saved){form.reset();clearJournalContext();await loadHistory()}document.dispatchEvent(new CustomEvent('ascend:journal-saved',{detail:{remote:false,saved,context:saved?entry.context||null:null}}));
}

async function saveFromMaster(form,status){if(form.dataset.masterSaving==='1')return;if(!hasMeaningfulContent(form)){setJournalStatus(status,'prompt','Begin with one observation. That is enough to save this reflection.');form.elements?.namedItem('observation')?.focus?.();return}setSaving(form,true);try{await persistJournal(form,status)}finally{setSaving(form,false)}}
function bindPersistence(screen){const form=document.getElementById('journal-form');if(!form||screen.dataset.masterPersistence==='1')return;screen.dataset.masterPersistence='1';form.dataset.remoteAuthority='true';refreshPersistenceContext();const status=document.getElementById('journal-status');const save=document.getElementById('journal-save');if(save){save.dataset.masterJournalSave='true';save.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();saveFromMaster(form,status)})}form.addEventListener('submit',event=>{event.preventDefault();event.stopImmediatePropagation();saveFromMaster(form,status)},true)}
export function initJournal(){const screen=document.getElementById('journal');if(!screen)return;setJournalContext(window.ASCENDJournalContext);bindReflectionArt();bindPersistence(screen);document.addEventListener('ascend:journal-context',event=>setJournalContext(event.detail));document.addEventListener('ascend:screen',event=>{if(event.detail?.screen!=='journal')return;refreshPersistenceContext();loadHistory();requestAnimationFrame(()=>screen.querySelector('textarea[name="observation"]')?.focus?.())})}
