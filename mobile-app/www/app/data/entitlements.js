export const Entitlements={
  getMy(userId){return window.PathBackend?.getMyEntitlement?.(userId)},
  isActive(entitlement){return Boolean(window.PathBackend?.entitlementIsActive?.(entitlement))},
  redeemLifetimeKey(rawKey){return window.PathBackend?.redeemLifetimeKey?.(rawKey)},
  billing(){return window.ASCENDBilling||null}
};
