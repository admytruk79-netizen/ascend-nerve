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

test('stage milestones cap time-based Core progression without replacing months',()=>{
  const window={};
  vm.runInNewContext(read('path-progression.js'),{window,Date,Math,Number});
  const p=window.ASCENDProgression;
  assert.equal(p.capForStage(7),7);
  assert.equal(p.capForStage(8),18);
  assert.equal(p.capForStage(9),24);
  assert.equal(p.monthFor({pathStartedAt:'2025-01-01',stageSortOrder:9,now:new Date('2026-12-01')}),24);
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
  assert.match(html,/role="dialog" aria-modal="true"/);
  assert.match(ux,/event\.key!=='Tab'/);
  assert.match(ux,/focusable/);
  assert.match(ux,/journal-form/);
  assert.match(ux,/data-menu-screen/);
});
