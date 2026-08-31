import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';

await fs.mkdir('visual-preview',{recursive:true});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:430,height:932},deviceScaleFactor:1});
await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
await page.waitForSelector('#today-v3',{state:'attached'});

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
  await page.waitForTimeout(350);
  await page.screenshot({path:`visual-preview/today-${mode}.png`,fullPage:false});
}

const candidates=[
  'august-presence-devotion.png',
  'march-reverence-patience.png',
  'self-love.png',
  'softness-courage.png',
  'steadfastness-gentleness.png',
  'spring-march-awakening-perception.png',
  'winter-january-grounding-silence.png',
  'ready-to-release.png',
  'acceptance-practice.png',
  'heart-opening.png',
  'emotional-composure.png'
];
const gallery=await browser.newPage({viewport:{width:900,height:1400},deviceScaleFactor:1});
await gallery.setContent(`<!doctype html><meta charset="utf-8"><style>body{margin:0;padding:18px;background:#f6f0e3;font-family:Arial,sans-serif}.g{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}.c{background:white;border:1px solid #d9c9a4;border-radius:16px;overflow:hidden}.c img{display:block;width:100%;height:330px;object-fit:cover;background:#ddd}.c p{margin:0;padding:10px 12px;font-size:14px}</style><div class="g">${candidates.map(name=>`<div class="c"><img src="http://127.0.0.1:4173/assets/seasonal-art/${name}"><p>${name}</p></div>`).join('')}</div>`);
await gallery.waitForTimeout(1200);
await gallery.screenshot({path:'visual-preview/asset-candidates.png',fullPage:true});
await browser.close();
