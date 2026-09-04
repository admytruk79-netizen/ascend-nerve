import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const branches=fs.readFileSync(new URL('../www/branches.js',import.meta.url),'utf8');
const progression=fs.readFileSync(new URL('../www/path-progression.js',import.meta.url),'utf8');
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
