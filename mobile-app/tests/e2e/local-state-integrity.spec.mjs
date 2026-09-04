import {test,expect} from '@playwright/test';

const testUser={id:'00000000-0000-0000-0000-000000000001',email:'local-state@ascend.test',email_confirmed_at:'2026-09-04T00:00:00Z'};

test('signed-out reflection survives same-page sign-in and a failed practice save',async({page})=>{
  await page.goto('/');
  await page.evaluate(()=>document.getElementById('splash')?.classList.add('done'));

  await page.evaluate(()=>{
    const form=document.getElementById('journal-form');
    form.elements.namedItem('observation').value='Keep this signed-out reflection.';
    form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
  });

  await expect.poll(()=>page.evaluate(()=>{
    const state=JSON.parse(localStorage.getItem('ascendPathState')||'{}');
    return state.entries?.map(entry=>entry.observation)||[];
  })).toContain('Keep this signed-out reflection.');

  await page.evaluate(userRecord=>{
    const callback=`${location.origin}${location.pathname}#access_token=local-state-token&refresh_token=local-state-refresh&expires_in=3600&token_type=bearer`;
    window.PathBackend.completeOAuth(callback);
    user=userRecord;
  },testUser);
  await expect.poll(()=>page.evaluate(()=>window.PathBackend?.isSignedIn?.())).toBeTruthy();

  await page.evaluate(()=>{
    currentStage={id:'stage-1'};
    currentPractice={id:'practice-1',default_minutes:10};
    remaining=0;
    window.PathBackend.completePractice=async()=>{throw new Error('forced practice sync failure')};
  });
  await page.evaluate(()=>window.ASCENDPracticeCompletion.complete());

  const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('ascendPathState')||'{}'));
  expect(state.entries?.map(entry=>entry.observation)).toContain('Keep this signed-out reflection.');
  expect(state.pendingPractices).toHaveLength(1);
  expect(state.pendingPractices[0].reason).toContain('forced practice sync failure');
});
