import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const sql=fs.readFileSync(new URL('../../supabase/pending_migrations/phase_i_month_practice_completion_authority.sql',import.meta.url),'utf8');

test('Core completion only accepts primary progression roles',()=>{
  assert.match(sql,/sp\.role in \('month_primary','primary'\)/);
  for(const role of ['supporting','continuing','morning','evening','weekly']){
    assert.doesNotMatch(sql,new RegExp(`sp\\.role in \\([^\\)]*${role}`));
  }
  assert.match(sql,/practice is not a Core progression practice for this stage/);
});

test('calendar-month authority ignores day-of-month boundaries',()=>{
  assert.doesNotMatch(sql,/age\(current_date/);
  assert.match(sql,/extract\(year from current_date\)/);
  assert.match(sql,/extract\(month from current_date\)/);
  const calendarMonth=(started,now)=>Math.max(1,(now.getFullYear()-started.getFullYear())*12+(now.getMonth()-started.getMonth())+1);
  assert.equal(calendarMonth(new Date(2026,0,31),new Date(2026,1,1)),2);
  assert.equal(calendarMonth(new Date(2024,0,30),new Date(2024,1,1)),2);
  assert.equal(calendarMonth(new Date(2024,1,29),new Date(2024,2,1)),2);
  assert.equal(calendarMonth(new Date(2026,11,31),new Date(2027,0,1)),2);
});

test('practice remains recordable during teacher review without bypassing review',()=>{
  assert.match(sql,/status in \('active','review'\)/);
  assert.match(sql,/stage_status_at_completion',v_progress\.status/);
  assert.match(sql,/if v_progress\.status='active'[\s\S]*v_stage\.progression_mode='time'/);
  assert.doesNotMatch(sql,/if v_progress\.status='review'[\s\S]*set status='established'/);
});
