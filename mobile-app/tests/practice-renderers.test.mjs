import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','www');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');

const renderers=['observation','breath','sphere','guided','reflection'];

test('master practice renderer owners exist and inherit the shared lifecycle contract',()=>{
  for(const name of renderers){
    const source=read(`app/practices/${name}.js`);
    assert.match(source,/import \{PracticeRenderer\} from '\.\/contract\.js'/);
    assert.match(source,/extends PracticeRenderer/);
    assert.match(source,new RegExp(`super\\('${name}'\\)`));
  }
});

test('practice renderers never own curriculum progression',()=>{
  for(const name of renderers){
    const source=read(`app/practices/${name}.js`);
    assert.doesNotMatch(source,/completePractice/);
    assert.doesNotMatch(source,/PathBackend/);
    assert.doesNotMatch(source,/path_student_progress/);
  }
});
