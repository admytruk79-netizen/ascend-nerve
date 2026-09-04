(()=>{
 const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const checklists={
  1:['Treatment area prepared','Practitioner calm and focused','Hands warm and relaxed','Client comfortable','Contraindications reviewed','Treatment objective established'],
  2:['General observation completed','Energetic scan completed','Spinal assessment completed','Chakras assessed','Major imbalances identified','Treatment priority recorded'],
  3:['Root assessed','Sacral assessed','Solar Plexus assessed','Heart assessed','Throat assessed','Third Eye assessed','Crown assessed'],
  4:['Each chakra reassessed','Adjacent centers compared','Remaining imbalance reviewed','Root-to-Crown harmonization completed'],
  5:['Chakras assessed/harmonized first','Sushumna treated','Ida treated','Pingala treated','Left/right balance reassessed'],
  6:['Three channels compared','Central axis reassessed','Asymmetry reviewed','Final channel harmonization completed'],
  7:['Assessment completed','Chakras harmonized','Sushumna treated','Ida/Pingala balanced','No major unresolved disturbance','Final stability reassessed'],
  8:['Aries-to-Pisces sequence maintained','Earlier energetic balance preserved','Final reassessment completed'],
  9:['Earth assessed','Water assessed','Fire assessed','Air assessed','Ether assessed','Overall elemental relationship reassessed'],
 10:['Mind settled','Breathing steady','Intention clear','Visualization supports rather than replaces observation','Treatment concluded gradually'],
 11:['Preparation','Energetic diagnosis','Chakra harmonization','Nadi balancing','Advanced work only when appropriate','Final harmonization','Closing assessment','Observations recorded']
 };
 let observer=null;
 function enhance(){
  const body=document.getElementById('branch-body');if(!body||body.dataset.pmObserver)return;body.dataset.pmObserver='1';
  const inspect=()=>{const eye=body.querySelector('.eyebrow')?.textContent||'';if(!/Energy & Bodywork/i.test(eye))return;const m=eye.match(/SESSION\s+(\d+)/i);if(!m)return;inject(Number(m[1]));};
  observer=new MutationObserver(inspect);observer.observe(body,{childList:true,subtree:true});inspect();
 }
 function inject(n){const body=document.getElementById('branch-body');if(!body||body.querySelector('.practitioner-panel'))return;const anchor=body.querySelector('.rhythm-card');if(!anchor)return;const items=checklists[n]||[];const panel=document.createElement('article');panel.className='rhythm-card practitioner-panel';panel.innerHTML=`<div class="eyebrow">PRACTITIONER MODE</div><h2>Session Checklist</h2><p class="quiet-note">Use this as a working sequence, not a reading list. Record observations before and after practice.</p><div class="practitioner-checks">${items.map((x,i)=>`<label><span>${esc(x)}</span><input type="checkbox" data-pcheck="${i}"></label>`).join('')}</div><div class="session-assessment"><label>Before / primary findings<textarea id="pm-before" placeholder="What did you observe before beginning?"></textarea></label><label>Techniques / sequence used<textarea id="pm-technique" placeholder="What did you actually perform?"></textarea></label><label>After / reassessment<textarea id="pm-after" placeholder="What changed, remained unclear, or requires follow-up?"></textarea></label></div><div class="protocol-progress"><span id="pm-count">0 / ${items.length}</span><div><i id="pm-bar"></i></div></div><button class="secondary" id="pm-journal" type="button">Send Session Notes to Journal</button>`;
 anchor.before(panel);panel.querySelectorAll('[data-pcheck]').forEach(x=>x.onchange=update);panel.querySelector('#pm-journal').onclick=toJournal;update();
 }
 function update(){const p=document.querySelector('.practitioner-panel');if(!p)return;const all=[...p.querySelectorAll('[data-pcheck]')],done=all.filter(x=>x.checked).length;p.querySelector('#pm-count').textContent=`${done} / ${all.length}`;p.querySelector('#pm-bar').style.width=`${all.length?done/all.length*100:0}%`;}
 function toJournal(){const body=document.getElementById('branch-body'),title=body?.querySelector('h1')?.textContent||'Energy & Bodywork';const p=document.querySelector('.practitioner-panel');if(!p)return;const before=p.querySelector('#pm-before').value,tech=p.querySelector('#pm-technique').value,after=p.querySelector('#pm-after').value,checks=[...p.querySelectorAll('.practitioner-checks label')].filter(l=>l.querySelector('input').checked).map(l=>l.querySelector('span').textContent);document.getElementById('branch-overlay')?.classList.add('hidden');window.ASCENDUX?.activateScreen?.('journal')||document.querySelector('.bottom-nav button[data-screen="journal"]')?.click();const f=document.getElementById('journal-form');if(!f)return;const o=f.querySelector('[name="observation"]'),life=f.querySelector('[name="life_application"]'),un=f.querySelector('[name="unresolved"]');if(o)o.value=`Energy & Bodywork · ${title}\n\nBEFORE / FINDINGS\n${before}\n\nSEQUENCE USED\n${tech}\n\nAFTER / REASSESSMENT\n${after}\n\nCHECKLIST COMPLETED\n${checks.map(x=>'• '+x).join('\n')}`;if(life)life.value='How will these observations change the next session or your practitioner preparation?';if(un)un.value='What remained unclear, unbalanced, or requires reassessment?';o?.focus();}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance,{once:true});else enhance();
 window.ASCENDPractitionerMode={enhance};
})();