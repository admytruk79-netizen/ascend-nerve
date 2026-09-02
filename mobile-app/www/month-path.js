(()=>{
  const GROUPS=[
    {title:'Foundation',range:'Months 1–7',start:1,end:7,description:'Attention, thought, will and emotional balance'},
    {title:'Tools & Integration',range:'Months 8–18',start:8,end:18,description:'Consolidation, energetic tools and service'},
    {title:'Expanded Practice',range:'Months 19–24',start:19,end:24,description:'Chakras, elements, centres and final integration'}
  ];
  const style=document.createElement('style');style.textContent=`
    .month-path{display:grid;gap:10px;margin:14px 0 28px;padding:0!important}.month-path:before{display:none!important}
    .core-now{padding:18px;border:1px solid rgba(214,179,106,.27);border-radius:18px;background:linear-gradient(135deg,rgba(214,179,106,.075),rgba(85,200,189,.035))}
    .core-now-top{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}.core-now small{color:var(--gold);font:11px Arial,sans-serif;letter-spacing:.14em}.core-now strong{display:block;margin-top:5px;color:var(--ivory);font-size:20px;font-weight:400}.core-now em{color:var(--teal);font:11px Arial,sans-serif;font-style:normal;white-space:nowrap}
    .core-now-track{height:3px;margin-top:15px;border-radius:4px;background:rgba(255,255,255,.07);overflow:hidden}.core-now-track i{display:block;height:100%;background:linear-gradient(90deg,var(--gold),var(--teal));border-radius:inherit}
    .core-now-meta{display:flex;justify-content:space-between;gap:12px;margin-top:9px;color:var(--muted);font:11px Arial,sans-serif}
    .formation-map{display:grid;gap:8px;margin-top:12px}.formation-group{border:1px solid rgba(255,255,255,.09);border-radius:16px;background:rgba(255,255,255,.018);overflow:hidden}.formation-group[open]{border-color:rgba(214,179,106,.22)}
    .formation-group summary{min-height:58px;padding:12px 14px;display:flex;align-items:center;gap:12px;cursor:pointer;list-style:none}.formation-group summary::-webkit-details-marker{display:none}.formation-group summary:after{content:'+';margin-left:auto;color:var(--gold);font:19px Arial,sans-serif}.formation-group[open] summary:after{content:'−'}
    .formation-group-index{width:30px;height:30px;display:grid;place-items:center;border:1px solid rgba(214,179,106,.25);border-radius:50%;color:var(--gold2);font:10px Arial,sans-serif}.formation-group-copy{min-width:0}.formation-group-copy strong,.formation-group-copy small{display:block}.formation-group-copy strong{font-size:15px;font-weight:400}.formation-group-copy small{margin-top:3px;color:var(--muted);font:11px Arial,sans-serif}.formation-group-range{color:var(--teal);font:10px Arial,sans-serif;letter-spacing:.08em;white-space:nowrap}
    .formation-months{padding:0 12px 10px}.month-card{min-height:46px;display:grid;grid-template-columns:36px 1fr auto;align-items:center;gap:9px;padding:8px 3px;border-top:1px solid rgba(255,255,255,.055);cursor:pointer}.month-card:focus-visible{outline:1px solid var(--gold);outline-offset:-1px;border-radius:8px}.month-card.current{margin:0 -4px;padding-left:7px;padding-right:7px;border:1px solid rgba(214,179,106,.38);border-radius:12px;background:rgba(214,179,106,.055)}.month-card.done{opacity:.68}
    .month-number{color:var(--muted);font:10px Arial,sans-serif;letter-spacing:.08em}.month-copy{min-width:0}.month-copy strong{display:block;color:var(--ivory);font:13px Arial,sans-serif;font-weight:400}.month-copy small{display:block;margin-top:2px;color:var(--muted);font:11px Arial,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.month-state{color:var(--teal);font:10px Arial,sans-serif;letter-spacing:.08em}.month-state.gate{color:var(--gold)}
  `;document.head.appendChild(style);
  const activeGroup=month=>GROUPS.find(group=>month>=group.start&&month<=group.end)||GROUPS[0];
  async function paint({fresh=false}={}){
    const host=document.getElementById('path-list');if(!host||!window.ASCENDProgression)return;
    let context={month:1};try{context=await ASCENDProgression.current({fresh})}catch(e){console.error('Progression context failed',e)}
    const currentMonth=Math.max(1,Math.min(24,Number(context.month)||1));
    const current=ASCENDProgression.MONTHS[currentMonth-1],group=activeGroup(currentMonth);
    host.innerHTML='';host.className='month-path';host.dataset.monthPath='1';
    const summary=document.createElement('section');summary.className='core-now';summary.setAttribute('aria-label','Current Core Formation position');
    summary.innerHTML=`<div class="core-now-top"><div><small>CORE FORMATION · MONTH ${currentMonth} OF 24</small><strong>${current.title}</strong></div><em>${context.signedIn?'IN PROGRESS':'PREVIEW'}</em></div><div class="core-now-track" aria-hidden="true"><i style="width:${Math.max(4.2,currentMonth/24*100)}%"></i></div><div class="core-now-meta"><span>${group.title}</span><span>${current.gate||`Next review · Month ${group.end}`}</span></div>`;
    host.appendChild(summary);
    const map=document.createElement('div');map.className='formation-map';map.setAttribute('aria-label','24-month formation map');
    GROUPS.forEach((section,index)=>{
      const details=document.createElement('details');details.className='formation-group';details.open=currentMonth>=section.start&&currentMonth<=section.end;
      const months=ASCENDProgression.MONTHS.filter(item=>item.month>=section.start&&item.month<=section.end);
      details.innerHTML=`<summary><span class="formation-group-index">${String(index+1).padStart(2,'0')}</span><span class="formation-group-copy"><strong>${section.title}</strong><small>${section.description}</small></span><span class="formation-group-range">${section.range}</span></summary><div class="formation-months">${months.map(item=>{const state=item.month<currentMonth?'COMPLETE':item.month===currentMonth?'CURRENT':item.gate?item.gate:'';return `<div class="month-card${item.month===currentMonth?' current':''}${item.month<currentMonth?' done':''}" data-month="${item.month}" role="button" tabindex="0" ${item.month===currentMonth?'aria-current="step"':''}><span class="month-number">${String(item.month).padStart(2,'0')}</span><span class="month-copy"><strong>Month ${item.month}</strong><small>${item.title}</small></span>${state?`<span class="month-state${item.gate&&item.month!==currentMonth?' gate':''}">${state}</span>`:'<span></span>'}</div>`}).join('')}</div>`;
      map.appendChild(details);
    });
    host.appendChild(map);
    document.dispatchEvent(new CustomEvent('ascend:month',{detail:{...context,month:currentMonth}}));
  }
  const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  async function openMonth(monthNum,currentMonth,group){
    if(currentMonth&&monthNum===currentMonth&&window.ASCENDTrainingLayers?.openTraining){
      // month-path.js can paint before training-layers.js finishes its own delayed load, in
      // which case ASCENDTrainingLayers is still holding its module-local Month 1 / empty
      // defaults. Make sure it has actually resolved this month before opening it.
      if(window.ASCENDTrainingLayers.currentMonth?.()!==monthNum)await window.ASCENDTrainingLayers.load?.();
      window.ASCENDTrainingLayers.openTraining();return;
    }
    const overlay=document.getElementById('branch-overlay'),body=document.getElementById('branch-body');if(!overlay||!body)return;
    const item=ASCENDProgression.MONTHS[monthNum-1]||{title:''};
    // A month's `gate` marks the review completed AT THE END of that month, which is what
    // unlocks the NEXT month (see path-progression.js) — so a locked month's prerequisite
    // gate comes from the preceding month's entry, not its own.
    const prevGate=ASCENDProgression.MONTHS[monthNum-2]?.gate;
    const status=monthNum<currentMonth?'Completed':monthNum===currentMonth?'Current month · in progress':`Locked · opens once you reach Month ${monthNum-1}${prevGate?` and clear ${esc(prevGate)}`:''}.`;
    body.innerHTML=`<div class="eyebrow">${esc(group?.title||'THE PRACTICE PATH')} · MONTH ${monthNum} OF 24</div><h1>${esc(item.title)}</h1><p>${esc(status)}</p>${group?.description?`<article class="rhythm-card"><h2>${esc(group.title)}</h2><p>${esc(group.description)}</p></article>`:''}<button class="secondary branch-close" type="button">Close</button>`;
    overlay.classList.remove('hidden');
  }
  document.addEventListener('click',e=>{
    const card=e.target.closest('#path-list .month-card');if(!card)return;
    const monthNum=Number(card.dataset.month);if(!monthNum)return;
    ASCENDProgression?.current?.().then(context=>{
      const currentMonth=Math.max(1,Math.min(24,Number(context.month)||1));
      openMonth(monthNum,currentMonth,activeGroup(monthNum));
    }).catch(()=>openMonth(monthNum,1,activeGroup(monthNum)));
  });
  document.addEventListener('keydown',e=>{
    if(e.key!=='Enter'&&e.key!==' ')return;
    const card=e.target.closest?.('#path-list .month-card');if(!card)return;
    e.preventDefault();card.click();
  });
  document.addEventListener('DOMContentLoaded',()=>paint());
  document.addEventListener('ascend:curriculum',()=>paint({fresh:true}));
  setTimeout(()=>paint(),700);setTimeout(()=>paint({fresh:true}),2200);
  window.ASCENDMonthPath={paint};
})();
