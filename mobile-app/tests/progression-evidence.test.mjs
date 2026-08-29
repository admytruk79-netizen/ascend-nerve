import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','www');
const source=fs.readFileSync(path.join(root,'path-progression.js'),'utf8');
const window={};
vm.runInNewContext(source,{window,Date,Math,Number,console});
const p=window.ASCENDProgression;

const evidence=(practice_days,elapsed_days,journal_entries,life_application_entries=0,training_in_life_logs=0)=>({
  practice_days,elapsed_days,journal_entries,life_application_entries,training_in_life_logs
});

test('monthly formation does not advance from time alone',()=>{
  assert.equal(p.monthFor({stageSortOrder:8,evidence:evidence(0,365,0,0,0)}),8);
  assert.equal(p.monthFor({stageSortOrder:9,evidence:evidence(0,365,0,0,0)}),19);
});

test('one formation unit requires practice, minimum duration, reflection and life application',()=>{
  assert.equal(p.FORMATION_UNIT_DAYS,21);
  assert.equal(p.monthFor({stageSortOrder:8,evidence:evidence(21,21,1,1,0)}),9);
  assert.equal(p.monthFor({stageSortOrder:8,evidence:evidence(21,21,0,1,0)}),8);
  assert.equal(p.monthFor({stageSortOrder:8,evidence:evidence(21,21,1,0,0)}),8);
  assert.equal(p.monthFor({stageSortOrder:8,evidence:evidence(20,21,1,1,0)}),8);
  assert.equal(p.monthFor({stageSortOrder:8,evidence:evidence(21,20,1,1,0)}),8);
});

test('formation units accumulate but cannot skip beyond the stage range',()=>{
  assert.equal(p.completedFormationUnits(evidence(63,63,3,1,2)),3);
  assert.equal(p.monthFor({stageSortOrder:8,evidence:evidence(63,63,3,1,2)}),11);
  assert.equal(p.monthFor({stageSortOrder:8,evidence:evidence(999,999,99,99,99)}),18);
  assert.equal(p.monthFor({stageSortOrder:9,evidence:evidence(105,105,5,5,0)}),24);
});
