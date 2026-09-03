(()=>{
  if(window.__ASCEND_MASTER_BOOTSTRAP__)return;
  window.__ASCEND_MASTER_BOOTSTRAP__=true;
  document.body?.classList.add('ascend-master-loading');
  document.documentElement.dataset.ascendMasterReady='0';
  import('./app/bootstrap.js?v=20260903-master-ready-1').catch(error=>{
    console.error('ASCEND master bootstrap failed',error);
    document.body?.classList.remove('ascend-master-loading');
    document.documentElement.dataset.ascendMasterReady='error';
    window.__ASCEND_MASTER_BOOTSTRAP__=false;
  });
})();
