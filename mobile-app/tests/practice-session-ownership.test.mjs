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

test('authoritative completion preserves the student identity used by Today scope guards',()=>{
  const bootstrap=read('app/bootstrap.js');
  const today=read('app/screens/today.js');
  assert.match(today,/userId:activeUserId\(\)/);
  assert.match(today,/a\.userId===b\.userId/);
  assert.match(bootstrap,/function progressForStage\(stageId\)/);
  assert.match(bootstrap,/const userId=session\.userId\|\|progress\?\.user_id\|\|null/);
  assert.match(bootstrap,/ascend:practice-completed[\s\S]*userId,/);
});

test('router does not own Finish Practice after authoritative completion takes capture ownership',()=>{
  const router=read('app/router.js');
  const bootstrap=read('app/bootstrap.js');
  assert.doesNotMatch(router,/getElementById\('finish-practice'\)/);
  assert.doesNotMatch(router,/finish\?\.addEventListener\('click'/);
  assert.match(router,/ascend:practice-completed/);
  assert.match(router,/Practice complete\. Note anything you want to remember\./);
  assert.match(bootstrap,/function bindAuthoritativeFinish\(\)/);
  assert.match(bootstrap,/p_session_id:session\.sessionId/);
  assert.match(bootstrap,/event\.stopImmediatePropagation\(\)/);
});

test('timer owns only timer state and runtime coordinates practice lifecycle',()=>{
  const timer=read('practice-timer-authority.js');
  const runtime=read('app/practices/runtime.js');
  assert.doesNotMatch(timer,/briefingBegin\.addEventListener/);
  assert.doesNotMatch(timer,/overlay\.querySelector\([^\n]*overlay-close/);
  assert.doesNotMatch(timer,/finish\.addEventListener/);
  assert.match(timer,/window\.ASCENDPracticeTimer=\{reset,start,pause,tick/);
  assert.match(runtime,/window\.ASCENDPracticeTimer\?\.reset\?\.\(\)/);
  assert.match(runtime,/closeOverlay\(\{resetTimer=false\}=\{\}\)/);
});

test('server stage advancement reloads authoritative curriculum and progress instead of painting stale local stage',()=>{
  const bootstrap=read('app/bootstrap.js');
  assert.match(bootstrap,/async function refreshAdvancedContext\(nextStageId,userId\)/);
  assert.match(bootstrap,/window\.PathBackend\.loadCurriculum\(\)/);
  assert.match(bootstrap,/window\.PathBackend\.getProgress\(userId\)/);
  assert.match(bootstrap,/window\.currentStage=nextStage/);
  assert.match(bootstrap,/result\?\.current_stage_id/);
  assert.match(bootstrap,/await refreshAdvancedContext\(nextStageId,userId\)/);
  assert.match(bootstrap,/await syncCompletionResult\(result,session\)/);
});
