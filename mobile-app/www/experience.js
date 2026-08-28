(()=>{
  const splash=document.getElementById('splash');
  const splashStartedAt=Date.now();
  const MIN_SPLASH_MS=2400;
  const MAX_SPLASH_MS=12000;
  let splashDismissed=false;

  // Repair logo references if a stale Android/web asset bundle fails to resolve
  // the local image. This keeps the header, splash and intro branding visible.
  const LOGO_FALLBACK='https://raw.githubusercontent.com/admytruk79-netizen/ascend-nerve/ascend-path-foundation/mobile-app/www/assets/ascend-logo.png';
  const repairLogos=()=>{
    document.querySelectorAll('img[src$="assets/ascend-logo.png"],img[src="assets/ascend-logo.png"]').forEach(img=>{
      if(img.dataset.logoFallbackBound)return;
      img.dataset.logoFallbackBound='true';
      const useFallback=()=>{
        if(img.dataset.logoFallbackUsed)return;
        img.dataset.logoFallbackUsed='true';
        img.src=LOGO_FALLBACK;
      };
      img.addEventListener('error',useFallback,{once:true});
      if(img.complete&&img.naturalWidth===0)useFallback();
    });
  };
  repairLogos();
  document.addEventListener('DOMContentLoaded',repairLogos,{once:true});
  window.addEventListener('load',repairLogos,{once:true});

  // The splash is the first-paint boot shield. Keep the app completely hidden
  // while auth, entitlement, curriculum and the intro decision hydrate behind it.
  // The existing ASCEND Path cinematic intro remains untouched and is revealed
  // only after this boot layer has completed.
  const startupStateSettled=()=>{
    try{
      if(!window.PathBackend)return false;
      if(!window.PathBackend?.isSignedIn?.()){
        return !document.body.classList.contains('access-required');
      }
      if(document.body.classList.contains('access-required'))return true;
      const appReady=!document.body.classList.contains('auth-required')&&!!window.curriculum;
      const introReady=window.__ASCEND_INTRO_DECIDED===true;
      return appReady&&introReady;
    }catch{return false}
  };

  const dismissSplash=()=>{
    if(splashDismissed)return;
    splashDismissed=true;
    requestAnimationFrame(()=>{
      document.documentElement.classList.remove('ascend-booting');
      requestAnimationFrame(()=>splash?.classList.add('done'));
    });
  };

  const finishSplashWhenReady=()=>{
    if(splashDismissed)return;
    const elapsed=Date.now()-splashStartedAt;
    const minimumComplete=elapsed>=MIN_SPLASH_MS;
    const hardLimitReached=elapsed>=MAX_SPLASH_MS;
    if(minimumComplete&&(startupStateSettled()||hardLimitReached)){
      dismissSplash();
      return;
    }
    setTimeout(finishSplashWhenReady,80);
  };

  window.addEventListener('load',finishSplashWhenReady,{once:true});
  document.addEventListener('ascend:intro-decided',finishSplashWhenReady);
  document.addEventListener('ascend:curriculum',finishSplashWhenReady);
  setTimeout(finishSplashWhenReady,60);

  const overlay=document.getElementById('library-overlay');
  const close=()=>overlay?.classList.add('hidden');
  document.querySelector('.library-close')?.addEventListener('click',close);
  overlay?.addEventListener('click',e=>{if(e.target===overlay)close()});

  const aboutOverlay=document.getElementById('about-overlay');
  const closeAbout=()=>aboutOverlay?.classList.add('hidden');
  document.getElementById('menu-button')?.addEventListener('click',()=>aboutOverlay?.classList.remove('hidden'));
  document.querySelector('.about-close')?.addEventListener('click',closeAbout);
  aboutOverlay?.addEventListener('click',e=>{if(e.target===aboutOverlay)closeAbout()});

  const escapeText=(value='')=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const paragraphs=(text='')=>String(text).split(/\n\s*\n|\n/).map(x=>x.trim()).filter(Boolean).map(p=>`<p>${escapeText(p)}</p>`).join('');

  const openLibraryItem=e=>{
    const card=e.target.closest('.content-card');
    if(!card||card.classList.contains('locked')||!window.curriculum)return;
    const slug=card.dataset.slug;
    const title=card.querySelector('strong')?.textContent?.trim();
    const item=window.curriculum.content?.find(x=>slug?x.slug===slug:x.title===title);
    if(!item)return;
    window.LibraryEngine?.recordLibraryView(item);
    document.getElementById('library-type').textContent=(item.content_type||'TEACHING').toUpperCase();
    document.getElementById('library-title').textContent=item.title||'';
    const body=item.body||item.summary||'This item is available as part of your current Path stage.';
    document.getElementById('library-body').innerHTML=paragraphs(body)+`<div class="source-note">ASCEND Path Library · ${escapeText(item.metadata?.source||'ASCEND curriculum')}</div>`;
    overlay.classList.remove('hidden');
  };
  document.getElementById('library-list')?.addEventListener('click',openLibraryItem);
  document.getElementById('library-recommended')?.addEventListener('click',openLibraryItem);
  const openLibraryItemFromKeyboard=e=>{
    if(e.key!=='Enter'&&e.key!==' ')return;
    const card=e.target.closest('.content-card[role="button"]');
    if(!card||card.getAttribute('aria-disabled')==='true')return;
    e.preventDefault();openLibraryItem(e);
  };
  document.getElementById('library-list')?.addEventListener('keydown',openLibraryItemFromKeyboard);
  document.getElementById('library-recommended')?.addEventListener('keydown',openLibraryItemFromKeyboard);

  const wait=()=>{
    try{if(typeof curriculum!=='undefined'&&curriculum){window.curriculum=curriculum;finishSplashWhenReady();return}}catch{}
    setTimeout(wait,350);
  };
  wait();
})();

// Path rows are navigation, not decoration. Keep progression locked while
// allowing students to inspect every named stage and return to the current one.
(()=>{
  const list=document.getElementById('path-list');
  if(!list)return;

  const style=document.createElement('style');
  style.textContent=`
    #path-list li:not(.future){cursor:pointer;position:relative;padding-right:2.25rem;-webkit-tap-highlight-color:transparent}
    #path-list li:not(.future)::after{content:'›';position:absolute;right:.85rem;top:50%;transform:translateY(-50%);font-size:1.55rem;line-height:1;opacity:.45}
    #path-list li:not(.future):focus-visible{outline:2px solid currentColor;outline-offset:3px;border-radius:14px}
    #path-list li:not(.future):active{transform:scale(.992)}
    .path-stage-sheet{position:fixed;inset:0;z-index:10020;background:rgba(3,7,9,.72);backdrop-filter:blur(12px);display:flex;align-items:flex-end;justify-content:center;padding:18px}
    .path-stage-sheet.hidden{display:none}
    .path-stage-panel{width:min(100%,620px);max-height:82vh;overflow:auto;border:1px solid rgba(255,255,255,.12);border-radius:26px 26px 20px 20px;padding:22px;background:var(--surface,#101718);box-shadow:0 -18px 70px rgba(0,0,0,.35)}
    .path-stage-panel .sheet-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px}
    .path-stage-panel .sheet-close{border:0;background:transparent;color:inherit;font-size:1.8rem;line-height:1;padding:2px 7px;cursor:pointer}
    .path-stage-panel h2{margin:.35rem 0 .45rem}.path-stage-panel p{line-height:1.55}
    .path-stage-status{font-size:.76rem;letter-spacing:.12em;text-transform:uppercase;opacity:.65}
    .path-stage-meta{display:flex;gap:10px;flex-wrap:wrap;margin:16px 0}
    .path-stage-meta span{border:1px solid rgba(255,255,255,.12);border-radius:999px;padding:6px 10px;font-size:.82rem}
    .path-stage-actions{display:flex;gap:10px;margin-top:20px}.path-stage-actions button{flex:1}
  `;
  document.head.appendChild(style);

  const sheet=document.createElement('div');
  sheet.className='path-stage-sheet hidden';
  sheet.setAttribute('role','dialog');
  sheet.setAttribute('aria-modal','true');
  sheet.setAttribute('aria-labelledby','path-stage-sheet-title');
  sheet.innerHTML=`<div class="path-stage-panel"><div class="sheet-head"><div><div class="path-stage-status" id="path-stage-sheet-status"></div><h2 id="path-stage-sheet-title"></h2></div><button class="sheet-close" type="button" aria-label="Close stage details">×</button></div><div id="path-stage-sheet-body"></div><div class="path-stage-actions" id="path-stage-sheet-actions"></div></div>`;
  document.body.appendChild(sheet);

  const closeSheet=()=>sheet.classList.add('hidden');
  sheet.querySelector('.sheet-close').addEventListener('click',closeSheet);
  sheet.addEventListener('click',e=>{if(e.target===sheet)closeSheet()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!sheet.classList.contains('hidden'))closeSheet()});

  const practiceFor=stage=>{
    const c=window.curriculum;
    const link=c?.links?.find(l=>l.stage_id===stage.id&&l.role==='primary');
    return link?c?.practices?.find(p=>p.id===link.practice_id):null;
  };
  const progressForStage=stage=>window.__pathProgress?.find(p=>p.stage_id===stage.id);

  const openStage=stage=>{
    const current=stage.id===window.currentStage?.id;
    const progress=progressForStage(stage);
    const established=progress?.status==='established';
    const review=progress?.status==='review';
    const practice=practiceFor(stage);
    const phase=window.curriculum?.phases?.find(p=>p.id===stage.phase_id);
    const status=current?'Current stage':established?'Established':review?'In review':'Preview';
    const required=Number(stage.required_practice_days)||0;
    const completed=Number(progress?.practice_days)||0;
    document.getElementById('path-stage-sheet-status').textContent=status;
    document.getElementById('path-stage-sheet-title').textContent=stage.title||'Path stage';
    document.getElementById('path-stage-sheet-body').innerHTML=`${stage.objective?`<p>${escapeText(stage.objective)}</p>`:''}<div class="path-stage-meta">${phase?.title?`<span>${escapeText(phase.title)}</span>`:''}${practice?.default_minutes?`<span>${practice.default_minutes} min practice</span>`:''}${required?`<span>${Math.min(completed,required)} / ${required} days</span>`:''}</div>${practice?.instructions?`<p>${escapeText(practice.instructions)}</p>`:''}${!current&&!established&&!review?'<p><small>This stage is visible for orientation. Its practice unlocks through normal Path progression.</small></p>':''}`;
    const actions=document.getElementById('path-stage-sheet-actions');
    actions.innerHTML='';
    if(current){
      const continueBtn=document.createElement('button');
      continueBtn.type='button';continueBtn.className='primary';continueBtn.textContent='Continue Practice';
      continueBtn.addEventListener('click',()=>{closeSheet();window.ASCENDOpenPractice?.()});
      actions.appendChild(continueBtn);
    }else{
      const closeBtn=document.createElement('button');
      closeBtn.type='button';closeBtn.className='secondary';closeBtn.textContent=established?'Close Review':'Back to Path';
      closeBtn.addEventListener('click',closeSheet);actions.appendChild(closeBtn);
    }
    sheet.classList.remove('hidden');
    sheet.querySelector('.sheet-close').focus();
  };

  const hydrateRows=()=>{
    [...list.querySelectorAll('li')].forEach(li=>{
      if(li.classList.contains('future'))return;
      const title=li.querySelector('strong')?.textContent?.trim();
      const stage=window.curriculum?.stages?.find(s=>s.title===title);
      if(!stage)return;
      li.dataset.stageId=stage.id;
      li.setAttribute('role','button');
      li.setAttribute('tabindex','0');
      li.setAttribute('aria-label',`Open ${stage.title}`);
    });
  };

  list.addEventListener('click',e=>{
    const li=e.target.closest('li[data-stage-id]');if(!li)return;
    const stage=window.curriculum?.stages?.find(s=>String(s.id)===String(li.dataset.stageId));
    if(stage)openStage(stage);
  });
  list.addEventListener('keydown',e=>{
    if(e.key!=='Enter'&&e.key!==' ')return;
    const li=e.target.closest('li[data-stage-id]');if(!li)return;
    e.preventDefault();const stage=window.curriculum?.stages?.find(s=>String(s.id)===String(li.dataset.stageId));
    if(stage)openStage(stage);
  });
  new MutationObserver(hydrateRows).observe(list,{childList:true,subtree:true});
  document.addEventListener('ascend:curriculum',()=>setTimeout(hydrateRows,0));
  hydrateRows();
})();
// Build trigger: signed Play AAB
// Build trigger: signed Play AAB 2026-08-27
