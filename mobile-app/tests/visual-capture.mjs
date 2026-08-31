import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';

await fs.mkdir('visual-preview',{recursive:true});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:430,height:932},deviceScaleFactor:1});
await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
await page.waitForSelector('#today-v3',{state:'attached'});
await page.waitForSelector('.today-v3-hero[data-approved-hero-loaded="true"]',{state:'attached',timeout:10000});

for(const mode of ['day','twilight','night']){
  await page.evaluate(theme=>{
    document.body.classList.remove('auth-required','access-required');
    const splash=document.getElementById('splash');
    splash?.classList.add('is-hidden','done');
    splash?.setAttribute('aria-hidden','true');
    window.ASCENDUX?.activateScreen?.('today',{record:false});
    window.PathTheme?.set?.(theme);
    document.documentElement.dataset.theme=theme;
    window.scrollTo(0,0);
  },mode);
  await page.waitForTimeout(200);
  await page.screenshot({path:`visual-preview/today-${mode}.png`,fullPage:false});
}

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
