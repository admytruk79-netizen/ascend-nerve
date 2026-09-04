(()=>{
  /*
   * Month visibility is a presentation concern. The canonical curriculum array
   * must remain intact so Path, recommendations, search and future stages all
   * operate from the same source of truth.
   */
  function refresh(){
    window.ASCENDContextualLibrary?.render?.();
  }

  document.addEventListener('ascend:curriculum',refresh);
  document.addEventListener('ascend:month',refresh);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh,{once:true});
  else refresh();
})();
