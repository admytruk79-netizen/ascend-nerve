export const Auth={
  isSignedIn(){return Boolean(window.PathBackend?.isSignedIn?.())},
  me(){return window.PathBackend?.me?.()},
  signIn(...args){return window.PathBackend?.signIn?.(...args)},
  signOut(){return window.PathBackend?.signOut?.()},
  signInWithGoogle(){return window.PathBackend?.signInWithGoogle?.()},
  signUp(...args){return window.PathBackend?.signUp?.(...args)},
  resendSignup(...args){return window.PathBackend?.resendSignup?.(...args)},
  requestPasswordReset(...args){return window.PathBackend?.requestPasswordReset?.(...args)},
  updatePassword(...args){return window.PathBackend?.updatePassword?.(...args)},
  deleteAccount(){return window.PathBackend?.deleteAccount?.()}
};
