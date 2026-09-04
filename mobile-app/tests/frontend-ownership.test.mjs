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

test('Today keeps the hold portal primary while preserving an accessible non-hold fallback',()=>{
  const today=read('app/screens/today.js');
  const css=read('ritual-today.css');
  assert.match(today,/Press and hold for two seconds to open the briefing/);
  assert.match(today,/Can’t hold\? Open briefing/);
  assert.match(today,/ascend-accessible-entry/);
  assert.match(today,/setReflectionReady\(true\)/);
  assert.match(today,/Available after you complete today’s practice/);
  assert.match(css,/ritual-begin\.ascend-accessible-entry/);
  assert.match(css,/journal-handoff\.is-ready/);
});

test('Library presentation is owned by the master screen module',()=>{
  const library=read('app/screens/library.js');
  const compatibility=read('contextual-library.js');
  const experience=read('experience.js');
  assert.match(library,/window\.ASCENDLibrary=\{render,openItem,context:\(\)=>curriculumContext,contentAccess\}/);
  assert.match(library,/FOR YOUR CURRENT MONTH/);
  assert.match(library,/PathEngine\.current/);
  assert.match(library,/LibraryEngine\?\.recommend/);
  assert.match(library,/contentRules/);
  assert.match(library,/currentStage\?\.sort_order/);
  assert.match(library,/ascend:journal-saved['"],\(\)=>\{curriculumContext=null/);
  assert.match(library,/assets\/seasonal-art\//);
  assert.match(compatibility,/window\.ASCENDLibrary\?\.render/);
  assert.doesNotMatch(compatibility,/gateLibraryCards|renderRelatedTeaching|querySelectorAll\('#library-list/);
  assert.doesNotMatch(experience,/openLibraryCard|recordLibraryView|library-list['"]|library-recommended['"]/);
  assert.doesNotMatch(experience,/menu-button.*aboutOverlay/);
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

test('theme and component CSS are statically composed with a genuinely light Day palette',()=>{
  const theme=read('theme.css');
  assert.match(theme,/theme-authority\.css/);
  assert.match(theme,/mirror-component\.css/);
  assert.match(theme,/training-components\.css/);
  assert.match(theme,/html\[data-theme="day"\]\{[\s\S]*color-scheme:light/);
  assert.match(theme,/--ui-bg:#f4efe4/);
  assert.match(theme,/--ui-field:#fffdf8/);
  assert.match(theme,/:focus-visible/);
});

test('signing identity remains outside frontend reconstruction',()=>{
  const capacitor=JSON.parse(fs.readFileSync(path.resolve('capacitor.config.json'),'utf8'));
  assert.equal(capacitor.appId,'com.ascend.path');
  assert.equal(capacitor.appName,'ASCEND Path');
  assert.equal(capacitor.webDir,'www');
});
