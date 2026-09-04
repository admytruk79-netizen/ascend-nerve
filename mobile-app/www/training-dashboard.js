(()=>{
  /*
   * Today/Path synchronization only.
   *
   * The previous dashboard script injected a large style block and physically
   * moved existing Today elements into newly-created containers. That made
   * rendering order-dependent and conflicted with index.html, app.js and the
   * design stylesheets. The document now owns structure; this module only
   * synchronizes progression text and progress width.
   */

  async function syncPath(){
    const stage=document.getElementById('stage-title')?.textContent?.trim()||'Beginning';
    const days=Number(document.getElementById('practice-days')?.textContent?.trim()||'0');
    let month=1;

    try{
      month=(await window.ASCENDProgression?.current?.())?.month||1;
    }catch(error){
      console.warn('ASCEND progression summary unavailable',error);
    }

    const monthLabel=document.getElementById('today-month-label');
    if(monthLabel)monthLabel.textContent=`Month ${month} of 24`;

    const dayLabel=document.getElementById('journey-now-day');
    if(dayLabel)dayLabel.textContent=`Day ${Math.max(1,days+1)}`;

    const progress=document.getElementById('today-month-progress');
    if(progress)progress.style.width=`${Math.max(4.2,Math.min(100,month/24*100))}%`;

    const legacySummary=document.getElementById('today-path-summary');
    if(legacySummary)legacySummary.textContent=`Month ${month} / 24 · ${stage} · Day ${Math.max(1,days+1)}`;
  }

  function init(){
    syncPath();
    document.addEventListener('ascend:month',syncPath);
    document.addEventListener('ascend:curriculum',syncPath);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',init,{once:true});
  }else{
    init();
  }

  window.ASCENDDashboardUX={init,syncPath};
})();
