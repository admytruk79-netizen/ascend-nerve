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

await browser.close();
