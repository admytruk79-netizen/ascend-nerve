import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const billing=fs.readFileSync(path.join(__dirname,'../www/billing.js'),'utf8');

test('Google Play purchase errors cannot resolve as success',()=>{
  assert.match(billing,/function rejectStoreResult\(result, action\)/);
  assert.match(billing,/if \(!result\) return;/);
  assert.match(billing,/lastStoreError = result;/);
  assert.match(billing,/throw error;/);
  assert.match(billing,/Promise\.resolve\(orderPromise\)\.then\(result => rejectStoreResult\(result, 'Purchase'\)\)/);
});

test('Google Play restore errors cannot resolve as success',()=>{
  assert.match(billing,/restorePurchases\(\)/);
  assert.match(billing,/rejectStoreResult\(result, 'Restore'\)/);
});
