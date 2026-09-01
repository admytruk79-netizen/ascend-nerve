import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';

await fs.mkdir('visual-preview',{recursive:true});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:430,height:932},deviceScaleFactor:1});
await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
await page.waitForSelector('#today-v3',{state:'attached'});
await page.waitForSelector('.today-v3-hero[data-approved-hero-loaded="true"]',{state:'attached',timeout:10000});
await page.waitForFunction(()=>document.documentElement.classList.contains('theme-authority-ready'),null,{timeout:5000});

await page.evaluate(()=>{
  document.body.classList.remove('auth-required','access-required');
  const splash=document.getElementById('splash');
  splash?.classList.add('is-hidden','done');
  splash?.setAttribute('aria-hidden','true');
});
// The real splash fades for 800ms. Do not mistake a partially fading splash for app UI.
await page.waitForTimeout(900);

for(const mode of ['day','twilight','night']){
  await page.evaluate(theme=>{
    window.ASCENDUX?.activateScreen?.('today',{record:false});
    window.PathTheme?.set?.(theme);
    document.documentElement.dataset.theme=theme;
    window.scrollTo(0,0);
  },mode);
  await page.waitForTimeout(250);
  await page.screenshot({path:`visual-preview/today-${mode}.png`,fullPage:false});
}

// Regression proof: Day must remain Day while navigating.
for(const screen of ['today','path','journal','library','me']){
  await page.evaluate(screenId=>{
    window.PathTheme?.set?.('day');
    window.ASCENDUX?.activateScreen?.(screenId,{record:false});
    document.body.classList.remove('auth-required','access-required');
    document.querySelectorAll('.library-overlay,.practice-overlay').forEach(el=>el.classList.add('hidden'));
    window.scrollTo(0,0);
  },screen);
  await page.waitForTimeout(220);
  await page.screenshot({path:`visual-preview/day-${screen}.png`,fullPage:false});
}

// Inspect the spaces users enter after the primary navigation screens.
await page.evaluate(()=>{
  window.PathTheme?.set?.('day');
  document.documentElement.dataset.theme='day';
  document.querySelectorAll('.library-overlay,.practice-overlay').forEach(el=>el.classList.add('hidden'));
  const overlay=document.getElementById('library-overlay');
  const type=document.getElementById('library-reader-type');
  const title=document.getElementById('library-title');
  const body=document.getElementById('library-body');
  if(type)type.textContent='TEACHING · FOUNDATION';
  if(title)title.textContent='Observation Before Interpretation';
  if(body)body.innerHTML='<p>Before deciding what an experience means, record what actually occurred. Notice the sequence, your response, and what changed when attention became steadier.</p><p>Return to the event without embellishment. The work is not to produce a conclusion, but to strengthen the capacity to see.</p><div class="source-note">ASCEND Path Library · Foundation</div>';
  overlay?.classList.remove('hidden');
  window.scrollTo(0,0);
});
await page.waitForTimeout(220);
await page.screenshot({path:'visual-preview/day-reader.png',fullPage:false});

await page.evaluate(()=>{
  window.PathTheme?.set?.('night');
  document.documentElement.dataset.theme='night';
  window.scrollTo(0,0);
});
await page.waitForTimeout(220);
await page.screenshot({path:'visual-preview/night-reader.png',fullPage:false});

await page.evaluate(()=>{
  document.getElementById('library-overlay')?.classList.add('hidden');
  window.PathTheme?.set?.('twilight');
  document.documentElement.dataset.theme='twilight';
  const briefing=document.getElementById('practice-briefing');
  const title=document.getElementById('briefing-title');
  const intention=document.getElementById('briefing-intention');
  const duration=document.getElementById('briefing-duration');
  if(title)title.textContent='Self-Contemplation';
  if(intention)intention.textContent='Observe the movement of thought without following it. Return to the chosen point of attention each time you notice you have drifted.';
  if(duration)duration.textContent='10 minutes · Foundation practice';
  briefing?.classList.remove('hidden');
  window.scrollTo(0,0);
});
await page.waitForTimeout(220);
await page.screenshot({path:'visual-preview/twilight-briefing.png',fullPage:false});

await page.evaluate(()=>{
  document.getElementById('practice-briefing')?.classList.add('hidden');
  window.PathTheme?.set?.('day');
  document.documentElement.dataset.theme='day';
  document.getElementById('menu-overlay')?.classList.remove('hidden');
  window.scrollTo(0,0);
});
await page.waitForTimeout(220);
await page.screenshot({path:'visual-preview/day-menu.png',fullPage:false});

const candidates=[
  'self-observation-humility.png',
  'march-object-contemplation.png',
  'march-what-am-i-noticing.png',
  'march-focused-thought.png',
  'presence-devotion.png',
  'august-presence-devotion.png',
  'morning-evening-energy.png',
  'april-deliberate-action.png',
  'april-training-the-will.png',
  'april-where-does-will-begin.png',
  'where-does-will-begin.png',
  'may-openness-readiness.png',
  'openness-readiness.png',
  'discipline-or-freedom.png',
  'building-or-draining.png',
  'confidence-humanity.png',
  'mastery-of-feeling.png',
  'two-currents-meeting.png'
];
const gallery=await browser.newPage({viewport:{width:900,height:1400},deviceScaleFactor:1});
await gallery.setContent(`<!doctype html><meta charset="utf-8"><style>body{margin:0;padding:18px;background:#f6f0e3;font-family:Arial,sans-serif}.g{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}.c{background:white;border:1px solid #d9c9a4;border-radius:16px;overflow:hidden}.c img{display:block;width:100%;height:330px;object-fit:cover;background:#ddd}.c p{margin:0;padding:10px 12px;font-size:14px}</style><div class="g">${candidates.map(name=>`<div class="c"><img src="http://127.0.0.1:4173/assets/seasonal-art/${name}"><p>${name}</p></div>`).join('')}</div>`);
await gallery.waitForTimeout(1200);
await gallery.screenshot({path:'visual-preview/asset-candidates.png',fullPage:true});
await browser.close();