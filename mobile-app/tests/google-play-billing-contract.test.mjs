import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const billing=fs.readFileSync(path.resolve('www','billing.js'),'utf8');
const backend=fs.readFileSync(path.resolve('www','backend.js'),'utf8');
const app=fs.readFileSync(path.resolve('www','app.js'),'utf8');

test('Google Play order and restore error objects cannot resolve as success',()=>{
  assert.match(billing,/function rejectStoreResult\(result, action\)/);
  assert.match(billing,/if \(!result\) return/);
  assert.match(billing,/lastStoreError = result/);
  assert.match(billing,/throw error/);
  assert.match(billing,/Promise\.resolve\(orderPromise\)\.then\(result => rejectStoreResult\(result, 'Purchase'\)\)/);
  assert.match(billing,/restorePurchases\(\)[\s\S]*rejectStoreResult\(result, 'Restore'\)/);
});

test('a verified purchase actually reaches a real PathBackend.verifyPlayPurchase implementation',()=>{
  assert.match(billing,/global\.PathBackend\.verifyPlayPurchase\(/);
  assert.match(backend,/async function verifyPlayPurchase\(/);
  assert.match(backend,/functions\/v1\/verify-play-purchase/);
  assert.match(backend,/if\(!body\?\.verified\)throw new Error/);
  assert.match(backend,/window\.PathBackend=\{[^}]*verifyPlayPurchase/);
});

test('a Play receipt is finished only after server entitlement verification succeeds',()=>{
  const verifiedHandler=billing.match(/\.verified\(receipt => \{([\s\S]*?)\n        \}\);/);
  assert.ok(verifiedHandler,'verified receipt handler must exist');
  const body=verifiedHandler[1];
  assert.match(body,/Promise\.all\(/);
  assert.match(body,/verifyOnServer\(productId, t\)/);
  assert.match(body,/\.then\(\(\) => \{[\s\S]*receipt\.finish\(\)/);
  assert.match(body,/\.catch\(err => \{[\s\S]*lastVerifyError = err/);
  assert.doesNotMatch(body,/\.finally\([^)]*receipt\.finish/);
});

test('a failed server verification is surfaced to the paywall instead of leaving it stuck',()=>{
  assert.match(billing,/lastVerifyError = null/);
  assert.match(app,/lastVerifyError\(\)/);
  assert.match(app,/if\(verifyError&&status\)status\.textContent=/);
});