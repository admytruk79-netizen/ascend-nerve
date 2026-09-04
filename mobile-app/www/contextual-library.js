(()=>{
  /*
   * Compatibility bridge during ASCEND reconstruction.
   *
   * Library presentation, current-month gating, related teaching and reader
   * behavior are owned by app/screens/library.js under the master one-owner
   * rule. Legacy callers may still invoke ASCENDContextualLibrary.render()
   * until app.js is retired; delegate those calls to the master owner instead
   * of maintaining a competing Library implementation here.
   */
  async function render(){
    return window.ASCENDLibrary?.render?.();
  }

  window.ASCENDContextualLibrary={render};
})();
