import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';

test('Android build receives one ASCEND OAuth callback intent filter',()=>{
  const dir=mkdtempSync(join(tmpdir(),'ascend-oauth-'));
  const manifestPath=join(dir,'AndroidManifest.xml');
  writeFileSync(manifestPath,`<manifest xmlns:android="http://schemas.android.com/apk/res/android"><application><activity android:name=".MainActivity"><intent-filter><action android:name="android.intent.action.MAIN"/><category android:name="android.intent.category.LAUNCHER"/></intent-filter></activity></application></manifest>`);
  const script=new URL('../scripts/configure-android-oauth.mjs',import.meta.url);
  for(let run=0;run<2;run++){
    const result=spawnSync(process.execPath,[script.pathname,manifestPath],{encoding:'utf8'});
    assert.equal(result.status,0,result.stderr);
  }
  const manifest=readFileSync(manifestPath,'utf8');
  assert.match(manifest,/android:scheme="@string\/custom_url_scheme"/);
  assert.equal((manifest.match(/android:host="auth-callback"/g)||[]).length,1);
  assert.match(manifest,/android\.intent\.category\.BROWSABLE/);
});
