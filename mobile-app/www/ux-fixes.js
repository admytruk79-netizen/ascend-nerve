(()=>{
  /*
   * Retired reconstruction bridge.
   *
   * Navigation, overlay unwinding, history, Android Back, menu routing,
   * Journal handoff and authentication screen routing now belong exclusively
   * to app/router.js under the ASCEND Master System one-owner rule.
   *
   * This file remains temporarily in the legacy script list only to avoid a
   * destructive index.html migration in the same change. It intentionally
   * owns no runtime behavior.
   */
  document.documentElement.dataset.ascendLegacyUxRetired='true';
})();
