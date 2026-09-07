import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const billing=fs.readFileSync(path.resolve('www','billing.js'),'utf8');

test('Google Play order and restore error objects cannot resolve as success',()=>{
  assert.match(billing,/function rejectStoreResult\(result, action\)/);
  assert.match(billing,/if \(!result\) return/);
  assert.match(billing,/lastStoreError = result/);
  assert.match(billing,/throw error/);
  assert.match(billing,/Promise\.resolve\(orderPromise\)\.then\(result => rejectStoreResult\(result, 'Purchase'\)\)/);
  assert.match(billing,/restorePurchases\(\)[\s\S]*rejectStoreResult\(result, 'Restore'\)/);
});
