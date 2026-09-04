import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','www');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');

test('Journal structure belongs to the static shell',()=>{
  const html=read('index.html');
  for(const marker of [
    'id="reflection-art"',
    'id="reflection-art-image"',
    'class="ascend-deeper-reflection"',
    'id="journal-save"',
    'id="journal-history"',
    'id="journal-history-list"'
  ])assert.match(html,new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
  assert.ok(html.indexOf('name="observation"')<html.indexOf('name="interpretation"'));
});

test('Journal screen owner binds behavior without rebuilding static structure',()=>{
  const journal=read('app/screens/journal.js');
  assert.doesNotMatch(journal,/ensureReflectionHost/);
  assert.doesNotMatch(journal,/ensureHistoryHost/);
  assert.doesNotMatch(journal,/organizeForm/);
  assert.doesNotMatch(journal,/gallery\.innerHTML/);
  assert.doesNotMatch(journal,/document\.createElement\('details'\).*ascend-deeper-reflection/s);
  assert.match(journal,/document\.getElementById\('journal-save'\)/);
  assert.match(journal,/loadHistory\(\)/);
});
