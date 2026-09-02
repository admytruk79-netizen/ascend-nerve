(()=>{
  const GROUPS=[
    {title:'Foundation',range:'Months 1–7',start:1,end:7,description:'Attention, thought, will and emotional balance'},
    {title:'Tools & Integration',range:'Months 8–18',start:8,end:18,description:'Consolidation, energetic tools and service'},
    {title:'Expanded Practice',range:'Months 19–24',start:19,end:24,description:'Chakras, elements, centres and final integration'}
  ];

  const activeGroup=month=>GROUPS.find(group=>month>=group.start&&month<=group.end)||GROUPS[0];
  const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  async function paint({fresh=false}={}){
    const host=document.getElementById('path-list');
    if(!host||!window.ASCENDProgression)return;

    let context={month:1};
    try{context=await ASCENDProgression.current({fresh})}
    catch(error){console.error('Progression context failed',error)}

    const currentMonth=Math.max(1,Math.min(24,Number(context.month)||1));
    const current=ASCENDProgression.MONTHS[currentMonth-1];
    const group=activeGroup(currentMonth);

    host.innerHTML='';
    host.className='month-path';
    host.dataset.monthPath='1';

    const summary=document.createElement('section');
    summary.className='core-now';
    summary.setAttribute('aria-label','Current Core Formation position');
    summary.innerHTML=`<div class="core-now-top"><div><small>CORE FORMATION · MONTH ${currentMonth} OF 24</small><strong>${esc(current.title)}</strong></div><em>${context.signedIn?'IN PROGRESS':'PREVIEW'}</em></div><div class="core-now-track" aria-hidden="true"><i style="width:${Math.max(4.2,currentMonth/24*100)}%"></i></div><div class="core-now-meta"><span>${esc(group.title)}</span><span>${esc(current.gate||`Next review · Month ${group.end}`)}</span></div>`;
    host.appendChild(summary);

    const map=document.createElement('div');
    map.className='formation-map';
    map.setAttribute('aria-label','24-month formation map');

    GROUPS.forEach((section,index)=>{
      const details=document.createElement('details');
      details.className='formation-group';
      details.open=currentMonth>=section.start&&currentMonth<=section.end;
      const months=ASCENDProgression.MONTHS.filter(item=>item.month>=section.start&&item.month<=section.end);
      details.innerHTML=`<summary><span class="formation-group-index">${String(index+1).padStart(2,'0')}</span><span class="formation-group-copy"><strong>${esc(section.title)}</strong><small>${esc(section.description)}</small></span><span class="formation-group-range">${esc(section.range)}</span></summary><div class="formation-months">${months.map(item=>{const state=item.month<currentMonth?'COMPLETE':item.month===currentMonth?'CURRENT':item.gate?item.gate:'';return `<div class="month-card${item.month===currentMonth?' current':''}${item.month<currentMonth?' done':''}" data-month="${item.month}" role="button" tabindex="0" ${item.month===currentMonth?'aria-current="step"':''}><span class="month-number">${String(item.month).padStart(2,'0')}</span><span class="month-copy"><strong>Month ${item.month}</strong><small>${esc(item.title)}</small></span>${state?`<span class="month-state${item.gate&&item.month!==currentMonth?' gate':''}">${esc(state)}</span>`:'<span></span>'}</div>`}).join('')}</div>`;
      map.appendChild(details);
    });

    host.appendChild(map);
    document.dispatchEvent(new CustomEvent('ascend:month',{detail:{...context,month:currentMonth}}));
  }

  async function openMonth(monthNum,currentMonth,group){
    if(currentMonth&&monthNum===currentMonth&&window.ASCENDTrainingLayers?.openTraining){
      if(window.ASCENDTrainingLayers.currentMonth?.()!==monthNum)await window.ASCENDTrainingLayers.load?.();
      window.ASCENDTrainingLayers.openTraining();
      return;
    }

    const overlay=document.getElementById('branch-overlay');
    const body=document.getElementById('branch-body');
    if(!overlay||!body)return;

    const item=ASCENDProgression.MONTHS[monthNum-1]||{title:''};
    const prevGate=ASCENDProgression.MONTHS[monthNum-2]?.gate;
    const status=monthNum<currentMonth
      ?'Completed'
      :monthNum===currentMonth
        ?'Current month · in progress'
        :`Locked · opens once you reach Month ${monthNum-1}${prevGate?` and clear ${prevGate}`:''}.`;

    body.innerHTML=`<div class="eyebrow">${esc(group?.title||'THE PRACTICE PATH')} · MONTH ${monthNum} OF 24</div><h1>${esc(item.title)}</h1><p>${esc(status)}</p>${group?.description?`<article class="rhythm-card"><h2>${esc(group.title)}</h2><p>${esc(group.description)}</p></article>`:''}<button class="secondary branch-close" type="button">Close</button>`;
    overlay.classList.remove('hidden');
  }

  document.addEventListener('click',event=>{
    const card=event.target.closest('#path-list .month-card');
    if(!card)return;
    const monthNum=Number(card.dataset.month);
    if(!monthNum)return;
    ASCENDProgression?.current?.().then(context=>{
      const currentMonth=Math.max(1,Math.min(24,Number(context.month)||1));
      openMonth(monthNum,currentMonth,activeGroup(monthNum));
    }).catch(()=>openMonth(monthNum,1,activeGroup(monthNum)));
  });

  document.addEventListener('keydown',event=>{
    if(event.key!=='Enter'&&event.key!==' ')return;
    const card=event.target.closest?.('#path-list .month-card');
    if(!card)return;
    event.preventDefault();
    card.click();
  });

  document.addEventListener('DOMContentLoaded',()=>paint(),{once:true});
  document.addEventListener('ascend:curriculum',()=>paint({fresh:true}));
  window.ASCENDMonthPath={paint};
})();
