(()=>{
  /*
   * Stable screen bridge.
   *
   * The previous version of this file injected additional CSS files at runtime
   * and rebuilt large portions of Path, Library, Journal and Me after first
   * paint. That created competing visual authorities and visible layout shifts.
   *
   * Screen structure now stays in index.html and visual authority stays in the
   * stylesheets loaded by index.html. This bridge only performs small,
   * data-driven synchronisation that does not replace the screen DOM.
   */

  function latestLocalEntry(){
    try{
      const state=JSON.parse(localStorage.getItem('ascendPathState')||'{}');
      return Array.isArray(state.entries)&&state.entries.length
        ? state.entries[state.entries.length-1]
        : null;
    }catch{
      return null;
    }
  }

  function excerpt(entry){
    if(!entry)return 'Your next saved observation will appear here.';
    const value=entry.observation||entry.life_application||entry.inner_state||entry.interpretation||entry.unresolved||'';
    const clean=String(value).trim();
    return clean.length>132?`${clean.slice(0,129)}…`:clean||'Observation saved.';
  }

  function syncJournal(){
    const entry=latestLocalEntry();
    const copy=document.getElementById('approved-recent-copy');
    if(copy)copy.textContent=excerpt(entry);

    const title=document.getElementById('approved-recent-title');
    if(title)title.textContent=entry?'Latest observation':'No recent observation yet';

    const stage=document.getElementById('profile-stage')?.textContent?.trim()||'Current stage';
    const stageEl=document.getElementById('approved-journey-stage');
    if(stageEl)stageEl.textContent=stage;

    const days=parseInt(document.getElementById('practice-days')?.textContent||'0',10)||0;
    const daysEl=document.getElementById('approved-journey-days');
    if(daysEl){
      daysEl.textContent=days
        ? `${days} practice days recorded in this stage.`
        : 'Begin the current practice, then record what you actually observed.';
    }
  }

  function syncNavigation(){
    const nav=document.querySelector('.bottom-nav button[data-screen="me"]');
    if(nav)nav.textContent='Me';
    const menu=document.querySelector('.menu-link[data-menu-screen="me"]');
    if(menu)menu.textContent='Me';
  }

  function mount(){
    syncNavigation();
    syncJournal();
    document.addEventListener('ascend:curriculum',syncJournal);
    document.getElementById('journal-form')?.addEventListener('submit',()=>setTimeout(syncJournal,900));
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',mount,{once:true});
  }else{
    mount();
  }
})();
