import {test,expect} from '@playwright/test';

const fixtures={
  path_phases:[{id:'phase-1',title:'Core Formation',sort_order:1}],
  path_stages:[
    {id:'stage-1',phase_id:'phase-1',slug:'entry-seven-days',title:'Self-Contemplation at the Beginning of the Path',subtitle:'Beginning',sort_order:1,required_practice_days:7,progression_mode:'readiness',objective:'Observe without forcing interpretation.',is_published:true},
    {id:'stage-2',phase_id:'phase-1',slug:'clarity',title:'Clarity of Thought',subtitle:'Clarity',sort_order:2,required_practice_days:14,progression_mode:'readiness',objective:'Develop clarity.',is_published:true}
  ],
  path_practices:[{id:'practice-1',slug:'self-contemplation',title:'Self-Contemplation',default_minutes:10,instructions:'Observe thought without following it.',is_published:true}],
  path_stage_practices:[{stage_id:'stage-1',practice_id:'practice-1',role:'primary'}],
  path_attainment_markers:[],
  path_content_items:[
    {id:'content-1',slug:'available-teaching',title:'Available Teaching',summary:'Available now',content_type:'teaching',body:'Current-stage material.',metadata:{month:1},is_published:true},
    {id:'content-2',slug:'future-teaching',title:'Future Teaching',summary:'Future material',content_type:'teaching',body:'Future-stage material.',metadata:{month:2},is_published:true}
  ],
  path_content_unlock_rules:[{content_id:'content-2',stage_id:'stage-2'}],
  path_training_assignments:[],training_branches:[],training_branch_modules:[]
};

const testUser={id:'00000000-0000-0000-0000-000000000001',email:'integrity@ascend.test',email_confirmed_at:'2026-08-26T00:00:00Z'};

async function boot(page){
  await page.addInitScript(()=>{
    localStorage.setItem('ascendPathSession',JSON.stringify({
      access_token:'test-access-token',
      refresh_token:'test-refresh-token',
      expires_in:3600,
      token_type:'bearer'
    }));
  });
  await page.route('https://nqionqvuudamqkfbaopk.supabase.co/auth/v1/user',async route=>{
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(testUser)});
  });
  await page.route('https://nqionqvuudamqkfbaopk.supabase.co/rest/v1/**',async route=>{
    const url=new URL(route.request().url());
    const table=url.pathname.split('/').pop();
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(fixtures[table]||[])});
  });
  await page.goto('/');
  await page.evaluate(()=>document.getElementById('splash')?.classList.add('done'));
  await expect(page.locator('body')).not.toHaveClass(/auth-required/);
  await expect(page.locator('#stage-title')).toContainText('Self-Contemplation');
}

test('empty Journal never persists and meaningful Journal persists remotely when authenticated',async({page})=>{
  await boot(page);
  await page.getByRole('button',{name:'Journal',exact:true}).click();
  await page.getByRole('button',{name:'Save Reflection'}).click();
  await expect(page.locator('#journal-status')).toContainText('at least one observation');
  const count=await page.evaluate(()=>JSON.parse(localStorage.getItem('ascendPathState')||'{"entries":[]}').entries.length);
  expect(count).toBe(0);

  await page.locator('textarea[name="life_application"]').fill('Paused before responding.');
  const requestPromise=page.waitForRequest(request=>request.url().includes('/rest/v1/path_journal_entries')&&request.method()==='POST');
  await page.getByRole('button',{name:'Save Reflection'}).click();
  const request=await requestPromise;
  const payload=request.postDataJSON();
  expect(payload.life_application).toBe('Paused before responding.');
  expect(payload.user_id).toBe(testUser.id);
  await expect(page.locator('#journal-status')).toContainText('saved privately to your ASCEND Path journal');
  const localEntries=await page.evaluate(()=>JSON.parse(localStorage.getItem('ascendPathState')||'{"entries":[]}').entries);
  expect(localEntries).toHaveLength(0);
});

test('Library recommendations never surface locked future material and cards work from keyboard',async({page})=>{
  await boot(page);
  await page.getByRole('button',{name:'Library'}).click();
  await expect(page.locator('#library-recommended [data-slug="future-teaching"]')).toHaveCount(0);
  await expect(page.locator('#library-list [data-slug="future-teaching"]')).toHaveAttribute('aria-disabled','true');
  const available=page.locator('#library-list [data-slug="available-teaching"]');
  await expect(available).toHaveAttribute('role','button');
  await available.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#library-overlay')).not.toHaveClass(/hidden/);
  await expect(page.locator('#library-title')).toHaveText('Available Teaching');
});

test('Finish Practice cannot advance before the timer completes',async({page})=>{
  await boot(page);
  await page.getByRole('button',{name:'Begin Practice'}).click();
  await page.getByRole('button',{name:'Finish Practice'}).click();
  await expect(page.locator('#timer-hint')).toContainText('Complete the full practice timer');
  const days=await page.evaluate(()=>JSON.parse(localStorage.getItem('ascendPathState')||'{"practiceDays":0}').practiceDays||0);
  expect(days).toBe(0);
  await expect(page.locator('#primary-check')).not.toBeChecked();
});