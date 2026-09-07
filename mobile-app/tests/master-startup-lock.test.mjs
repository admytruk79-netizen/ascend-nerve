import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','www');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');

test('master frontend startup lock is applied before legacy UI can interact and released only after ownership is ready',()=>{
  const theme=read('theme.js');
  const base=read('styles/base.css');
  const bootstrap=read('app/bootstrap.js');

  assert.match(theme,/document\.documentElement\.classList\.add\('ascend-master-loading'\)/);
  assert.match(base,/html\.ascend-master-loading body:not\(\.auth-required\):not\(\.access-required\) #app/);
  assert.match(base,/html\.ascend-master-loading body:not\(\.auth-required\):not\(\.access-required\) \.bottom-nav/);

  assert.match(bootstrap,/document\.documentElement\.classList\.add\('ascend-master-loading'\)/);
  assert.match(bootstrap,/document\.body\.classList\.add\('ascend-master-loading'\)/);
  assert.match(bootstrap,/document\.documentElement\.dataset\.ascendMasterReady='1'/);
  assert.match(bootstrap,/document\.documentElement\.classList\.remove\('ascend-master-loading'\)/);
  assert.match(bootstrap,/document\.body\.classList\.remove\('ascend-master-loading'\)/);

  const failure=bootstrap.slice(bootstrap.indexOf("const start=()=>boot().catch"));
  assert.match(failure,/document\.documentElement\.dataset\.ascendMasterReady='error'/);
  assert.match(failure,/document\.documentElement\.classList\.add\('ascend-master-loading'\)/);
  assert.match(failure,/document\.body\.classList\.add\('ascend-master-loading'\)/);
  assert.doesNotMatch(failure,/classList\.remove\('ascend-master-loading'\)/);
});
