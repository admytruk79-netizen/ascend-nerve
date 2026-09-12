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
  // billing.js calls global.PathBackend.verifyPlayPurchase(...) after every
  // verified transaction. backend.js used to never define this function at
  // all, so every real Google Play purchase silently threw a TypeError at
  // the verification step, was swallowed into lastVerifyError, and never
  // wrote ascend_entitlements -- paying customers stayed locked out with no
  // error surfaced anywhere.
  assert.match(billing,/global\.PathBackend\.verifyPlayPurchase\(/);
  assert.match(backend,/async function verifyPlayPurchase\(/);
  assert.match(backend,/functions\/v1\/verify-play-purchase/);
  assert.match(backend,/if\(!body\?\.verified\)throw new Error/);
  assert.match(backend,/window\.PathBackend=\{[^}]*verifyPlayPurchase/);
});

test('a failed server verification is surfaced to the paywall instead of leaving it stuck',()=>{
  assert.match(billing,/lastVerifyError = null/);
  assert.match(app,/lastVerifyError\(\)/);
  assert.match(app,/if\(verifyError&&status\)status\.textContent=/);
});
