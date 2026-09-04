import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','www');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');

const renderers=['observation','breath','sphere','guided','reflection'];

test('master practice renderer owners exist and inherit the shared lifecycle contract',()=>{
  for(const name of renderers){
    const source=read(`app/practices/${name}.js`);
    assert.match(source,/import \{PracticeRenderer\} from '\.\/contract\.js'/);
    assert.match(source,/extends PracticeRenderer/);
    assert.match(source,new RegExp(`super\\('${name}'\\)`));
  }
});

test('practice renderers never own curriculum progression',()=>{
  for(const name of renderers){
    const source=read(`app/practices/${name}.js`);
    assert.doesNotMatch(source,/completePractice/);
    assert.doesNotMatch(source,/PathBackend/);
    assert.doesNotMatch(source,/path_student_progress/);
  }
});

test('practice runtime coordinates renderer and overlay lifecycle without owning progression',()=>{
  const runtime=read('app/practices/runtime.js');
  const bootstrap=read('app/bootstrap.js');
  const integrity=read('progress-integrity.js');
  for(const name of renderers)assert.match(runtime,new RegExp(`\\./${name}\\.js`));
  assert.match(runtime,/metadata\?\.renderer/);
  assert.match(runtime,/metadata\?\.practice_renderer/);
  assert.match(runtime,/observationRenderer/);
  assert.match(runtime,/ASCENDPracticeRuntime/);
  assert.match(runtime,/ASCENDOpenPractice=openBriefing/);
  assert.match(runtime,/function openBriefing\(/);
  assert.match(runtime,/function beginOverlay\(/);
  assert.match(runtime,/function closeBriefing\(/);
  assert.match(runtime,/function closeOverlay\(/);
  assert.match(runtime,/ascend:practice-timer-complete/);
  assert.doesNotMatch(runtime,/completePractice|PathBackend|path_student_progress/);
  assert.match(integrity,/ASCENDPracticeRuntime\?\.closeOverlay/);
  assert.doesNotMatch(integrity,/getElementById\('practice-overlay'\)/);
  assert.match(bootstrap,/initPracticeRuntime/);
  assert.ok(bootstrap.indexOf('practice-timer-authority.js')<bootstrap.indexOf('initPracticeRuntime();'));
});
