import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','www');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');

test('Core Formation exposes one canonical 24-month sequence',()=>{
  const window={};vm.runInNewContext(read('path-progression.js'),{window,Date,Math,Number});
  const months=window.ASCENDProgression.MONTHS;
  assert.equal(months.length,24);
  assert.deepEqual([...months.map(item=>item.month)],Array.from({length:24},(_,i)=>i+1));
  assert.equal(new Set(months.map(item=>item.title)).size,24);
  assert.match(months[0].title,/Self-Contemplation/);assert.match(months[23].title,/Final Integration/);
});

test('readiness milestones cannot skip months after delayed reviews',()=>{
  const window={};vm.runInNewContext(read('path-progression.js'),{window,Date,Math,Number});const p=window.ASCENDProgression;
  assert.equal(p.capForStage(7),7);assert.equal(p.capForStage(8),18);assert.equal(p.capForStage(9),24);
  assert.equal(p.monthFor({stageSortOrder:7,stageStartedAt:'2024-01-01',now:new Date('2026-12-01')}),7);
  assert.equal(p.monthFor({stageSortOrder:8,stageStartedAt:'2026-12-01',now:new Date('2026-12-01')}),8);
  assert.equal(p.monthFor({stageSortOrder:8,stageStartedAt:'2026-12-01',now:new Date('2027-02-01')}),10);
  assert.equal(p.monthFor({stageSortOrder:9,stageStartedAt:'2028-06-01',now:new Date('2028-06-01')}),19);
});

test('Core and specialized pathways remain independent',()=>{
  const html=read('index.html'),branches=read('branches.js');
  assert.match(html,/Core Formation/);assert.match(html,/Independent Pathways/);assert.match(html,/separate progression records/);assert.match(html,/Separate from Core Formation/);
  assert.doesNotMatch(branches,/branchAvailable|Core Foundation Gate|Core Foundations Required/);assert.match(branches,/INDEPENDENT PATHWAY/);
});

test('24-month map uses progressive disclosure',()=>{
  const source=read('month-path.js');assert.match(source,/formation-group/);assert.match(source,/document\.createElement\('details'\)/);assert.match(source,/details\.open=currentMonth/);assert.doesNotMatch(source,/LOCKED/);
});

test('inactive screens cannot remain stacked',()=>{
  const css=read('ux-fixes.css'),dashboard=read('training-dashboard.js');
  assert.match(css,/\.screen\.motion-enter:not\(\.active\)\{display:none!important\}/);assert.doesNotMatch(dashboard,/\.screen\.motion-enter\s*\{[^}]*display:block!important/);assert.match(dashboard,/classList\.remove\('motion-enter'\)/);
});

test('Library access, search and filters are present',()=>{
  const backend=read('backend.js'),html=read('index.html'),app=read('app.js'),contextual=read('contextual-library.js');
  assert.match(backend,/path_content_unlock_rules/);assert.match(html,/id="library-search"/);assert.match(html,/id="library-type"/);assert.match(app,/contentAccess/);assert.match(contextual,/ASCENDLibraryAccess/);
});

test('dialogs, navigation and Journal validation have safeguards',()=>{
  const html=read('index.html'),ux=read('ux-fixes.js'),journal=read('journal-validation.js');
  assert.match(html,/role="dialog" aria-modal="true"/);assert.match(ux,/event\.key!=='Tab'/);assert.match(ux,/focusable/);assert.match(journal,/REFLECTION_FIELDS/);assert.match(journal,/stopImmediatePropagation/);assert.match(ux,/data-menu-screen/);
});

test('Practice → Journal → Today is an explicit event flow',()=>{
  const html=read('index.html'),ux=read('ux-fixes.js'),progress=read('progress-integrity.js'),journal=read('journal-sync-authority.js');
  assert.match(html,/id="today-reflect" data-go-journal/);assert.match(html,/After practice · Journal reflection/);assert.match(html,/data-screen="journal">Journal/);
  assert.match(progress,/ascend:practice-confirmed/);assert.match(ux,/ascend:practice-confirmed/);assert.match(journal,/ascend:journal-saved/);assert.match(ux,/ascend:journal-saved/);
});

test('Lifetime access stays account-bound and paid access gates curriculum',()=>{
  const html=read('index.html'),app=read('app.js'),backend=read('backend.js'),ux=read('ux-fixes.js');
  assert.match(html,/id="lifetime-key-form"/);assert.match(html,/Activate Lifetime Access/);assert.match(app,/redeemLifetimeKey/);assert.match(app,/refreshAccess/);assert.match(backend,/redeem_ascend_lifetime_key/);assert.match(backend,/ascend_entitlements/);
  assert.doesNotMatch(app,/Free Access/);assert.match(html,/ASCEND Path requires active paid access/);assert.match(app,/access-required/);assert.match(app,/if\(!hasAccess\).*return/);assert.match(backend,/entitlementIsActive/);assert.match(ux,/if\(!confirmedUser\)\{/);
});

test('active entitlement always provides a route into Today',()=>{
  const app=read('app.js');assert.match(app,/button\.textContent='Enter ASCEND Path'/);assert.match(app,/classList\.toggle\('auth-required',!user\)/);assert.match(app,/ensureEnterButton\(\)\?\.classList\.toggle\('hidden',!user\|\|!hasAccess\)/);assert.match(app,/activateScreen\?\.\('today'\)/);
});

test('first login introduction explains rhythm, progression and consent',()=>{
  const html=read('index.html'),backend=read('backend.js'),intro=read('path-intro.js'),css=read('path-intro.css');
  assert.match(html,/id="path-intro"/);assert.match(html,/A path you live/);assert.match(html,/Begin with Today/);assert.match(html,/Practice → Journal/);assert.match(html,/not a medical device/);assert.match(intro,/Begin My ASCEND Path/);assert.match(backend,/getIntroductionStatus/);assert.match(backend,/completeIntroduction/);assert.match(css,/ascend-path-intro-instrument\.jpg/);
});

test('practice entry opens a briefing before the timer and retains button fallback',()=>{
  const html=read('index.html'),app=read('app.js'),ritual=read('today-ritual.js');
  assert.match(html,/id="practice-briefing"/);assert.match(html,/id="briefing-begin"/);assert.match(html,/data-action="practice"[^>]*>Begin Practice/);assert.match(app,/function openPracticeOverlay/);assert.match(app,/function beginPractice/);assert.match(ritual,/const HOLD_MS=1500/);assert.match(ritual,/pointercancel/);
});

test('Account supports Android Google OAuth and email fallback',()=>{
  const html=read('index.html'),app=read('app.js'),backend=read('backend.js');
  assert.match(html,/id="google-sign-in">Continue with Google/);assert.match(html,/type="password"/);assert.match(html,/id="toggle-password"/);assert.match(html,/id="create-account"/);assert.match(app,/signInWithGoogle/);assert.match(backend,/provider=google/);assert.match(backend,/com\.ascend\.path:\/\/auth-callback/);assert.match(backend,/appUrlOpen/);assert.match(backend,/grant_type=password/);
});

test('Library cards are keyboard operable and gated recommendations are removed',()=>{
  const app=read('app.js'),experience=read('experience.js'),contextual=read('contextual-library.js');
  assert.match(app,/setAttribute\('role','button'\)/);assert.match(app,/setAttribute\('tabindex','0'\)/);assert.match(experience,/event\.key!=='Enter'&&event\.key!==' '/);assert.match(contextual,/card\.closest\('#library-recommended'\)/);assert.match(contextual,/card\.remove\(\)/);
});

test('Library controls remain in document flow and groups stay collapsed',()=>{
  const css=read('ux-fixes.css'),app=read('app.js');
  assert.match(css,/\.library-tools\{position:relative;top:auto/);assert.match(css,/\.library-filters\{[^}]*overflow-x:auto/);assert.match(css,/\.library-filter\{flex:0 0 auto/);assert.match(css,/#library-recommended,#library-list\{display:flow-root;clear:both\}/);
  assert.match(app,/document\.createElement\('details'\)/);assert.match(app,/details\.className='library-group'/);assert.match(app,/\['teaching','Teachings'\]/);
});

test('Today uses one static ritual portal and no v3 replacement runtime',()=>{
  const html=read('index.html'),ritual=read('today-ritual.js'),authority=read('theme-authority.css');
  assert.match(html,/id="ritual-portal"/);assert.match(html,/Press &amp; Hold/);assert.match(html,/Month 1 of 24/);assert.doesNotMatch(html,/design-v3-today/);assert.match(authority,/Approved Today: one DOM/);assert.match(ritual,/navigator\.vibrate/);
});

test('active members never see purchase prices or Restore Purchases',()=>{
  const html=read('index.html'),app=read('app.js');assert.match(html,/id="paywall-purchase"/);assert.match(app,/purchase\?\.classList\.toggle\('hidden',active\)/);assert.match(app,/form\?\.classList\.toggle\('hidden',active\)/);
});

test('Android Back stays inside ASCEND and unwinds overlays/screens through one router',()=>{
  const ux=read('ux-fixes.js');assert.match(ux,/Plugins\?\.App\?\.addListener\?\.\('backButton'/);assert.match(ux,/const open=activeOverlay\(\)/);assert.match(ux,/trail\.pop\(\)/);assert.match(ux,/current!=='today'/);assert.match(ux,/window\.addEventListener\('popstate'/);assert.match(ux,/window\.ASCENDUX=\{activateScreen,syncOverlay,syncAuthGate,handleBack,currentScreen\}/);
});
