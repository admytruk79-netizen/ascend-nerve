export const Backend={
  get raw(){return window.PathBackend},
  me(){return window.PathBackend?.me?.()},
  curriculum(){return window.PathBackend?.curriculum?.()},
  completePractice(...args){return window.PathBackend?.completePractice?.(...args)},
  saveJournal(...args){return window.PathBackend?.saveJournal?.(...args)},
  isSignedIn(){return Boolean(window.PathBackend?.isSignedIn?.())}
};
