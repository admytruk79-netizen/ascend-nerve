const REFLECTION_ART=[
  {src:'assets/seasonal-art/march-what-am-i-noticing.png',label:'What am I noticing?'},
  {src:'assets/seasonal-art/where-does-will-begin.png',label:'Where does will begin?'},
  {src:'assets/seasonal-art/truth-vs-imagination.png',label:'Truth vs imagination'},
  {src:'assets/seasonal-art/what-am-i-refusing.png',label:'What am I refusing?'},
  {src:'assets/seasonal-art/discipline-or-freedom.png',label:'Discipline or freedom?'}
];

function ensureReflectionHost(screen,title){
  if(document.getElementById('reflection-art'))return;
  const gallery=document.createElement('section');
  gallery.id='reflection-art';
  gallery.className='ascend-reflection-art';
  gallery.setAttribute('aria-label','Reflection artwork');
  gallery.innerHTML=`<div class="ascend-reflection-hero"><img id="reflection-art-image" src="${REFLECTION_ART[0].src}" alt=""/><div><small>REFLECTION</small><strong id="reflection-art-label">${REFLECTION_ART[0].label}</strong></div></div><div class="ascend-reflection-choices" role="list" aria-label="Choose reflection artwork">${REFLECTION_ART.map((item,index)=>`<button type="button" data-reflection-index="${index}" class="${index===0?'active':''}" aria-label="${item.label}"><img src="${item.src}" alt=""/></button>`).join('')}</div>`;
  title?.after(gallery);
}

function organizeForm(){
  const form=document.getElementById('journal-form');
  if(!form||form.dataset.masterOrganized==='1')return;
  form.dataset.masterOrganized='1';
  const interpretation=form.querySelector('textarea[name="interpretation"]')?.closest('label');
  const unresolved=form.querySelector('textarea[name="unresolved"]')?.closest('label');
  const share=form.querySelector('.journal-share-teacher');
  const save=form.querySelector('button.primary,button[type="submit"]');
  if(save&&(interpretation||unresolved||share)){
    const details=document.createElement('details');
    details.className='ascend-deeper-reflection';
    details.innerHTML='<summary>Deeper reflection <span>Interpretation · unresolved · teacher sharing</span></summary>';
    if(interpretation)details.append(interpretation);
    if(unresolved)details.append(unresolved);
    if(share)details.append(share);
    form.insertBefore(details,save);
  }
}

function bindReflectionArt(){
  document.getElementById('journal')?.addEventListener('click',event=>{
    const choice=event.target.closest('[data-reflection-index]');
    if(!choice)return;
    const item=REFLECTION_ART[Number(choice.dataset.reflectionIndex)];
    if(!item)return;
    const image=document.getElementById('reflection-art-image');
    const label=document.getElementById('reflection-art-label');
    if(image)image.src=item.src;
    if(label)label.textContent=item.label;
    document.querySelectorAll('[data-reflection-index]').forEach(button=>button.classList.toggle('active',button===choice));
  });
}

export function initJournal(){
  const screen=document.getElementById('journal');if(!screen)return;
  const eyebrow=screen.querySelector(':scope>.eyebrow');
  const title=screen.querySelector(':scope>h1');
  if(eyebrow)eyebrow.textContent='OBSERVE · REFLECT · INTEGRATE';
  if(title)title.textContent='Journal';
  ensureReflectionHost(screen,title);
  organizeForm();bindReflectionArt();
}
