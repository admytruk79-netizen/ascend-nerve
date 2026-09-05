import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const branches=fs.readFileSync(new URL('../www/branches.js',import.meta.url),'utf8');
const progression=fs.readFileSync(new URL('../www/path-progression.js',import.meta.url),'utf8');
const journal=fs.readFileSync(new URL('../www/app/screens/journal.js',import.meta.url),'utf8');
const backend=fs.readFileSync(new URL('../www/backend.js',import.meta.url),'utf8');
const runtime=fs.readFileSync(new URL('../www/app/practices/runtime.js',import.meta.url),'utf8');
const backendAdapter=fs.readFileSync(new URL('../www/app/data/backend-adapter.js',import.meta.url),'utf8');
const library=fs.readFileSync(new URL('../www/app/screens/library.js',import.meta.url),'utf8');
const master=fs.readFileSync(new URL('../../docs/ASCEND_MASTER_SYSTEM_DOCUMENT.md',import.meta.url),'utf8');
const phaseIIGate=fs.readFileSync(new URL('../../supabase/pending_migrations/enforce_phase_ii_open_gate.sql',import.meta.url),'utf8');
const monthRole=fs.readFileSync(new URL('../../supabase/pending_migrations/phase_i_month_practice_role.sql',import.meta.url),'utf8');
const monthPractices=fs.readFileSync(new URL('../../supabase/pending_migrations/phase_i_month_practices_school_scale.sql',import.meta.url),'utf8');
const completionAuthority=fs.readFileSync(new URL('../../supabase/pending_migrations/phase_i_month_practice_completion_authority.sql',import.meta.url),'utf8');
const resonance=fs.readFileSync(new URL('../../supabase/functions/ascend-resonance/index.ts',import.meta.url),'utf8');

test('Phase I remains a 24-module canonical spine',()=>{
  const monthRows=[...progression.matchAll(/\{month:(\d+),title:/g)].map(match=>Number(match[1]));
  assert.deepEqual(monthRows,Array.from({length:24},(_,index)=>index+1));
  assert.match(master,/Phase I[^\n]*Core Formation/i);
  assert.match(master,/24(?:-month| months| canonical monthly modules)/i);
});

test('every canonical Phase I month has an authored school-scale practice',()=>{
  const seeded=[...monthPractices.matchAll(/\((\d+),'core-m\d{2}-/g)].map(match=>Number(match[1]));
  assert.deepEqual(seeded,Array.from({length:24},(_,index)=>index+1));
  assert.match(monthPractices,/session_architecture.*orientation → preparation → deliberate practice → quiet observation → completion reflection/);
  assert.match(monthPractices,/'fieldwork'/);
  assert.match(monthPractices,/'journal_prompt'/);
  assert.match(monthPractices,/canonical_month',true/);
  assert.match(monthPractices,/school_scale',true/);
});

test('canonical month practices use a distinct link role and explicit fallback ranges',()=>{
  assert.match(monthRole,/'month_primary'::text/);
  assert.match(monthPractices,/sp\.role='primary'/);
  assert.match(monthPractices,/'month_primary',jsonb_build_object\('cadence','daily','canonical_month',month_no/);
  assert.match(monthPractices,/when s\.sort_order=8 then 8 else 19 end/);
  assert.match(monthPractices,/when s\.sort_order=8 then 18 else 24 end/);
});

test('Today and practice runtime resolve only the current canonical month',()=>{
  assert.match(backend,/function normalizeCanonicalMonth\(links,currentMonth\)/);
  assert.match(backend,/link\.role==='month_primary'&&Number\(link\.frequency_rule\?\.canonical_month\)===month/);
  assert.match(backend,/source_role:'month_primary',role:'primary'/);
  assert.match(backend,/source_role:'primary',role:'legacy_primary'/);
  assert.match(backend,/links:normalizedLinks/);
  assert.match(runtime,/item\.role==='month_primary'&&Number\(item\.frequency_rule\?\.canonical_month\)===month/);
});

test('server completion accepts only the current Core progression role',()=>{
  assert.match(completionAuthority,/sp\.role in \('month_primary','primary'\)/);
  assert.match(completionAuthority,/practice is not a Core progression practice for this stage/);
  assert.match(completionAuthority,/legacy primary is not valid while canonical month practice is assigned/);
  assert.match(completionAuthority,/practice is not the current canonical month practice/);
  assert.doesNotMatch(completionAuthority,/sp\.role in \([^\)]*supporting/);
});

test('server and client use the same calendar-month boundary definition',()=>{
  assert.match(completionAuthority,/extract\(year from current_date\).*extract\(year from v_progress\.started_at::date\)/s);
  assert.match(completionAuthority,/extract\(month from current_date\).*extract\(month from v_progress\.started_at::date\)/s);
  assert.doesNotMatch(completionAuthority,/age\(current_date/);
  assert.match(progression,/now\.getFullYear\(\)-started\.getFullYear\(\)/);
  assert.match(progression,/now\.getMonth\(\)-started\.getMonth\(\)/);
});

test('Resonance resolves related practice using month_primary instead of maybeSingle primary',()=>{
  assert.match(resonance,/eq\("role","month_primary"\)/);
  assert.match(resonance,/frequency_rule/);
  assert.match(resonance,/canonical_month/);
  assert.match(resonance,/relatedPractice\(admin,user\.id,stageId\)/);
});

test('only Ancestral Roots and Energy & Bodywork render as Practice Branches',()=>{
  assert.match(branches,/PRACTICE_BRANCHES=new Set\(\['ancestral-roots','energy-bodywork'\]\)/);
  assert.match(branches,/PHASE_I_ADDITIONAL=new Set\(\['development-program'\]\)/);
  assert.match(branches,/PHASE_II_SLUG='sphere-of-attention'/);
  assert.match(branches,/Independent progression · does not advance Phase I or Phase II/);
});

test('Phase II requires the Open Gate and is not presented as a generic branch',()=>{
  assert.match(branches,/path_phase_ii_access/);
  assert.match(branches,/Phase II · Advanced Formation/);
  assert.match(branches,/Phase II opens only after the Phase I Open Gate is established/);
  assert.match(branches,/branch\.slug===PHASE_II_SLUG&&!phaseIIAccess\.allowed/);
});

test('Phase II Open Gate is enforced server-side on direct repetition-log inserts',()=>{
  assert.match(phaseIIGate,/order by sort_order desc\s+limit 1/i);
  assert.match(phaseIIGate,/coalesce\(v_status = 'established', false\)/i);
  assert.match(phaseIIGate,/if v_slug <> 'sphere-of-attention' then\s+return new;/i);
  assert.match(phaseIIGate,/if v_status is distinct from 'established' then\s+raise exception 'Phase II opens only after the Phase I Open Gate is established'/i);
  assert.match(phaseIIGate,/before insert on public\.training_branch_repetition_log/i);
});

test('Phase II access RPC is authenticated-only and does not grant anonymous execution',()=>{
  assert.match(phaseIIGate,/revoke all on function public\.path_phase_ii_access\(\) from public;/i);
  assert.match(phaseIIGate,/revoke all on function public\.path_phase_ii_access\(\) from anon;/i);
  assert.match(phaseIIGate,/grant execute on function public\.path_phase_ii_access\(\) to authenticated;/i);
});

test('Phase II gate reads Core readiness but never mutates Core progression',()=>{
  assert.match(phaseIIGate,/from public\.path_student_progress/i);
  assert.doesNotMatch(phaseIIGate,/update\s+public\.path_student_progress/i);
  assert.doesNotMatch(phaseIIGate,/insert\s+into\s+public\.path_student_progress/i);
  assert.doesNotMatch(phaseIIGate,/delete\s+from\s+public\.path_student_progress/i);
});

test('repetition submissions carry an idempotency request id',()=>{
  assert.match(branches,/p_request_id:requestId/);
});

test('branch and Phase II Journal handoff preserves structured curriculum context',()=>{
  assert.match(branches,/window\.ASCENDJournalContext=\{/);
  assert.match(branches,/kind:branch\.slug===PHASE_II_SLUG\?'phase_ii'/);
  assert.match(branches,/moduleId:m\.id/);
  assert.match(branches,/ascend:journal-context/);
  assert.match(journal,/entry\.context=context/);
  assert.match(journal,/ascend:journal-context/);
  assert.match(journal,/function contextLabel\(entry\)\{return entry\?\.context&&typeof entry\.context==='object'\?contextText\(entry\.context\):''\}/);
  assert.match(backendAdapter,/context:entry\.context&&typeof entry\.context==='object'\?entry\.context:\{\}/);
});

test('Library recommendations can follow active curriculum context without bypassing month eligibility',()=>{
  assert.match(library,/function contextItems\(content\)/);
  assert.match(library,/energy-bodywork/);
  assert.match(library,/ancestral-roots/);
  assert.match(library,/context\.kind==='phase_ii'/);
  assert.match(library,/content\.filter\(eligible\)/);
  assert.match(library,/FOR YOUR PHASE II PRACTICE/);
  assert.match(library,/ascend:journal-context/);
});
