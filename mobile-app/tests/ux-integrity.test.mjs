import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','www');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');

test('Core Formation exposes the canonical 24-month v3 sequence and six Gates',()=>{
  const window={};
  vm.runInNewContext(read('path-progression.js'),{window,Date,Math,Number});
  const months=window.ASCENDProgression.MONTHS;
  assert.equal(months.length,24);
  assert.deepEqual([...months.map(item=>item.month)],Array.from({length:24},(_,i)=>i+1));
  assert.equal(new Set(months.map(item=>item.title)).size,24);
  assert.equal(months[0].title,'Orientation to the Path');
  assert.equal(months[7].title,'Openness and Discernment');
  assert.equal(months[8].title,'Inner Quiet');
  assert.equal(months[19].title,'Energetic Literacy');
  assert.equal(months[23].title,'The Open Gate');
  assert.deepEqual([...months.filter(item=>item.gate).map(item=>item.month)],[4,8,12,16,20,24]);
});

test('Path presents six developmental phases rather than the retired three-block map',()=>{
  const monthPath=read('month-path.js');
  for(const label of ['I · Foundation','II · Stability','III · Perception','IV · Integration','V · Resonance','VI · Synthesis'])assert.match(monthPath,new RegExp(label.replace('·','\\·')));
  assert.match(monthPath,/Months 1–4/);
  assert.match(monthPath,/Months 21–24/);
  assert.match(monthPath,/24-month Core Formation map in six developmental phases/);
  assert.doesNotMatch(monthPath,/Tools & Integration/);
  assert.doesNotMatch(monthPath,/Expanded Practice/);
});

test('server stage-practice links remain curriculum authority',()=>{
  const backend=read('backend.js');
  assert.match(backend,/path_stage_practices/);
  assert.match(backend,/server-side source of truth/);
  assert.doesNotMatch(backend,/const MONTH_PRACTICE/);
  assert.doesNotMatch(backend,/bindMonthlyPrimary/);
  assert.doesNotMatch(backend,/star-energy/);
  assert.doesNotMatch(backend,/green-sphere/);
});

test('readiness milestones cannot use elapsed time to skip beyond their existing Core range',()=>{
  const window={};
  vm.runInNewContext(read('path-progression.js'),{window,Date,Math,Number});
  const p=window.ASCENDProgression;
  assert.equal(p.capForStage(7),7);
  assert.equal(p.capForStage(8),18);
  assert.equal(p.capForStage(9),24);
  assert.equal(p.monthFor({stageSortOrder:7,stageStartedAt:'2024-01-01',now:new Date('2026-12-01')}),7);
  assert.equal(p.monthFor({stageSortOrder:8,stageStartedAt:'2026-12-01',now:new Date('2026-12-01')}),8);
  assert.equal(p.monthFor({stageSortOrder:9,stageStartedAt:'2028-06-01',now:new Date('2028-06-01')}),19);
});

test('app.js no longer competes with month-path for Path rendering',()=>{
  const app=read('app.js');
  assert.doesNotMatch(app,/function renderPath\(/);
  assert.match(app,/function requestPathPaint\(/);
  assert.match(app,/ascend:curriculum/);
});

test('Core and specialist Practice Branches remain independent',()=>{
  const html=read('index.html');
  const branches=read('branches.js');
  assert.match(html,/Core Formation/);
  assert.match(html,/Independent Pathways/);
  assert.match(html,/Separate from Core Formation/);
  assert.match(branches,/INDEPENDENT PATHWAY/);
});

test('Journal has one save authority with remote-first and local fallback behavior',()=>{
  const authority=read('journal-sync-authority.js');
  const app=read('app.js');
  assert.match(authority,/dataset\.remoteAuthority='true'/);
  assert.match(authority,/stopImmediatePropagation/);
  assert.match(authority,/PathBackend\.saveJournal/);
  assert.match(authority,/saveLocal\(entry\)/);
  assert.match(authority,/ascend:journal-saved/);
  assert.match(app,/dataset\.remoteAuthority==='true'/);
});

test('Journal remains a primary navigation destination and observation is first',()=>{
  const html=read('index.html');
  const router=read('app/router.js');
  assert.match(html,/data-screen="journal">Journal/);
  assert.match(html,/name="observation"/);
  assert.match(html,/name="interpretation"/);
  assert.ok(html.indexOf('name="observation"')<html.indexOf('name="interpretation"'));
  assert.match(router,/data-go-journal/);
  assert.match(router,/Practice complete\. Note anything you want to remember\./);
});

test('active entitlement hides purchase and lifetime-key surfaces',()=>{
  const app=read('app.js');
  assert.match(app,/purchase\?\.classList\.toggle\('hidden',active\)/);
  assert.match(app,/form\?\.classList\.toggle\('hidden',active\)/);
  assert.match(app,/entitlementIsActive/);
});

test('valid authenticated session clears the auth gate',()=>{
  const router=read('app/router.js');
  assert.match(router,/classList\.toggle\('auth-required',!confirmedUser\)/);
  assert.match(router,/if\(!confirmedUser\)showScreen\('me'/);
});

test('Resonance refresh belongs to the Me owner and requires confirmed authenticated identity',()=>{
  const meOwner=read('app/screens/me.js');
  const bridge=read('design-v3-today.js');
  const mirror=read('mirror-engine.js');
  assert.match(meOwner,/PathBackend\?\.me\?\.\(\)/);
  assert.match(meOwner,/if\(me\)window\.ASCENDMirror\?\.load\?\.\('stage'\)/);
  assert.doesNotMatch(bridge,/PathBackend\?\.me/);
  assert.doesNotMatch(bridge,/mirror-engine\.js/);
  assert.match(mirror,/does not determine attainment/);
});

test('practice requires a two-second hold and opens a briefing before timer start',()=>{
  const html=read('index.html');
  const ritual=read('today-ritual.js');
  const app=read('app.js');
  assert.match(html,/id="ritual-portal"/);
  assert.match(html,/id="practice-briefing"/);
  assert.match(html,/id="briefing-begin"/);
  assert.match(ritual,/const HOLD_MS=2000/);
  assert.match(ritual,/Opening practice briefing/);
  assert.match(app,/function openPracticeOverlay\(\)/);
  assert.match(app,/function beginPractice\(\)/);
});

test('practice completion cannot advance before timer readiness or fake progress after backend failure',()=>{
  const app=read('app.js');
  assert.match(app,/if\(!finishBtn\.classList\.contains\('ready'\)\)return/);
  assert.match(app,/PathBackend\.completePractice/);
  assert.doesNotMatch(app,/localState\.practiceDays\+\+/);
});

test('Android Back unwinds all major overlays before screen navigation',()=>{
  const router=read('app/router.js');
  assert.match(router,/#practice-briefing/);
  assert.match(router,/#branch-overlay/);
  assert.match(router,/#menu-overlay/);
  assert.match(router,/#about-overlay/);
  assert.match(router,/Plugins\?\.App\?\.addListener\?\.\('backButton'/);
  assert.match(router,/openOverlays\(\)\.at\(-1\)/);
  assert.match(router,/screenName\(\)!=='today'/);
  assert.match(router,/window\.addEventListener\('popstate'/);
});

test('Library remains contextual, keyboard operable and does not mutate canonical curriculum',()=>{
  const app=read('app.js');
  const contextual=read('contextual-library.js');
  const gate=read('library-month-gate.js');
  assert.match(app,/path_content_unlock_rules|contentAccess/);
  assert.match(app,/setAttribute\('role','button'\)/);
  assert.match(app,/setAttribute\('tabindex','0'\)/);
  assert.match(contextual,/ascend:month/);
  assert.doesNotMatch(gate,/curriculum\.content\s*=/);
});

test('first-login introduction and primary navigation remain intact',()=>{
  const html=read('index.html');
  const backend=read('backend.js');
  const intro=read('path-intro.js');
  assert.match(html,/Today/);
  assert.match(html,/Path/);
  assert.match(html,/Journal/);
  assert.match(html,/Library/);
  assert.match(html,/Me/);
  assert.match(html,/id="path-intro"/);
  assert.match(backend,/getIntroductionStatus/);
  assert.match(backend,/completeIntroduction/);
  assert.match(intro,/Begin My ASCEND Path/);
});

test('Google OAuth retains the existing Android callback identity',()=>{
  const backend=read('backend.js');
  assert.match(backend,/com\.ascend\.path:\/\/auth-callback/);
  assert.match(backend,/provider=google/);
  assert.match(backend,/appUrlOpen/);
});