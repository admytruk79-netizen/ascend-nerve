import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','www');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');

test('Core Formation exposes one canonical 24-month sequence',()=>{
  const window={};
  vm.runInNewContext(read('path-progression.js'),{window,Date,Math,Number});
  const months=window.ASCENDProgression.MONTHS;
  assert.equal(months.length,24);
  assert.deepEqual([...months.map(item=>item.month)],Array.from({length:24},(_,i)=>i+1));
  assert.equal(new Set(months.map(item=>item.title)).size,24);
  assert.match(months[0].title,/Self-Contemplation/);
  assert.match(months[23].title,/Final Integration/);
});

test('readiness milestones open Core ranges without allowing delayed reviews to skip months',()=>{
  const window={};
  vm.runInNewContext(read('path-progression.js'),{window,Date,Math,Number});
  const p=window.ASCENDProgression;
  assert.equal(p.capForStage(7),7);
  assert.equal(p.capForStage(8),18);
  assert.equal(p.capForStage(9),24);

  // Foundation months are readiness stages, not elapsed-calendar counters.
  assert.equal(p.monthFor({stageSortOrder:7,stageStartedAt:'2024-01-01',now:new Date('2026-12-01')}),7);

  // Passing Foundation Review after a long delay must begin month 8, not jump to 18.
  assert.equal(p.monthFor({stageSortOrder:8,stageStartedAt:'2026-12-01',now:new Date('2026-12-01')}),8);
  assert.equal(p.monthFor({stageSortOrder:8,stageStartedAt:'2026-12-01',now:new Date('2027-02-01')}),10);
  assert.equal(p.monthFor({stageSortOrder:8,stageStartedAt:'2026-12-01',now:new Date('2029-01-01')}),18);

  // Passing the Part II gate begins month 19 regardless of total age of the Path.
  assert.equal(p.monthFor({stageSortOrder:9,stageStartedAt:'2028-06-01',now:new Date('2028-06-01')}),19);
  assert.equal(p.monthFor({stageSortOrder:9,stageStartedAt:'2028-06-01',now:new Date('2028-11-01')}),24);
});

test('Core and specialized pathways are independent in the Path UX',()=>{
  const html=read('index.html');
  const branches=read('branches.js');
  assert.match(html,/Core Formation/);
  assert.match(html,/Independent Pathways/);
  assert.match(html,/separate progression records/);
  assert.match(html,/Separate from Core Formation/);
  assert.doesNotMatch(branches,/branchAvailable|Core Foundation Gate|Core Foundations Required/);
  assert.match(branches,/INDEPENDENT PATHWAY/);
});

test('the 24-month map uses progressive disclosure instead of 24 competing cards',()=>{
  const monthPath=read('month-path.js');
  assert.match(monthPath,/formation-group/);
  assert.match(monthPath,/document\.createElement\('details'\)/);
  assert.match(monthPath,/details\.open=currentMonth/);
  assert.doesNotMatch(monthPath,/LOCKED/);
});

test('inactive screens cannot remain stacked during transitions',()=>{
  const css=read('ux-fixes.css');
  const dashboard=read('training-dashboard.js');
  assert.match(css,/\.screen\.motion-enter:not\(\.active\)\{display:none!important\}/);
  assert.doesNotMatch(dashboard,/\.screen\.motion-enter\s*\{[^}]*display:block!important/);
  assert.match(dashboard,/classList\.remove\('motion-enter'\)/);
});

test('Library loads access rules and offers usable filtering',()=>{
  const backend=read('backend.js');
  const html=read('index.html');
  const app=read('app.js');
  assert.match(backend,/path_content_unlock_rules/);
  assert.match(html,/id="library-search"/);
  assert.match(html,/id="library-type"/);
  assert.match(app,/contentAccess/);
});

test('dialogs, navigation and empty Journal submission have safeguards',()=>{
  const html=read('index.html');
  const ux=read('ux-fixes.js');
  const journal=read('journal-validation.js');
  assert.match(html,/role="dialog" aria-modal="true"/);
  assert.match(ux,/event\.key!=='Tab'/);
  assert.match(ux,/focusable/);
  assert.match(journal,/REFLECTION_FIELDS/);
  assert.match(journal,/stopImmediatePropagation/);
  assert.match(ux,/data-menu-screen/);
});

test('Journal is unmistakable from Today and remains in primary navigation',()=>{
  const html=read('index.html');
  const ux=read('ux-fixes.js');
  assert.match(html,/id="today-reflect" data-go-journal/);
  assert.match(html,/After practice · Journal reflection/);
  assert.match(html,/data-screen="journal">Journal</);
  assert.match(ux,/closest\('\[data-go-journal\]'\)/);
  assert.match(ux,/textarea\[name="observation"\]/);
  assert.match(ux,/Practice complete\. Note anything you want to remember\./);
});

test('Lifetime tester access is account-bound and redeemable from Me',()=>{
  const html=read('index.html');
  const app=read('app.js');
  const backend=read('backend.js');
  assert.match(html,/id="lifetime-key-form"/);
  assert.match(html,/Activate Lifetime Access/);
  assert.match(app,/redeemLifetimeKey/);
  assert.match(app,/refreshAccess/);
  assert.match(backend,/redeem_ascend_lifetime_key/);
  assert.match(backend,/ascend_entitlements/);
  assert.match(backend,/crypto\.subtle\.digest\('SHA-256'/);
});

test('ASCEND Path has no free-access state and gates curriculum behind entitlement',()=>{
  const html=read('index.html');
  const app=read('app.js');
  const backend=read('backend.js');
  const ux=read('ux-fixes.js');
  assert.doesNotMatch(app,/Free Access/);
  assert.match(html,/ASCEND Path requires active paid access/);
  assert.match(html,/ux-fixes\.js\?v=20260827-intro-1/);
  assert.match(app,/access-required/);
  assert.match(app,/if\(!hasAccess\).*return/);
  assert.match(backend,/entitlementIsActive/);
  assert.doesNotMatch(backend,/PUBLIC_READ_TABLES/);
  assert.match(ux,/if\(!confirmedUser\)\{/);
  assert.doesNotMatch(ux,/classList\.toggle\('auth-required',locked\)/);
});

test('active entitlement always provides a route from Account into the Path',()=>{
  const app=read('app.js');
  assert.match(app,/button\.textContent='Enter ASCEND Path'/);
  assert.match(app,/classList\.toggle\('auth-required',!user\)/);
  assert.match(app,/ensureEnterButton\(\)\?\.classList\.toggle\('hidden',!user\|\|!hasAccess\)/);
  assert.match(app,/activateScreen\?\.\('today'\)/);
});

test('first login introduction explains the Path and is account-bound',()=>{
  const html=read('index.html'),backend=read('backend.js'),intro=read('path-intro.js'),css=read('path-intro.css');
  assert.match(html,/id="path-intro"/);
  assert.match(html,/A path you live/);
  assert.match(html,/Begin with Today/);
  assert.match(html,/Practice → Journal/);
  assert.match(intro,/Begin My ASCEND Path/);
  assert.match(html,/id="menu-how"/);
  assert.match(backend,/getIntroductionStatus/);
  assert.match(backend,/completeIntroduction/);
  assert.match(intro,/ascendPathIntroComplete:/);
  assert.match(intro,/onboarding_completed_at/);
  assert.match(css,/ascend-path-intro-instrument\.jpg/);
});

test('practice entry opens a briefing before the timer',()=>{
  const html=read('index.html'),app=read('app.js');
  assert.match(html,/id="practice-briefing"/);
  assert.match(html,/id="briefing-begin"/);
  assert.match(html,/HOW TO PRACTICE/);
  assert.match(app,/function openPracticeOverlay\(\)\{tuneBriefingImage\(\);briefing\.classList\.remove\('hidden'\)\}/);
  assert.match(app,/function beginPractice\(\)\{briefing\.classList\.add\('hidden'\)/);
});

test('Account entry supports Android Google OAuth with a safe email fallback',()=>{
  const html=read('index.html');
  const app=read('app.js');
  const backend=read('backend.js');
  assert.match(html,/id="google-sign-in">Continue with Google/);
  assert.match(html,/type="password"/);
  assert.match(html,/id="toggle-password"/);
  assert.match(html,/id="create-account"/);
  assert.match(app,/signInWithGoogle/);
  assert.match(backend,/provider=google/);
  assert.match(backend,/com\.ascend\.path:\/\/auth-callback/);
  assert.match(backend,/appUrlOpen/);
  assert.match(backend,/grant_type=password/);
});

test('Library cards are keyboard operable and month-locked recommendations are removed',()=>{
  const app=read('app.js');
  const experience=read('experience.js');
  const contextual=read('contextual-library.js');
  assert.match(app,/setAttribute\('role','button'\)/);
  assert.match(app,/setAttribute\('tabindex','0'\)/);
  assert.match(experience,/e\.key!==\'Enter\'&&e\.key!==\' \'/);
  assert.match(contextual,/card\.closest\('#library-recommended'\)/);
  assert.match(contextual,/card\.remove\(\)/);
});

test('Library mobile controls stay in document flow above the content cards',()=>{
  const html=read('index.html');
  const css=read('ux-fixes.css');
  assert.match(html,/ux-fixes\.css\?v=20260827-library-groups-1/);
  assert.match(css,/\.library-tools\{position:relative;top:auto/);
  assert.match(css,/\.library-filters\{[^}]*overflow-x:auto/);
  assert.match(css,/\.library-filter\{flex:0 0 auto/);
  assert.match(css,/\.library-count\{position:relative;display:block;min-height:17px/);
  assert.match(css,/#library-recommended,#library-list\{display:flow-root;clear:both\}/);
});

test('Library uses collapsed content groups instead of one 67-item page',()=>{
  const html=read('index.html');
  const app=read('app.js');
  const css=read('ux-fixes.css');
  assert.match(html,/app\.js\?v=20260831-fix-1/);
  assert.match(app,/document\.createElement\('details'\)/);
  assert.match(app,/details\.className='library-group'/);
  assert.match(app,/\['teaching','Teachings'\]/);
  assert.match(app,/listLabel\.textContent=grouped\?'BROWSE LIBRARY':'RESULTS'/);
  assert.match(css,/\.library-group summary/);
});

test('Today uses the approved ritual portal with hold feedback and an accessible button fallback',()=>{
  const html=read('index.html');
  const app=read('app.js');
  const ritual=read('today-ritual.js');
  const css=read('ritual-today.css');
  assert.match(html,/id="ritual-portal"/);
  assert.match(html,/Press &amp; Hold/);
  assert.match(html,/data-action="practice"[^>]*>Begin Practice/);
  assert.match(html,/Month 1 of 24/);
  assert.match(app,/stage-title'\)\.textContent=p\?\.title\|\|currentStage\.title/);
  assert.match(ritual,/const HOLD_MS=1500/);
  assert.match(ritual,/window\.Capacitor\?\.Plugins\?\.Haptics/);
  assert.match(ritual,/navigator\.vibrate/);
  assert.match(ritual,/pointercancel/);
  assert.match(css,/ascend-twilight-ritual-bg\.jpg/);
});

test('active members never see purchase prices or Restore Purchases',()=>{
  const html=read('index.html');
  const app=read('app.js');
  assert.match(html,/id="paywall-purchase"/);
  assert.match(app,/purchase\?\.classList\.toggle\('hidden',active\)/);
  assert.match(app,/form\?\.classList\.toggle\('hidden',active\)/);
});

test('Android Back stays inside ASCEND and unwinds overlays and screens',()=>{
  const ux=read('ux-fixes.js');
  assert.match(ux,/Plugins\?\.App\?\.addListener\?\.\('backButton'/);
  assert.match(ux,/const open=activeOverlay\(\)/);
  assert.match(ux,/screenTrail\.pop\(\)/);
  assert.match(ux,/current!=='today'/);
  assert.match(ux,/window\.addEventListener\('popstate'/);
  assert.match(ux,/window\.ASCENDUX=\{activateScreen,syncOverlay,syncAuthGate,handleBack\}/);
});
