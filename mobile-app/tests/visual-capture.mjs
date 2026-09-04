import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';

await fs.mkdir('visual-preview',{recursive:true});
const browser=await chromium.launch({headless:true});
const viewports=[
  {name:'375x812',width:375,height:812},
  {name:'390x844',width:390,height:844},
  {name:'412x915',width:412,height:915},
  {name:'tablet-768x1024',width:768,height:1024}
];

for(const viewport of viewports){
  const page=await browser.newPage({viewport:{width:viewport.width,height:viewport.height},deviceScaleFactor:1});
  await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#today .ritual-portal',{state:'attached'});
  await page.waitForFunction(()=>document.documentElement.classList.contains('theme-authority-ready'),null,{timeout:5000});
  await page.evaluate(()=>{
    document.body.classList.remove('auth-required','access-required');
    const splash=document.getElementById('splash');
    splash?.classList.add('is-hidden');
    splash?.setAttribute('aria-hidden','true');
  });
  await page.waitForTimeout(120);

  for(const mode of ['day','twilight','night']){
    await page.evaluate(theme=>{
      window.ASCENDUX?.activateScreen?.('today',{record:false,history:false});
      window.PathTheme?.set?.(theme);
      window.scrollTo(0,0);
    },mode);
    await page.waitForTimeout(80);
    await page.screenshot({path:`visual-preview/${viewport.name}-today-${mode}.png`,fullPage:false});
  }

  for(const screen of ['path','journal','library','me']){
    await page.evaluate(screenId=>{
      window.PathTheme?.set?.('night');
      window.ASCENDUX?.activateScreen?.(screenId,{record:false,history:false});
      document.body.classList.remove('auth-required','access-required');
      document.querySelectorAll('.library-overlay,.practice-overlay,.path-intro').forEach(el=>el.classList.add('hidden'));
      window.scrollTo(0,0);
    },screen);
    await page.waitForTimeout(80);
    await page.screenshot({path:`visual-preview/${viewport.name}-${screen}-night.png`,fullPage:false});
  }
  await page.close();
}

const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
await page.waitForFunction(()=>window.ASCENDUX&&window.PathTheme,null,{timeout:5000});
await page.evaluate(()=>{document.body.classList.remove('auth-required','access-required');document.getElementById('splash')?.classList.add('is-hidden');window.PathTheme.set('day')});
await page.evaluate(()=>{
  const overlay=document.getElementById('library-overlay');
  document.getElementById('library-reader-type').textContent='TEACHING · FOUNDATION';
  document.getElementById('library-title').textContent='Observation Before Interpretation';
  document.getElementById('library-body').innerHTML='<p>Before deciding what an experience means, record what actually occurred. Notice the sequence, your response, and what changed when attention became steadier.</p><p>Return to the event without embellishment.</p><div class="source-note">ASCEND Path Library · Foundation</div>';
  overlay?.classList.remove('hidden');window.scrollTo(0,0);
});
await page.screenshot({path:'visual-preview/390x844-library-reader-day.png',fullPage:false});
await page.evaluate(()=>{document.getElementById('library-overlay')?.classList.add('hidden');document.getElementById('menu-overlay')?.classList.remove('hidden');window.scrollTo(0,0)});
await page.screenshot({path:'visual-preview/390x844-menu-day.png',fullPage:false});
await page.close();
await browser.close();
