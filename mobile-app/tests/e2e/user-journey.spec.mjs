import {test,expect} from '@playwright/test';

const baseFixtures={
  ascend_entitlements:[{access_level:'premium',source:'journey-test',starts_at:'2026-08-26T00:00:00Z',expires_at:'2099-12-31T23:59:59Z',is_active:true}],
  path_phases:[{id:'phase-1',title:'Core Formation',sort_order:1}],
  path_stages:[
    {id:'stage-1',phase_id:'phase-1',slug:'entry-seven-days',title:'Self-Contemplation at the Beginning of the Path',subtitle:'Beginning',sort_order:1,required_practice_days:7,progression_mode:'readiness',objective:'Observe without forcing interpretation.',is_published:true,teacher_review_required:true},
    {id:'stage-2',phase_id:'phase-1',slug:'clarity',title:'Clarity of Thought',subtitle:'Clarity',sort_order:2,required_practice_days:14,progression_mode:'readiness',objective:'Develop clarity.',is_published:true}
  ],
  path_practices:[{id:'practice-1',slug:'self-contemplation',title:'Self-Contemplation',default_minutes:10,instructions:'Observe thought without following it.',is_published:true}],
  path_stage_practices:[{stage_id:'stage-1',practice_id:'practice-1',role:'primary'}],
  path_profiles:[{user_id:'00000000-0000-0000-0000-000000000001',display_name:'Integrity',current_stage_id:'stage-1',onboarding_completed_at:'2026-08-27T00:00:00Z'}],
  path_student_progress:[{user_id:'00000000-0000-0000-0000-000000000001',stage_id:'stage-1',status:'active',practice_days:7,started_at:'2026-08-20T00:00:00Z'}],
  path_attainment_markers:[{id:'marker-1',stage_id:'stage-1',title:'Inner firmness',marker_type:'steiner'}],
  path_content_items:[
    {id:'content-1',slug:'available-teaching',title:'Observation Before Interpretation',summary:'Available now',content_type:'teaching',body:'Current-stage material.',metadata:{month:1},is_published:true},
    {id:'content-2',slug:'future-teaching',title:'Future Teaching',summary:'Future material',content_type:'teaching',body:'Future-stage material.',metadata:{month:2},is_published:true},
    {id:'content-3',slug:'breath-practice',title:'Grounding Breath',summary:'A short breathing practice',content_type:'practice',body:'Practice material.',metadata:{month:1},is_published:true}
  ],
  path_content_unlock_rules:[{content_id:'content-2',stage_id:'stage-2'}],
  path_training_assignments:[],training_branches:[],training_branch_modules:[],
  path_teacher_relationships:[],path_teacher_reviews:[],path_journal_entries:[],path_student_marker_observations:[]
};

const testUser={id:'00000000-0000-0000-0000-000000000001',email:'journey@ascend.test',email_confirmed_at:'2026-08-26T00:00:00Z'};

async function mockBackend(page,fixtures,{introComplete=true}={}){
  await page.addInitScript((introComplete)=>{
    localStorage.setItem('ascendPathSession',JSON.stringify({access_token:'test-access-token',refresh_token:'test-refresh-token',expires_in:3600,token_type:'bearer'}));
    if(introComplete)localStorage.setItem('ascendPathIntroComplete:00000000-0000-0000-0000-000000000001','true');
  },introComplete);
  await page.route('https://nqionqvuudamqkfbaopk.supabase.co/auth/v1/user',async route=>{
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(testUser)});
  });
  await page.route('https://nqionqvuudamqkfbaopk.supabase.co/rest/v1/**',async route=>{
    const url=new URL(route.request().url());
    const table=url.pathname.split('/').pop();
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(fixtures[table]||[])});
  });
}

async function boot(page,fixtures=baseFixtures,opts){
  await mockBackend(page,fixtures,opts);
  await page.goto('/');
  await page.evaluate(()=>document.getElementById('splash')?.classList.add('done'));
}

test.describe('comprehensive user journey', ()=>{

  test('onboarding cannot be completed without checking the informed-consent box, and checking it lands on Today', async({page})=>{
    await boot(page,{...baseFixtures,path_profiles:[{...baseFixtures.path_profiles[0],onboarding_completed_at:null}]},{introComplete:false});
    await expect(page.locator('#path-intro')).not.toHaveClass(/hidden/);
    await page.locator('#intro-skip').click();
    await page.locator('#intro-skip').click();
    await expect(page.locator('[data-intro-step="5"]')).toHaveClass(/active/);
    await page.locator('#intro-next').click();
    await expect(page.locator('#path-intro')).not.toHaveClass(/hidden/);
    await expect(page.locator('.intro-consent')).toHaveClass(/needs-consent/);
    await page.locator('#intro-consent-check').check();
    await page.locator('#intro-next').click();
    await expect(page.locator('#path-intro')).toHaveClass(/hidden/);
    await expect(page.locator('#today')).toHaveClass(/active/);
  });

  test('a stage awaiting teacher review shows the Gateway Moment card with the right gate label', async({page})=>{
    const fixtures={
      ...baseFixtures,
      path_phases:[{...baseFixtures.path_phases[0],gate_label:'THRESHOLD OF CLARITY'}],
      path_student_progress:[{user_id:testUser.id,stage_id:'stage-1',status:'review',practice_days:7,started_at:'2026-08-20T00:00:00Z',review_requested_at:'2026-08-30T00:00:00Z'}]
    };
    await boot(page,fixtures);
    await page.getByRole('button',{name:'Path',exact:true}).click();
    await expect(page.locator('#gateway-moment')).toBeVisible();
    await expect(page.locator('#gateway-moment')).toContainText('THRESHOLD OF CLARITY');
  });

  test('Library search and content-type filters narrow results independently and compose together', async({page})=>{
    await boot(page);
    await page.getByRole('button',{name:'Library'}).click();
    await expect(page.locator('#library-list [data-slug]')).toHaveCount(3);
    await page.locator('[data-library-type="practice"]').click();
    await expect(page.locator('#library-list [data-slug]')).toHaveCount(1);
    await expect(page.locator('#library-list [data-slug="breath-practice"]')).toBeVisible();
    await page.locator('[data-library-type="all"]').click();
    await page.locator('#library-search').fill('grounding');
    await expect(page.locator('#library-list [data-slug]')).toHaveCount(1);
    await expect(page.locator('#library-list [data-slug="breath-practice"]')).toBeVisible();
    await page.locator('#library-search').fill('');
    await expect(page.locator('#library-list [data-slug]')).toHaveCount(3);
  });

  test('Day, Twilight and Night render one consistent palette across Today, Path, Library and Me', async({page})=>{
    await boot(page);
    async function bodyLuminance(){
      return page.evaluate(()=>{
        const cs=getComputedStyle(document.body);
        const src=cs.backgroundColor!=='rgba(0, 0, 0, 0)'&&!cs.backgroundColor.includes(', 0)')?cs.backgroundColor:cs.backgroundImage;
        const m=src.match(/(\d+),\s*(\d+),\s*(\d+)/);
        if(!m)return null;
        const [r,g,b]=[Number(m[1]),Number(m[2]),Number(m[3])];
        return 0.299*r+0.587*g+0.114*b;
      });
    }
    for(const mode of ['day','twilight','night']){
      await page.evaluate(m=>window.PathTheme.set(m),mode);
      await page.waitForTimeout(150);
      const luminances=[];
      for(const screen of ['today','path','library','journal','me']){
        await page.locator(`.bottom-nav button[data-screen="${screen}"]`).click();
        await page.waitForTimeout(150);
        luminances.push(await bodyLuminance());
      }
      const isLight=v=>v>150;
      const buckets=new Set(luminances.map(isLight));
      expect(buckets.size,`mode=${mode} should keep every screen on the same side of light/dark, saw luminances: ${luminances.join(', ')}`).toBe(1);
      expect(luminances[0]>150).toBe(mode==='day');
    }
  });

  test('an unpaid signed-in user sees the paywall with purchase options, not the Path', async({page})=>{
    await mockBackend(page,{...baseFixtures,ascend_entitlements:[]});
    await page.goto('/');
    await page.evaluate(()=>document.getElementById('splash')?.classList.add('done'));
    await expect(page.locator('body')).toHaveClass(/access-required/);
    await expect(page.locator('#paywall-purchase')).toBeVisible();
    await expect(page.locator('[data-tier="annual"]')).toBeVisible();
    await expect(page.getByRole('navigation',{name:'Primary navigation'})).toBeHidden();
  });

  test('Android Back closes the Library reader before leaving the Library screen', async({page})=>{
    await boot(page);
    await page.getByRole('button',{name:'Library'}).click();
    const group=page.locator('details.library-group:has([data-slug="available-teaching"])');
    await group.locator('summary').click();
    await page.locator('#library-list [data-slug="available-teaching"]').click();
    await expect(page.locator('#library-overlay')).not.toHaveClass(/hidden/);
    await page.evaluate(()=>window.ASCENDUX?.handleBack?.());
    await expect(page.locator('#library-overlay')).toHaveClass(/hidden/);
    await expect(page.locator('#library')).toHaveClass(/active/);
  });
});
