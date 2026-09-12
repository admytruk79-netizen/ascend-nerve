import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const mobileRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const repoRoot=path.resolve(mobileRoot,'..');
const read=file=>fs.readFileSync(file,'utf8');

test('account deletion is available in-app and on a public page',()=>{
  const html=read(path.join(mobileRoot,'www','index.html'));
  const deletion=read(path.join(mobileRoot,'www','delete-account.html'));
  const deletionJs=read(path.join(mobileRoot,'www','delete-account.js'));
  const backend=read(path.join(mobileRoot,'www','backend.js'));
  assert.match(html,/delete-account\.html/);
  assert.match(deletion,/Delete your account/);
  assert.match(deletionJs,/Confirm permanent deletion/);
  assert.match(backend,/functions\/v1\/delete-account/);
});

test('deletion Edge Function verifies the user and never exposes service credentials',()=>{
  const fn=read(path.join(repoRoot,'supabase','functions','delete-account','index.ts'));
  const publicBackend=read(path.join(mobileRoot,'www','backend.js'));
  assert.match(fn,/auth\.getUser\(token\)/);
  assert.match(fn,/auth\.admin\.deleteUser/);
  assert.match(fn,/payload\.confirmation !== "DELETE"/);
  assert.match(fn,/path_journal_entries/);
  assert.match(fn,/ascend_entitlements/);
  assert.doesNotMatch(publicBackend,/SERVICE_ROLE/);
});
