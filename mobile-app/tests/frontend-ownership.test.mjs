import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('www');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');

const runtimeUiFiles=[
  'design-v3-today.js',
  'training-dashboard.js',
  'contextual-library.js',
  'month-path.js',
  'mirror-engine.js',
  'training-layers.js',
  'practitioner-mode.js',
  'practice-timer-authority.js'
];

test('frontend helpers do not inject stylesheets or style tags at runtime',()=>{
  for(const file of runtimeUiFiles){
    const source=read(file);
    assert.doesNotMatch(source,/createElement\(['"]style['"]\)/,`${file} must not create runtime style tags`);
    assert.doesNotMatch(source,/createElement\(['"]link['"]\)/,`${file} must not create runtime stylesheet links`);
    assert.doesNotMatch(source,/\.rel\s*=\s*['"]stylesheet['"]/,`${file} must not inject stylesheets`);
  }
});

test('retired approved-screen layers are absent and Today bridge only boots the master frontend',()=>{
  const today=read('design-v3-today.js');
  for(const retired of ['approved-screens.js','approved-screens.css','approved-render-overrides.css','ux-fixes.js','ux-fixes.css']){
    assert.equal(fs.existsSync(path.join(root,retired)),false,`${retired} must stay retired`);
  }
  assert.doesNotMatch(today,/today-v3|approved-hero|initiation-school\.css|approved-screens\.js/);
  assert.match(today,/app\/bootstrap\.js/);
});

test('Library presentation is owned by the master screen module',()=>{
  const library=read('app/screens/library.js');
  const compatibility=read('contextual-library.js');
  assert.match(library,/window\.ASCENDLibrary=\{render,openItem\}/);
  assert.match(library,/FOR YOUR CURRENT MONTH/);
  assert.match(library,/ASCENDProgression\?\.current/);
  assert.match(library,/LibraryEngine\?\.recommend/);
  assert.match(library,/assets\/seasonal-art\//);
  assert.match(compatibility,/window\.ASCENDLibrary\?\.render/);
  assert.doesNotMatch(compatibility,/gateLibraryCards|renderRelatedTeaching|querySelectorAll\('#library-list/);
});

test('My ASCEND owns hierarchy and Resonance controls while engine remains behavior-only',()=>{
  const me=read('app/screens/me.js');
  const resonance=read('mirror-engine.js');
  assert.match(me,/dataset\.meOwner='master'/);
  assert.match(me,/Current Formation/);
  assert.match(me,/dataset\.role='rhythm'/);
  assert.match(me,/dataset\.role='resonance'/);
  assert.match(me,/dataset\.role='teacher-review'/);
  assert.match(me,/dataset\.role='account'/);
  assert.match(me,/dataset\.resonanceOwner='me'/);
  assert.match(me,/ASCENDMirror\?\.load\?\.\('stage'\)/);
  assert.doesNotMatch(resonance,/querySelector\('#me|refresh-mirror|cloneNode\(true\)|function wire\(/);
  assert.match(resonance,/window\.ASCENDMirror=\{load,resetStage\}/);
});

test('practice timer is elapsed-time authoritative and loaded by the master bootstrap',()=>{
  const timer=read('practice-timer-authority.js');
  const bootstrap=read('app/bootstrap.js');
  const legacyApp=read('app.js');
  assert.match(timer,/deadline=Date\.now\(\)\+remainingMs/);
  assert.match(timer,/remainingMs=Math\.max\(0,deadline-Date\.now\(\)\)/);
  assert.match(timer,/if\(remainingMs<=0\)complete\(\)/);
  assert.match(timer,/current\.cloneNode\(true\)/);
  assert.match(timer,/data\.timerAuthority|dataset\.timerAuthority/);
  assert.match(bootstrap,/practice-timer-authority\.js/);
  assert.match(bootstrap,/data-practice-timer-authority/);
  assert.doesNotMatch(legacyApp,/setInterval\([^\n]*remaining/);
  assert.doesNotMatch(legacyApp,/function drawTimer|function resetTimerUI|function stop\(\).*clearInterval/);
  assert.doesNotMatch(legacyApp,/let remaining=\d+,interval=null,running=false/);
});

test('theme and component CSS are statically composed',()=>{
  const theme=read('theme.css');
  assert.match(theme,/theme-authority\.css/);
  assert.match(theme,/mirror-component\.css/);
  assert.match(theme,/training-components\.css/);
});

test('signing identity remains outside frontend reconstruction',()=>{
  const capacitor=JSON.parse(fs.readFileSync(path.resolve('capacitor.config.json'),'utf8'));
  assert.equal(capacitor.appId,'com.ascend.path');
  assert.equal(capacitor.appName,'ASCEND Path');
  assert.equal(capacitor.webDir,'www');
});