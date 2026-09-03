import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','www');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');

function loadGuard(form,status){
  const window={};
  const document={getElementById:id=>id==='journal-form'?form:id==='journal-status'?status:null};
  vm.runInNewContext(read('journal-validation.js'),{window,document,String});
  return window.ASCENDJournalValidation;
}

function formFixture(values={}){
  const form=new EventTarget();
  const fields=new Map(['observation','inner_state','life_application','interpretation','unresolved'].map(name=>[name,{value:values[name]||'',focused:false,focus(){this.focused=true}}]));
  form.elements={namedItem:name=>fields.get(name)||null};
  form.querySelector=selector=>fields.get(selector.match(/name="([^"]+)"/)?.[1])||null;
  return{form,fields};
}

test('empty Journal submission is stopped before persistence',()=>{
  const {form,fields}=formFixture();
  const status={textContent:''};
  let persisted=0;
  loadGuard(form,status);
  form.addEventListener('submit',()=>persisted++);
  const event=new Event('submit',{cancelable:true});
  form.dispatchEvent(event);
  assert.equal(event.defaultPrevented,true);
  assert.equal(persisted,0);
  assert.match(status.textContent,/at least one observation/i);
  assert.equal(fields.get('observation').focused,true);
});

test('meaningful Journal submission reaches the persistence listener',()=>{
  const {form}=formFixture({life_application:'Paused before responding.'});
  const status={textContent:''};
  let persisted=0;
  loadGuard(form,status);
  form.addEventListener('submit',event=>{event.preventDefault();persisted++});
  form.dispatchEvent(new Event('submit',{cancelable:true}));
  assert.equal(persisted,1);
});

test('confirmed practice hands off to Journal and confirmed Journal save returns to Today',()=>{
  const progress=read('progress-integrity.js');
  const journal=read('app/screens/journal.js');
  assert.match(progress,/function handoffToJournal\(\)/);
  assert.match(progress,/activateScreen\?\.\('journal'\)/);
  assert.match(progress,/Record what you actually observed/);
  assert.match(journal,/Backend\.saveJournal/);
  assert.match(journal,/activateScreen\?\.\('today'\)/);
  assert.match(journal,/ascend:journal-saved/);
});