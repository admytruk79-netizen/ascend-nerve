/**
 * ASCEND Path — Google Play Billing wrapper.
 * Unlike Ascend Keys' billing.js, entitlement is never trusted from the
 * client's local `store.owned()` state alone: every verified purchase is
 * sent to the verify-play-purchase Edge Function, which checks the receipt
 * against the Google Play Developer API and writes ascend_entitlements
 * itself. This file only drives the purchase flow and reflects whatever
 * PathBackend.getMyEntitlement() reports afterward -- the server is the
 * single source of truth, since this is a hard paywall, not a soft upsell.
 */
(function (global) {
  const PRODUCTS = {
    monthly: 'ascend_path_monthly',
    annual: 'ascend_path_annual',
    lifetime: 'ascend_path_lifetime'
  };
  const SUBSCRIPTION_IDS = new Set([PRODUCTS.monthly, PRODUCTS.annual]);

  let statusListeners = [];
  let ready = false;
  let initializing = false;
  let initialized = false;
  let lastStoreError = null;
  let lastVerifyError = null;
  const available = typeof CdvPurchase !== 'undefined';
  let prices = { monthly: '$45.00/month', annual: '$299.00/year', lifetime: '$649.00' };

  let readyResolve;
  const readyPromise = new Promise(resolve => { readyResolve = resolve; });
  function markReady() { if (!ready) { ready = true; if (readyResolve) { readyResolve(); readyResolve = null; } } }
  function waitUntilReady(timeoutMs) {
    return ready ? Promise.resolve() : Promise.race([readyPromise, new Promise(resolve => setTimeout(resolve, timeoutMs))]);
  }

  function notify() { statusListeners.forEach(fn => fn()); }
  function onStatusChange(fn) { statusListeners.push(fn); }

  function getOffers(product) {
    if (!product) return [];
    if (Array.isArray(product.offers)) return product.offers.filter(Boolean);
    const fallback = product.getOffer ? product.getOffer() : null;
    return fallback ? [fallback] : [];
  }
  function chooseOffer(product) {
    const offers = getOffers(product);
    return offers[0] || (product && product.getOffer ? product.getOffer() : null);
  }
  function priceFromOffer(offer) {
    if (!offer || !Array.isArray(offer.pricingPhases)) return null;
    const paid = offer.pricingPhases.find(phase => phase && Number(phase.priceMicros) > 0);
    return paid && paid.price ? paid.price : null;
  }
  function refreshPrice(tier, product) {
    const price = priceFromOffer(chooseOffer(product));
    if (!price) return;
    prices[tier] = tier === 'lifetime' ? price : `${price}/${tier === 'monthly' ? 'month' : 'year'}`;
  }
  function tierForProductId(id) {
    if (id === PRODUCTS.monthly) return 'monthly';
    if (id === PRODUCTS.annual) return 'annual';
    if (id === PRODUCTS.lifetime) return 'lifetime';
    return null;
  }
  function getProduct(id) {
    const { store, Platform } = CdvPurchase;
    return store.get(id, Platform.GOOGLE_PLAY) || store.get(id);
  }
  function refreshAllProducts() {
    Object.entries(PRODUCTS).forEach(([tier, id]) => { const p = getProduct(id); if (p) refreshPrice(tier, p); });
  }

  // The one place client and server meet: a verified transaction's purchase
  // token gets POSTed to verify-play-purchase, which is the only thing
  // allowed to write ascend_entitlements for a Play purchase. This function
  // never touches entitlement state itself -- it just reports success/failure
  // so the caller can refresh from PathBackend.getMyEntitlement() after.
  async function verifyOnServer(productId, transaction) {
    const purchaseToken = transaction.purchaseToken || transaction.nativePurchase?.purchaseToken
      || transaction.transactionId || transaction.id;
    if (!purchaseToken) throw new Error('No purchase token found on the transaction to verify.');
    return global.PathBackend.verifyPlayPurchase({
      productId,
      purchaseToken,
      productType: SUBSCRIPTION_IDS.has(productId) ? 'subscription' : 'inapp'
    });
  }

  function startStore() {
    if (!available || initializing || initialized) return;
    initializing = true;
    const { store, ProductType, Platform } = CdvPurchase;
    try {
      store.register([
        { id: PRODUCTS.monthly, type: ProductType.PAID_SUBSCRIPTION, platform: Platform.GOOGLE_PLAY },
        { id: PRODUCTS.annual, type: ProductType.PAID_SUBSCRIPTION, platform: Platform.GOOGLE_PLAY },
        { id: PRODUCTS.lifetime, type: ProductType.NON_CONSUMABLE, platform: Platform.GOOGLE_PLAY }
      ]);

      store.when()
        .productUpdated(product => { const tier = tierForProductId(product.id); if (tier) refreshPrice(tier, product); markReady(); })
        .receiptsReady(() => { refreshAllProducts(); markReady(); })
        .approved(transaction => { transaction.verify(); })
        .verified(receipt => {
          const transactions = Array.isArray(receipt.transactions) ? receipt.transactions : [receipt];
          Promise.all(transactions.map(t => {
            const productId = t.products?.[0]?.id || t.productId || receipt.productId;
            return productId ? verifyOnServer(productId, t).catch(err => { lastVerifyError = err; console.error('[AscendBilling] server verification failed', err); }) : null;
          })).finally(() => { receipt.finish(); notify(); });
        });

      store.error(err => { lastStoreError = err; console.error('[AscendBilling] store error', err); });

      Promise.resolve(store.initialize([Platform.GOOGLE_PLAY]))
        .then(errors => {
          initialized = true; initializing = false;
          if (Array.isArray(errors) && errors.length) { lastStoreError = errors[0]; console.error('[AscendBilling] initialize errors', errors); }
          refreshAllProducts();
          markReady();
        })
        .catch(err => { initializing = false; lastStoreError = err; console.error('[AscendBilling] initialize failed', err); });
    } catch (err) {
      initializing = false; lastStoreError = err; console.error('[AscendBilling] startStore failed', err);
    }
  }

  function init() {
    if (!available) { markReady(); return; }
    let started = false;
    const begin = () => { if (started) return; started = true; startStore(); };
    document.addEventListener('deviceready', begin, { once: true });
    setTimeout(begin, 1200);
  }

  function notLoadedReason(tier) {
    if (!ready) return lastStoreError
      ? `Google Play Billing failed to initialize (code ${lastStoreError.code || '?'}: ${lastStoreError.message || lastStoreError}).`
      : 'Google Play Billing did not become ready. Please close ASCEND Path completely, reopen it, and try once more.';
    if (lastStoreError) return `Google Play Billing reported an error (code ${lastStoreError.code || '?'}: ${lastStoreError.message || lastStoreError}).`;
    return `Google Play Billing connected, but product "${PRODUCTS[tier]}" was not returned for this Google account.`;
  }

  function purchase(tier) {
    if (!PRODUCTS[tier]) return Promise.reject(new Error('Unknown ASCEND Path product.'));
    if (!available) return Promise.reject(new Error('Google Play Billing is unavailable in this build. Install ASCEND Path from Google Play to purchase.'));
    return waitUntilReady(10000).then(() => {
      const product = getProduct(PRODUCTS[tier]);
      if (!product) return Promise.reject(new Error(notLoadedReason(tier)));
      const offer = chooseOffer(product);
      if (!offer) return Promise.reject(new Error('Google Play returned the product but no purchasable offer.'));
      return typeof offer.order === 'function' ? offer.order() : CdvPurchase.store.order(offer);
    });
  }

  function restore() {
    if (!available) return Promise.reject(new Error('Google Play Billing is unavailable in this build.'));
    return waitUntilReady(10000).then(() => CdvPurchase.store.restorePurchases());
  }

  global.AscendBilling = {
    init, purchase, restore, onStatusChange,
    isAvailable: () => available,
    isReady: () => ready,
    getPriceString: tier => prices[tier] || null,
    lastVerifyError: () => lastVerifyError,
    PRODUCTS: Object.assign({}, PRODUCTS)
  };
})(window);
