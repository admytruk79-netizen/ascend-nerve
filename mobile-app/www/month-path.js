(()=>{
  const style=document.createElement('style');style.textContent=`.month-path{display:grid;gap:10px;margin:18px 0 28px}.month-card{display:flex;align-items:center;gap:14px;padding:15px 16px;border:1px solid rgba(255,255,255,.10);border-radius:18px;background:rgba(255,255,255,.035);text-align:left}.month-card.current{border-color:rgba(201,162,39,.55);background:rgba(201,162,39,.08);box-shadow:0 0 28px rgba(201,162,39,.08)}.month-card.done{opacity:.72}.month-number{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;border:1px solid rgba(255,255,255,.16);font-size:12px;letter-spacing:.08em;flex:0 0 auto}.month-card.current .month-number{border-color:rgba(201,162,39,.8)}.month-copy{min-width:0}.month-copy strong{display:block;font-size:14px}.month-copy small{display:block;margin-top:4px;opacity:.72;font-size:12px}.month-gate{margin-left:auto;font-size:11px;letter-spacing:.10em;opacity:.58;white-space:nowrap}.month-heading{margin:26px 0 8px;font-size:11px;letter-spacing:.18em;opacity:.68}`;document.head.appendChild(style);
  async function paint({fresh=false}={}){
    const list=document.getElementById('path-list');if(!list||!window.ASCENDProgression)return;
    let context={month:1};try{context=await ASCENDProgression.current({fresh})}catch(e){console.error('Progression context failed',e)}
    const currentMonth=Math.max(1,Math.min(24,Number(context.month)||1));
    list.innerHTML='';list.classList.add('month-path');list.dataset.monthPath='1';
    const heading=document.createElement('li');heading.className='month-heading';heading.setAttribute('role','presentation');heading.textContent='24-MONTH CORE FORMATION';list.appendChild(heading);
    ASCENDProgression.MONTHS.forEach(item=>{
      const i=item.month,state=i<currentMonth?'COMPLETED':i===currentMonth?'CURRENT':'LOCKED';
      const card=document.createElement('li');card.className='month-card'+(i===currentMonth?' current':'')+(i<currentMonth?' done':'');
      card.dataset.month=String(i);card.setAttribute('aria-current',i===currentMonth?'step':'false');
      card.innerHTML=`<div class="month-number">${String(i).padStart(2,'0')}</div><div class="month-copy"><strong>Month ${i}</strong><small>${item.title}</small>${item.gate?`<span class="month-gate-label">${item.gate}</span>`:''}</div><div class="month-gate">${state}</div>`;
      list.appendChild(card);
    });
    document.dispatchEvent(new CustomEvent('ascend:month',{detail:{...context,month:currentMonth}}));
  }
  document.addEventListener('DOMContentLoaded',()=>paint());
  document.addEventListener('ascend:curriculum',()=>paint({fresh:true}));
  setTimeout(()=>paint(),700);setTimeout(()=>paint({fresh:true}),2200);
  window.ASCENDMonthPath={paint};
})();
