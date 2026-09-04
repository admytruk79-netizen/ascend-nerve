import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const WWW=path.join(process.cwd(),'www');
const read=name=>fs.readFileSync(path.join(WWW,name),'utf8');

test('theme authority is static and never hides the document',()=>{
  const html=read('index.html');
  const theme=read('theme.js');
  assert.match(html,/theme-authority\.css/);
  assert.doesNotMatch(theme,/document\.documentElement\.style\.visibility/);
  assert.doesNotMatch(theme,/createElement\(['"]link['"]\)/);
  assert.doesNotMatch(theme,/MutationObserver/);
});

test('retired Today v3 runtime is not loaded',()=>{
  const html=read('index.html');
  assert.doesNotMatch(html,/design-v3-today\.(?:css|js)/);
  assert.doesNotMatch(html,/today-web-visual\.css/);
  assert.match(html,/#today|id="today"/);
});

test('startup stability does not own navigation',()=>{
  const startup=read('startup-stability.js');
  assert.doesNotMatch(startup,/querySelectorAll\(['"]\.screen/);
  assert.doesNotMatch(startup,/MutationObserver/);
  assert.doesNotMatch(startup,/data-screen/);
});

test('ASCENDUX is the navigation authority and normalizes practice journal flow',()=>{
  const ux=read('ux-fixes.js');
  assert.match(ux,/window\.ASCENDUX=\{activateScreen/);
  assert.match(ux,/ascend:practice-confirmed/);
  assert.match(ux,/ascend:journal-saved/);
  assert.doesNotMatch(ux,/createElement\(['"]style['"]\)/);
});

test('official practice completion never increments local progress on sync failure',()=>{
  const integrity=read('progress-integrity.js');
  assert.match(integrity,/window\.ASCENDPracticeCompletion/);
  assert.match(integrity,/ascend:practice-confirmed/);
  assert.match(integrity,/pendingPractices/);
  assert.doesNotMatch(integrity,/practiceDays\s*\+=/);
});

test('Mirror is lazy, boundary preserving, and style-free',()=>{
  const mirror=read('mirror-engine.js');
  assert.match(mirror,/ascend:navigation/);
  assert.match(mirror,/does not determine attainment/);
  assert.doesNotMatch(mirror,/createElement\(['"]style['"]\)/);
  assert.doesNotMatch(mirror,/setTimeout\(tryAutoLoad/);
});

test('Library access has one public policy API and no polling loop',()=>{
  const library=read('contextual-library.js');
  assert.match(library,/window\.ASCENDLibraryAccess/);
  assert.match(library,/canOpen/);
  assert.doesNotMatch(library,/setTimeout\(tick/);
  assert.doesNotMatch(library,/createElement\(['"]style['"]\)/);
});

test('static script order includes Journal, approved screens and startup authorities',()=>{
  const html=read('index.html');
  for(const file of ['journal-sync-authority.js','approved-screens.js','day-history.js','startup-stability.js'])assert.match(html,new RegExp(file.replace('.','\\.')));
});
