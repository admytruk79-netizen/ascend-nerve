import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('www');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');

const runtimeUiFiles=[
  'design-v3-today.js','training-dashboard.js','contextual-library.js','month-path.js','mirror-engine.js','training-layers.js','practitioner-mode.js','practice-timer-authority.js'
];

const retiredCss=[
  'styles.css','living-object.css','theme.css','theme-authority.css'
];

const approvedCinematicCss=[
  'experience.css','ritual-today.css','styles/visual-system-v2.css','styles/cinematic-imagery.css',
  'styles/briefing-visual-fix.css','styles/practice-in-progress-visual.css','styles/journal-visual.css',
  'styles/day-palette-fix.css','styles/web-recovery.css'
];

test('frontend helpers do not inject stylesheets or style tags at runtime',()=>{
  for(const file of runtimeUiFiles){
    const source=read(file);
    assert.doesNotMatch(source,/createElement\(['"]style['"]\)/,`${file} must not create runtime style tags`);
    assert.doesNotMatch(source,/createElement\(['"]link['"]\)/,`${file} must not create runtime stylesheet links`);
    assert.doesNotMatch(source,/\.rel\s*=\s*['"]stylesheet['"]/,`${file} must not inject stylesheets`);
  }
});

test('retired visual layers are physically absent and Today bridge only boots the master frontend',()=>{
  const today=read('design-v3-today.js');
  for(const retired of ['approved-screens.js','approved-screens.css','approved-render-overrides.css','ux-fixes.js','ux-fixes.css','initiation-school.css','initiation-school-refinements.css','initiation-school-polish.css','initiation-school-focus.css','today-web-visual.css',...retiredCss]){
    assert.equal(fs.existsSync(path.join(root,retired)),false,`${retired} must stay retired`);
  }
  assert.doesNotMatch(today,/today-v3|approved-hero|initiation-school\.css|approved-screens\.js/);
  assert.match(today,/app\/bootstrap\.js/);
});

test('every stylesheet on disk is reachable from a real page, so an orphaned CSS file cannot silently go dead again',()=>{
  const stripQuery=href=>href.split('?')[0];
  const linkedFrom=(html,baseDir)=>[...html.matchAll(/<link[^>]*href="([^"]+\.css)[^"]*"/g)].map(m=>path.join(baseDir,stripQuery(m[1])));
  const importedFrom=(cssPath,baseDir)=>{
    if(!fs.existsSync(cssPath))return[];
    const css=fs.readFileSync(cssPath,'utf8');
    return[...css.matchAll(/@import\s+url\(['"]?([^'")]+\.css)[^'")]*['"]?\)/g)].map(m=>path.join(baseDir,stripQuery(m[1])));
  };
  const reachable=new Set();
  const queue=[...linkedFrom(read('index.html'),root),...linkedFrom(read('delete-account.html'),root)];
  while(queue.length){
    const file=path.normalize(queue.pop());
    if(reachable.has(file))continue;
    reachable.add(file);
    queue.push(...importedFrom(file,path.dirname(file)));
  }
  const onDisk=[];
  for(const dir of ['','styles']){
    for(const name of fs.readdirSync(path.join(root,dir))){
      if(name.endsWith('.css'))onDisk.push(path.normalize(path.join(root,dir,name)));
    }
  }
  const orphaned=onDisk.filter(file=>!reachable.has(file));
  assert.deepEqual(orphaned,[],`these CSS files are on disk but not reachable from index.html or delete-account.html: ${orphaned.join(', ')}`);
});

test('menu overlay quick-nav links are styled by the live master stylesheet, not a retired class gate',()=>{
  const screens=read('styles/screens.css');
  const html=read('index.html');
  assert.match(html,/class="menu-link"/);
  assert.doesNotMatch(html,/class="[^"]*\binitiation-school\b/);
  assert.match(screens,/body\.ascend-master-ui \.menu-link\{/);
  assert.doesNotMatch(screens,/body\.initiation-school \.menu-link/);
});

test('Today styling is owned by the preserved foundation stack plus the approved presentation wrapper',()=>{
  const master=read('design-v3-today.css');
  const foundation=read('design-v3-today-current.css');
  const screens=read('styles/screens.css');
  const components=read('styles/components.css');
  const tokens=read('styles/tokens.css');
  for(const file of retiredCss)assert.equal(fs.existsSync(path.join(root,file)),false,`${file} must remain deleted`);
  for(const file of approvedCinematicCss)assert.equal(fs.existsSync(path.join(root,file)),true,`${file} is part of the approved cinematic presentation and must exist`);
  assert.match(master,/design-v3-today-current\.css/);
  assert.match(master,/styles\/exact-approved-design\.css/);
  assert.match(foundation,/styles\/tokens\.css/);
  assert.match(foundation,/styles\/base\.css/);
  assert.match(foundation,/styles\/components\.css/);
  assert.match(foundation,/styles\/screens\.css/);
  assert.match(foundation,/visual-system-v2\.css/);
  assert.doesNotMatch(`${master}\n${foundation}`,/theme-authority/);
  assert.doesNotMatch(`${screens}\n${components}\n${tokens}`,/--ui-|Georgia,serif|border-radius:999px|border-radius:99px/);
});

test('Today keeps the hold interaction and accessible fallback alongside the approved cinematic visual layer',()=>{
  const today=read('app/screens/today.js');
  const screens=read('styles/screens.css');
  assert.match(today,/Press and hold for two seconds to open the briefing/);
  assert.match(today,/Can’t hold\? Open briefing/);
  assert.match(today,/ascend-accessible-entry/);
  assert.match(today,/COMPLETION_KEY='ascendTodayCompletionState'/);
  assert.match(today,/function sameScope\(a,b\)/);
  assert.match(today,/function authority\(\).*ASCENDProgression\?\.authority/s);
  assert.match(today,/userId:activeUserId\(\)/);
  assert.match(today,/ascend:authority/);
  assert.match(today,/ascend:practice-started/);
  assert.match(today,/Available after you complete today’s practice/);
  assert.match(screens,/ritual-begin:not\(\.ascend-accessible-entry\)\{display:none!important\}/);
  assert.match(screens,/ritual-begin\.ascend-accessible-entry\{display:block!important\}/);
  assert.match(screens,/journal-handoff/);
  assert.equal(fs.existsSync(path.join(root,'styles/visual-system-v2.css')),true);
});

test('Path orients the student before exposing the wider school map and preserves last confirmed position',()=>{
  const pathScreen=read('app/screens/path.js');
  const css=read('styles/screens.css');
  assert.match(pathScreen,/data-path-orientation/);
  assert.match(pathScreen,/CURRENT FORMATION/);
  assert.match(pathScreen,/Phase \$\{phase\} · Month \$\{month\} of 24/);
  assert.match(pathScreen,/Continue · \$\{item\.title\}/);
  assert.match(pathScreen,/let lastConfirmedContext=null/);
  assert.match(pathScreen,/if\(lastConfirmedContext\)\{paintOrientation\(card,lastConfirmedContext\);return\}/);
  assert.match(pathScreen,/ascend:month',event=>renderOrientation\(screen,event\.detail\|\|null\)/);
  assert.match(pathScreen,/Practice Branches/);
  assert.match(pathScreen,/does not advance Core Formation/);
  assert.match(css,/path-orientation/);
  assert.match(css,/path-orientation-next/);
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

test('composition has no genuinely-retired CSS references and the shared design tokens stay neutral',()=>{
  const master=read('design-v3-today.css');
  const foundation=read('design-v3-today-current.css');
  const tokens=read('styles/tokens.css');
  const html=read('index.html');
  assert.match(master,/design-v3-today-current\.css/);
  assert.match(master,/styles\/exact-approved-design\.css/);
  assert.match(foundation,/mirror-component\.css/);
  assert.match(foundation,/training-components\.css/);
  assert.doesNotMatch(`${master}\n${foundation}`,/theme-authority/);
  assert.doesNotMatch(html,/styles\.css|living-object\.css|theme\.css/);
  assert.match(tokens,/html\[data-theme="day"\]/);
  assert.match(tokens,/--asc-bg:#f5f7f6/);
  assert.doesNotMatch(tokens,/#f6f5f1|#faf9f6|#ece9e2|#d3b978|#d5a24d/);
});

test('signing identity remains outside frontend reconstruction',()=>{
  const capacitor=JSON.parse(fs.readFileSync(path.resolve('capacitor.config.json'),'utf8'));
  assert.equal(capacitor.appId,'com.ascend.path');
  assert.equal(capacitor.appName,'ASCEND Path');
  assert.equal(capacitor.webDir,'www');
});
