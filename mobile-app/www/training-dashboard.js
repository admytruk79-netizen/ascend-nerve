(()=>{
 function pathUX(){const path=document.getElementById('path');if(!path||path.dataset.arch==='1')return;path.dataset.arch='1';if(!path.querySelector('.path-summary-copy')){const h1=path.querySelector('h1');if(h1){const p=document.createElement('p');p.className='path-summary-copy';p.textContent='Core Formation and the specialized pathways keep separate progression records.';h1.after(p)}}}
 function init(){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('motion-enter'));pathUX()}
 document.addEventListener('DOMContentLoaded',init);setTimeout(init,350);window.ASCENDDashboardUX={init};
})();
