(()=>{
  function contentMonth(item){
    const raw=item?.metadata?.month??item?.metadata?.min_month;
    const month=Number(raw);
    return Number.isFinite(month)&&month>0?month:0;
  }
  function applyMonthGate(){
    const curriculum=window.curriculum;
    const currentMonth=Number(curriculum?.currentMonth)||1;
    if(!curriculum||!Array.isArray(curriculum.content))return;
    if(!Array.isArray(curriculum.__allContent))curriculum.__allContent=[...curriculum.content];
    const explicit=new Set((curriculum.contentRules||[]).map(rule=>rule.content_id));
    curriculum.content=curriculum.__allContent.filter(item=>{
      if(explicit.has(item.id))return true;
      const month=contentMonth(item);
      return !month||month<=currentMonth;
    });
    window.renderLibrary?.();
    document.dispatchEvent(new CustomEvent('ascend:library-gated',{detail:{currentMonth,visible:curriculum.content.length,total:curriculum.__allContent.length}}));
  }
  document.addEventListener('ascend:curriculum',()=>setTimeout(applyMonthGate,0));
  if(document.readyState==='complete')setTimeout(applyMonthGate,250);
  else window.addEventListener('load',()=>setTimeout(applyMonthGate,250),{once:true});
})();
