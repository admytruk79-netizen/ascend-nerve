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
  for(const retired of ['approved-screens.js','approved-screens.css','approved-render-overrides.css','ux-fixes.js','ux-fixes.css','initiation-school.css','initiation-school-refinements.css','initiation-school-polish.css','initiation-school-focus.css','today-web-visual.css']){
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
  const queue=[
    ...linkedFrom(read('index.html'),root),
    ...linkedFrom(read('delete-account.html'),root)
  ];
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

test('Today ritual chrome and onboarding use theme-reactive tokens, not the static pre-migration palette',()=>{
  // --gold/--gold2/--teal/--muted/--ivory/--ink/--line are defined once in
  // styles.css's :root with no per-theme override anywhere, unlike --asc-*
  // (redefined per html[data-theme] in theme.css). A live file still
  // consuming the legacy names renders that content stuck in one theme's
  // colors regardless of the student's actual Day/Twilight/Night choice -
  // e.g. .ritual-meta ("DAY 1 · 10 min") was nearly unreadable in Day
  // theme because var(--gold2) never adapts. experience.css and
  // living-object.css use the same static palette and have the same bug.
  for(const file of ['ritual-today.css','experience.css','living-object.css']){
    const css=read(file);
    assert.doesNotMatch(css,/var\(--(?:gold2?|teal|muted|ivory|ink2?|line)\)/,`${file} must use the theme-reactive --asc-* tokens, not the static legacy palette`);
  }
});

test('menu overlay quick-nav links are styled by the live master stylesheet, not a retired class gate',()=>{
  const screens=read('styles/screens.css');
  const html=read('index.html');
  assert.match(html,/class="menu-link"/);
  assert.doesNotMatch(html,/class="[^"]*\binitiation-school\b/);
  assert.match(screens,/body\.ascend-master-ui \.menu-link\{/);
  assert.doesNotMatch(screens,/body\.initiation-school \.menu-link/);
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
