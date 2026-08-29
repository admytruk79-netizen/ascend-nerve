import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','www');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');

test('startup renders Today before secondary ASCEND surfaces',()=>{
  const app=read('app.js');
  const loadRemote=app.match(/async function loadRemote\(\)\{[\s\S]*?\n\nconst overlay=/)?.[0]||'';
  assert.match(loadRemote,/Promise\.all\(\[PathBackend\.loadCurriculum\(\),PathBackend\.ensureStudent\(user\),PathBackend\.getProgress\(user\.id\)\]\)/);
  assert.match(loadRemote,/renderStage\(\);setSync\('SYNCED',true\)/);
  assert.doesNotMatch(loadRemote,/refreshMirror\(/);
  assert.doesNotMatch(loadRemote,/getRecentJournalText/);
  assert.doesNotMatch(loadRemote,/getMarkerObservations/);
  assert.doesNotMatch(loadRemote,/ASCENDBranches\?\.load/);
  assert.doesNotMatch(loadRemote,/ASCENDTrainingLayers\?\.load/);
});

test('secondary data is loaded by the surface that needs it',()=>{
  const app=read('app.js');
  assert.match(app,/async function loadSurface\(id\)/);
  assert.match(app,/id==='library'[\s\S]*getRecentJournalText/);
  assert.match(app,/id==='path'[\s\S]*ASCENDBranches\?\.load/);
  assert.match(app,/id==='path'[\s\S]*ASCENDTrainingLayers\?\.load/);
  assert.match(app,/id==='me'[\s\S]*getMarkerObservations/);
  assert.match(app,/id==='journal'[\s\S]*loadJournalHistory/);
});

test('Mirror never performs a hidden startup resonance request',()=>{
  const mirror=read('mirror-engine.js');
  assert.doesNotMatch(mirror,/setTimeout\(\(\)=>\{if\(PathBackend\?\.isSignedIn/);
  assert.match(mirror,/showCached\(scope\)/);
  assert.match(mirror,/window\.ASCENDMirror=\{load,reconnect,showCached,invalidate\}/);
});

test('Journal history does not fetch while another screen is active',()=>{
  const ux=read('ux-fixes.js');
  assert.match(ux,/if\(!force&&currentScreen\(\)!=='journal'\)return/);
  assert.doesNotMatch(ux,/setTimeout\(loadJournalHistory,1200\)/);
});
