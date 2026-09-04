(()=>{
  const object=document.getElementById('living-object');
  const title=document.getElementById('stage-title');
  if(!object||!title)return;
  const stageClasses=['stage-presence','stage-thought','stage-will','stage-equanimity','stage-positive','stage-openness','stage-harmony'];
  function stageClass(text=''){
    const t=text.toLowerCase();
    if(t.includes('thought')||t.includes('clarity'))return 'stage-thought';
    if(t.includes('will')||t.includes('constancy'))return 'stage-will';
    if(t.includes('equanim'))return 'stage-equanimity';
    if(t.includes('positive'))return 'stage-positive';
    if(t.includes('open'))return 'stage-openness';
    if(t.includes('harmony')||t.includes('integration'))return 'stage-harmony';
    return 'stage-presence';
  }
  function sync(){object.classList.remove(...stageClasses);object.classList.add(stageClass(title.textContent));}
  new MutationObserver(sync).observe(title,{childList:true,subtree:true,characterData:true});
  sync();
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-action="practice"]')||e.target.closest('#timer-toggle'))object.classList.add('active-practice');
    if(e.target.closest('#finish-practice')||e.target.closest('.overlay-close'))object.classList.remove('active-practice');
  });
})();