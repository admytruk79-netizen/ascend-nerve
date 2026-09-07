export const Backend={
  get raw(){return window.PathBackend},
  me(){return window.PathBackend?.me?.()},
  curriculum(){return window.PathBackend?.curriculum?.()},
  completePractice(...args){return window.PathBackend?.completePractice?.(...args)},
  saveJournal(userId,stageId,entry={}){
    return window.PathBackend?.saveJournal?.(userId,stageId,entry)
      ||Promise.reject(new Error('Journal persistence is unavailable.'));
  },
  journalEntries(userId,limit=20){
    return window.PathBackend?.rest?.('path_journal_entries',{
      query:`user_id=eq.${userId}&select=*&order=entry_date.desc&limit=${Math.max(1,Math.min(100,Number(limit)||20))}`
    })||Promise.resolve([]);
  },
  isSignedIn(){return Boolean(window.PathBackend?.isSignedIn?.())}
};
