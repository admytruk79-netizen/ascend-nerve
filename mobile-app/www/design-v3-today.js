(()=>{
  if(window.__ASCEND_MASTER_BOOTSTRAP__)return;
  window.__ASCEND_MASTER_BOOTSTRAP__=true;
  import('./app/bootstrap.js?v=20260902-master-1').catch(error=>{
    console.error('ASCEND master bootstrap failed',error);
    window.__ASCEND_MASTER_BOOTSTRAP__=false;
  });
})();
