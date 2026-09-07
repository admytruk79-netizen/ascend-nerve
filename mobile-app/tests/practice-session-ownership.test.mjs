import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('www');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');

test('authoritative practice start keeps the timer hidden until the server session exists',()=>{
  const runtime=read('app/practices/runtime.js');
  const sessionAuthority=read('app/practices/session-authority.js');
  assert.match(runtime,/async function beginOverlay\(\)/);
  assert.match(runtime,/overlay\.classList\.add\('hidden'\)/);
  assert.match(runtime,/await beginAuthoritativePracticeSession\(/);
  assert.match(sessionAuthority,/window\.PathBackend\.rpc\('path_begin_practice_session'/);
  assert.match(runtime,/serverScope\?\.session_id/);
  assert.match(runtime,/overlay\.classList\.remove\('hidden'\)/);
  assert.ok(
    runtime.indexOf("overlay.classList.add('hidden')")<runtime.indexOf("await beginAuthoritativePracticeSession("),
    'overlay must be forced hidden before the authoritative start RPC'
  );
  assert.ok(
    runtime.indexOf("await beginAuthoritativePracticeSession(")<runtime.indexOf("overlay.classList.remove('hidden')"),
    'overlay must not be exposed until the authoritative start RPC has returned'
  );
});

test('runtime capture ownership prevents the legacy bubble start handler from exposing the timer',()=>{
  const runtime=read('app/practices/runtime.js');
  assert.match(runtime,/briefingBegin\?\.addEventListener\('click',event=>\{/);
  assert.match(runtime,/event\.preventDefault\(\)/);
  assert.match(runtime,/event\.stopImmediatePropagation\(\)/);
  assert.match(runtime,/void beginOverlay\(\)/);
  assert.match(runtime,/\},true\);/);
});

test('dismissal during an in-flight start cannot be reversed by a late server response',()=>{
  const runtime=read('app/practices/runtime.js');
  assert.match(runtime,/let beginAttempt=0/);
  assert.match(runtime,/function cancelPendingBegin\(\)/);
  assert.match(runtime,/beginAttempt\+=1/);
  assert.match(runtime,/const attempt=\+\+beginAttempt/);
  assert.match(runtime,/attempt!==beginAttempt\|\|briefing\.classList\.contains\('hidden'\)/);
  assert.match(runtime,/function closeBriefing\(\)\{[\s\S]*cancelPendingBegin\(\)/);
  assert.match(runtime,/function closeOverlay\([\s\S]*cancelPendingBegin\(\)/);
});

test('failed authoritative starts remain on the briefing and do not create an active session',()=>{
  const runtime=read('app/practices/runtime.js');
  const catchStart=runtime.indexOf('}catch(error){');
  assert.notEqual(catchStart,-1);
  const failureBlock=runtime.slice(catchStart,runtime.indexOf('}finally{',catchStart));
  assert.match(failureBlock,/overlay\.classList\.add\('hidden'\)/);
  assert.match(failureBlock,/briefing\.classList\.remove\('hidden'\)/);
  assert.match(failureBlock,/Could not establish an official practice session/);
  assert.doesNotMatch(failureBlock,/activeSession\s*=/);
});

test('completion authority is bound to a server-created session scope',()=>{
  const sql=fs.readFileSync(path.resolve('..','supabase','pending_migrations','phase_i_month_practice_completion_authority.sql'),'utf8');
  assert.match(sql,/create or replace function public\.path_begin_practice_session/);
  assert.match(sql,/started_at timestamptz not null default now\(\)/);
  assert.match(sql,/canonical_month integer not null/);
  assert.match(sql,/p_session_id uuid default null/);
  assert.match(sql,/if p_session_id is null then raise exception 'server practice session required'/);
  assert.match(sql,/where id=p_session_id and user_id=v_user/);
  assert.match(sql,/practice session scope mismatch/);
  assert.match(sql,/v_session\.started_at/);
  assert.match(sql,/v_session\.canonical_month/);
});
