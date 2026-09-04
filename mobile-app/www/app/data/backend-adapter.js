export const Backend={
  get raw(){return window.PathBackend},
  me(){return window.PathBackend?.me?.()},
  curriculum(){return window.PathBackend?.curriculum?.()},
  completePractice(...args){return window.PathBackend?.completePractice?.(...args)},
  saveJournal(userId,stageId,entry={}){
    return window.PathBackend?.rest?.('path_journal_entries',{
      method:'POST',
      body:{
        user_id:userId,
        stage_id:stageId,
        entry_date:new Date().toISOString().slice(0,10),
        observation:entry.observation||null,
        inner_state:entry.inner_state||null,
        life_application:entry.life_application||null,
        interpretation:entry.interpretation||null,
        unresolved:entry.unresolved||null,
        share_with_teacher:!!entry.share_with_teacher,
        context:entry.context&&typeof entry.context==='object'?entry.context:{}
      },
      prefer:'return=representation'
    })||Promise.reject(new Error('Journal persistence is unavailable.'));
  },
  journalEntries(userId,limit=20){
    return window.PathBackend?.rest?.('path_journal_entries',{
      query:`user_id=eq.${userId}&select=*&order=entry_date.desc&limit=${Math.max(1,Math.min(100,Number(limit)||20))}`
    })||Promise.resolve([]);
  },
  isSignedIn(){return Boolean(window.PathBackend?.isSignedIn?.())}
};
