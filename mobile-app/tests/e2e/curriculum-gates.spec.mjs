import {test,expect} from '@playwright/test';

const user={id:'00000000-0000-0000-0000-000000000041',email:'curriculum@ascend.test',email_confirmed_at:'2026-09-01T00:00:00Z'};
const entitlements=[{access_level:'premium',source:'curriculum-gate-test',starts_at:'2026-09-01T00:00:00Z',expires_at:'2099-12-31T23:59:59Z',is_active:true}];
const branches=[
  {id:'branch-development',slug:'development-program',title:'The Development Program',subtitle:'Akharata supporting work',description:'Phase I additional practice',sort_order:1,is_published:true},
  {id:'branch-ancestral',slug:'ancestral-roots',title:'Ancestral Roots',subtitle:'Independent specialist sequence',description:'Ancestral branch',sort_order:2,is_published:true},
  {id:'branch-phase-two',slug:'sphere-of-attention',title:'Sphere of Attention',subtitle:'Advanced formation',description:'Phase II sequence',sort_order:3,is_published:true}
];
const modules=[
  {id:'module-development',branch_id:'branch-development',module_number:1,phase_number:1,title:'Development Practice',summary:'Supporting practice',minimum_repetitions:1,safety_level:'standard',metadata:{},is_published:true},
  {id:'module-ancestral',branch_id:'branch-ancestral',module_number:1,phase_number:1,title:'Ancestral Session One',summary:'Branch practice',minimum_repetitions:1,safety_level:'standard',metadata:{},is_published:true},
  {id:'module-phase-two',branch_id:'branch-phase-two',module_number:1,phase_number:1,title:'Sphere Practice One',summary:'Advanced practice',minimum_repetitions:1,safety_level:'standard',metadata:{},is_published:true}
];

async function boot(page,{phaseIIAllowed=false}={}){
  await page.addInitScript(()=>localStorage.setItem('ascendPathSession',JSON.stringify({access_token:'curriculum-token',refresh_token:'curriculum-refresh',expires_in:3600,token_type:'bearer'})));
  await page.route('https://nqionqvuudamqkfbaopk.supabase.co/auth/v1/user',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(user)}));
  await page.route('https://nqionqvuudamqkfbaopk.supabase.co/rest/v1/**',async route=>{
    const url=new URL(route.request().url());
    const name=url.pathname.split('/').pop();
    let body=[];
    if(name==='ascend_entitlements')body=entitlements;
    else if(name==='path_phases')body=[{id:'phase-one',title:'Core Formation',sort_order:1,is_published:true}];
    else if(name==='path_stages')body=[{id:'stage-one',phase_id:'phase-one',slug:'entry-seven-days',title:'Entry',subtitle:'Entry',sort_order:1,required_practice_days:7,progression_mode:'readiness',objective:'Observe.',is_published:true}];
    else if(name==='path_practices')body=[{id:'practice-one',slug:'entry-self-contemplation',title:'Self-Contemplation',default_minutes:10,instructions:'Observe.',metadata:{},is_published:true}];
    else if(name==='path_stage_practices')body=[{stage_id:'stage-one',practice_id:'practice-one',role:'primary'}];
    else if(name==='path_profiles')body=[{user_id:user.id,current_stage_id:'stage-one',path_started_at:'2026-09-01T00:00:00Z',onboarding_completed_at:'2026-09-01T00:00:00Z'}];
    else if(name==='path_student_progress')body=[{id:'progress-one',user_id:user.id,stage_id:'stage-one',status:'active',practice_days:0,started_at:'2026-09-01T00:00:00Z'}];
    else if(name==='training_branches')body=branches;
    else if(name==='training_branch_modules')body=modules;
    else if(name==='training_branch_progress')body=[];
    else if(name==='path_phase_ii_access')body={allowed:phaseIIAllowed,reason:phaseIIAllowed?'open_gate_established':'phase_i_open_gate_required'};
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
  });
  await page.goto('/');
  await page.evaluate(()=>document.getElementById('splash')?.classList.add('done'));
  await page.waitForFunction(()=>document.documentElement.dataset.ascendMasterReady==='1');
  await expect(page.locator('body')).not.toHaveClass(/auth-required|access-required/);
  await page.getByRole('button',{name:'Path',exact:true}).click();
  await expect(page.locator('#practice-branches')).toBeVisible();
}

test('Path separates Phase I additional work, Practice Branches, and locked Phase II',async({page})=>{
  await boot(page);
  await expect(page.locator('#phase-one-additional')).toContainText('The Development Program');
  await expect(page.locator('#practice-branches')).toContainText('Ancestral Roots');
  await expect(page.locator('#practice-branches')).not.toContainText('Sphere of Attention');
  await expect(page.locator('#phase-two-advanced')).toContainText('Sphere of Attention');
  const phaseTwoCard=page.locator('#phase-two-advanced .branch-card').filter({hasText:'Sphere of Attention'});
  await expect(phaseTwoCard).toHaveClass(/locked/);
  await expect(phaseTwoCard.getByRole('button',{name:'Open Gate Required'})).toBeDisabled();
});

test('Phase II card becomes operable only when the authoritative Open Gate RPC allows it',async({page})=>{
  await boot(page,{phaseIIAllowed:true});
  const phaseTwoCard=page.locator('#phase-two-advanced .branch-card').filter({hasText:'Sphere of Attention'});
  await expect(phaseTwoCard).not.toHaveClass(/locked/);
  await expect(phaseTwoCard.getByRole('button')).toBeEnabled();
});
