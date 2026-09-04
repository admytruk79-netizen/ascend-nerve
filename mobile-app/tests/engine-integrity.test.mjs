import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','www');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
function progression(){const window={};vm.runInNewContext(read('path-progression.js'),{window,Date,Math,Number});return window.ASCENDProgression}
function assertRange(actual,start,end){assert.equal(actual.start,start);assert.equal(actual.end,end)}

test('Core months cannot be skipped by time spent before a readiness gate',()=>{const p=progression();assert.equal(p.monthFor({stageSortOrder:8,stageStartedAt:'2026-08-01',now:new Date('2026-08-01')}),8);assert.equal(p.monthFor({stageSortOrder:8,stageStartedAt:'2026-08-01',now:new Date('2027-06-01')}),18);assert.equal(p.monthFor({stageSortOrder:9,stageStartedAt:'2028-01-01',now:new Date('2028-01-01')}),19);assert.equal(p.monthFor({stageSortOrder:9,stageStartedAt:'2028-01-01',now:new Date('2028-06-01')}),24)});

test('Core stage ranges remain foundation then progressive development',()=>{const p=progression();for(let stage=1;stage<=7;stage++)assertRange(p.rangeForStage(stage),stage,stage);assertRange(p.rangeForStage(8),8,18);assertRange(p.rangeForStage(9),19,24)});

test('Primary Path separates primary progression from parallel application',()=>{const branches=read('branches.js');assert.match(branches,/function isApplied\(m\)/);assert.match(branches,/primaryModules\(branch\)/);assert.match(branches,/PARALLEL APPLICATION/);assert.match(branches,/Readiness Gate/);assert.match(branches,/submit_branch_readiness/);assert.match(branches,/Foundation Review/)});

test('Mirror remains subordinate to progression and exposes stage/all-time scopes',()=>{const mirror=read('mirror-engine.js');assert.match(mirror,/ascend-resonance/);assert.match(mirror,/data-mirror-scope="stage"/);assert.match(mirror,/data-mirror-scope="all"/);assert.match(mirror,/does not determine attainment, diagnose you, or establish spiritual claims as fact/);assert.doesNotMatch(mirror,/submit_branch_readiness|path_submit_readiness_review|record_branch_repetition/)});

test('practice completion integrity never advances locally after failed verification',()=>{const integrity=read('progress-integrity.js');assert.match(integrity,/pendingPractices/);assert.match(integrity,/pending attempt and does not count toward progression yet/);assert.match(integrity,/remaining>0/);assert.match(integrity,/ASCENDPracticeCompletion/);assert.doesNotMatch(integrity,/practiceDays\s*\+=/)});

test('training-in-life evidence stays subordinate to the primary Path',()=>{const layers=read('training-layers.js');for(const term of ['TRAINING BEYOND THE FORMAL PRACTICE','APPLIED LIFE','CONDUCT & CHARACTER','RELATIONSHIP PRACTICE','BODY & BREATH','MAINTENANCE','INTEGRATION'])assert.match(layers,new RegExp(term.replace('&','&')));assert.match(layers,/path_record_training_assignment/);assert.doesNotMatch(layers,/rest\('path_training_assignment_logs',\{method:'POST'/);assert.match(layers,/ASCENDReadinessEvidence\?\.load/);assert.match(layers,/They do not replace the primary practice and they do not advance the Path by themselves/)});

test('readiness evidence supports but never replaces deterministic progression',()=>{const readiness=read('readiness-evidence.js');assert.match(readiness,/life_application_entries\+e\.training_in_life_logs/);assert.match(readiness,/MAINTENANCE LOGS/);assert.match(readiness,/MINIMUM DURATION/);assert.match(readiness,/CONSISTENT DAYS/);assert.match(readiness,/button\.disabled=!ready/);assert.match(readiness,/Continue Gathering Readiness Evidence/);assert.match(readiness,/Progression still remains a server-side gate/);assert.match(readiness,/Ambiguous, not-yet, or no-clear-result observations are valid/)});

test('Library access combines stage and Core-month progression in one policy',()=>{const contextual=read('contextual-library.js');assert.match(contextual,/metadata\?\.month/);assert.match(contextual,/metadata\?\.min_month/);assert.match(contextual,/function stageRule/);assert.match(contextual,/function access/);assert.match(contextual,/Opens in Month \$\{needed\}/);assert.match(contextual,/ASCENDLibraryAccess/);assert.match(contextual,/ASCENDProgression\?\.current/);assert.doesNotMatch(contextual,/setTimeout\(tick/)});

test('teacher review UI uses the live stage-gate schema',()=>{const teacher=read('teacher-console.js'),backend=read('backend.js');assert.match(teacher,/data-decision="advance"/);assert.match(teacher,/data-decision="continue"/);assert.match(teacher,/data-decision="pause"/);assert.match(teacher,/teacher_id:teacherId,student_id:wrap\.dataset\.student,stage_id:stageId,decision:/);assert.match(backend,/student_id=eq\.\$\{userId\}/);assert.match(backend,/order=submitted_at\.desc/);assert.doesNotMatch(backend,/student_user_id=eq|teacher_user_id=eq/)});
