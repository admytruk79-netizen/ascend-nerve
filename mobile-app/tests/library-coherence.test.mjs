import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','www');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');

test('Library is organized around current formation before reference browsing',()=>{
  const js=read('contextual-library.js');
  assert.match(js,/For where I am now/);
  assert.match(js,/Go deeper/);
  assert.match(js,/Reference library/);
  assert.match(js,/CURRENT PRACTICE/);
  assert.match(js,/BROWSE BY TYPE/);
});

test('Library contextual layer does not poll continuously in the background',()=>{
  const js=read('contextual-library.js');
  assert.doesNotMatch(js,/setTimeout\(tick/);
  assert.doesNotMatch(js,/setInterval\(/);
  assert.match(js,/data-screen=\\?"library/);
  assert.match(js,/ascend:curriculum/);
  assert.match(js,/ascend:month/);
});

test('Future month material remains gated from contextual Library surfaces',()=>{
  const js=read('contextual-library.js');
  assert.match(js,/const eligible=item=>minMonth\(item\)<=currentMonth/);
  assert.match(js,/Opens in Month/);
  assert.match(js,/aria-disabled/);
  assert.match(js,/month-locked/);
});
