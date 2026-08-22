(function(){
  const MONTHS = [
    [1,1,'Foundation · Self-Contemplation'],
    [2,2,'Clarity of Thought'],
    [3,3,'Will & Constancy'],
    [4,4,'Equanimity'],
    [5,5,'Positive Perception'],
    [6,6,'Openness to the New'],
    [7,7,'Impartial Retrospect'],
    [8,8,'Consolidation · Continuing Practice'],
    [9,9,'Consolidation · Observation & Integration'],
    [10,10,'Preparation · Review & Readiness'],
    [11,11,'Part II · Energy Gain'],
    [12,12,'Part II · Star Energy & Balancing'],
    [13,13,'Part II · Emptiness & Acceptance'],
    [14,14,'Part II · New Tools'],
    [15,15,'Part II · Green Sphere & Protection'],
    [16,16,'Part II · Helping the World'],
    [17,17,'Part II · Integration'],
    [18,18,'Part II · Consolidation'],
    [19,19,'Part III · Seven Chakra Foundation'],
    [20,20,'Part III · Elements'],
    [21,21,'Part III · Inner Octaves'],
    [22,22,'Part III · Three Centres & Attention'],
    [23,23,'Part III · Ancestors & Higher Self'],
    [24,24,'Part III · Final Integration']
  ];

  const style=document.createElement('style');
  style.textContent=`
    .month-path{display:grid;gap:10px;margin:18px 0 28px}
    .month-card{display:flex;align-items:center;gap:14px;padding:15px 16px;border:1px solid rgba(255,255,255,.10);border-radius:18px;background:rgba(255,255,255,.035);text-align:left}
    .month-card.current{border-color:rgba(201,162,39,.55);background:rgba(201,162,39,.08);box-shadow:0 0 28px rgba(201,162,39,.08)}
    .month-card.done{opacity:.72}
    .month-number{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;border:1px solid rgba(255,255,255,.16);font-size:12px;letter-spacing:.08em;flex:0 0 auto}
    .month-card.current .month-number{border-color:rgba(201,162,39,.8)}
    .month-copy{min-width:0}.month-copy strong{display:block;font-size:14px}.month-copy small{display:block;margin-top:4px;opacity:.62;font-size:11px}
    .month-gate{margin-left:auto;font-size:9px;letter-spacing:.12em;opacity:.48;white-space:nowrap}
    .month-heading{margin:26px 0 8px;font-size:10px;letter-spacing:.18em;opacity:.58}
  `;
  document.head.appendChild(style);

  function paint(){
    const list=document.getElementById('path-list');
    if(!list || list.dataset.monthPath==='1' || !list.children.length) return;
    const rows=[...list.children];
    const currentIndex=Math.max(0,rows.findIndex(r=>r.classList.contains('current')));
    list.innerHTML='';
    list.classList.add('month-path');
    list.dataset.monthPath='1';
    const heading=document.createElement('div'); heading.className='month-heading'; heading.textContent='24-MONTH FORMATION'; list.appendChild(heading);
    MONTHS.forEach(([month,,title],i)=>{
      const card=document.createElement('article');
      card.className='month-card'+(i===currentIndex?' current':'')+(i<currentIndex?' done':'');
      const state=i<currentIndex?'COMPLETED':i===currentIndex?'CURRENT':'LOCKED';
      card.innerHTML='<div class="month-number">'+String(month).padStart(2,'0')+'</div><div class="month-copy"><strong>Month '+month+'</strong><small>'+title+'</small></div><div class="month-gate">'+state+'</div>';
      list.appendChild(card);
    });
  }

  const observer=new MutationObserver(()=>paint());
  document.addEventListener('DOMContentLoaded',()=>{
    const list=document.getElementById('path-list');
    if(list){observer.observe(list,{childList:true}); paint();}
  });
})();
