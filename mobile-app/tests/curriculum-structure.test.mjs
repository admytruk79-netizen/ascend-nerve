import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const branches=fs.readFileSync(new URL('../www/branches.js',import.meta.url),'utf8');
const progression=fs.readFileSync(new URL('../www/path-progression.js',import.meta.url),'utf8');
const journal=fs.readFileSync(new URL('../www/app/screens/journal.js',import.meta.url),'utf8');
const backendAdapter=fs.readFileSync(new URL('../www/app/data/backend-adapter.js',import.meta.url),'utf8');
const library=fs.readFileSync(new URL('../www/app/screens/library.js',import.meta.url),'utf8');
const master=fs.readFileSync(new URL('../../docs/ASCEND_MASTER_SYSTEM_DOCUMENT.md',import.meta.url),'utf8');

test('Phase I remains a 24-module canonical spine',()=>{
  const monthRows=[...progression.matchAll(/\{month:(\d+),title:/g)].map(match=>Number(match[1]));
  assert.deepEqual(monthRows,Array.from({length:24},(_,index)=>index+1));
  assert.match(master,/Phase I[^\n]*Core Formation/i);
  assert.match(master,/24(?:-month| months| canonical monthly modules)/i);
});

test('only Ancestral Roots and Energy & Bodywork render as Practice Branches',()=>{
  assert.match(branches,/PRACTICE_BRANCHES=new Set\(\['ancestral-roots','energy-bodywork'\]\)/);
  assert.match(branches,/PHASE_I_ADDITIONAL=new Set\(\['development-program'\]\)/);
  assert.match(branches,/PHASE_II_SLUG='sphere-of-attention'/);
  assert.match(branches,/Independent progression · does not advance Phase I or Phase II/);
});

test('Phase II requires the Open Gate and is not presented as a generic branch',()=>{
  assert.match(branches,/path_phase_ii_access/);
  assert.match(branches,/Phase II · Advanced Formation/);
  assert.match(branches,/Phase II opens only after the Phase I Open Gate is established/);
  assert.match(branches,/branch\.slug===PHASE_II_SLUG&&!phaseIIAccess\.allowed/);
});

test('repetition submissions carry an idempotency request id',()=>{
  assert.match(branches,/p_request_id:requestId/);
});

test('branch and Phase II Journal handoff preserves structured curriculum context',()=>{
  assert.match(branches,/window\.ASCENDJournalContext=\{/);
  assert.match(branches,/kind:branch\.slug===PHASE_II_SLUG\?'phase_ii'/);
  assert.match(branches,/moduleId:m\.id/);
  assert.match(branches,/ascend:journal-context/);
  assert.match(journal,/entry\.context=context/);
  assert.match(journal,/ascend:journal-context/);
  assert.match(journal,/contextLabel\(entry\)/);
  assert.match(backendAdapter,/context:entry\.context&&typeof entry\.context==='object'\?entry\.context:\{\}/);
});

test('Library recommendations can follow active curriculum context without bypassing month eligibility',()=>{
  assert.match(library,/function contextItems\(content\)/);
  assert.match(library,/energy-bodywork/);
  assert.match(library,/ancestral-roots/);
  assert.match(library,/context\.kind==='phase_ii'/);
  assert.match(library,/content\.filter\(eligible\)/);
  assert.match(library,/FOR YOUR PHASE II PRACTICE/);
  assert.match(library,/ascend:journal-context/);
});
