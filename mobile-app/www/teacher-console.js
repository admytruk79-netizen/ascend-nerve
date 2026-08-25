(()=>{
  const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  async function load(){
    const host=document.getElementById('teacher-section');if(!host)return;
    if(!PathBackend.isSignedIn()){host.innerHTML='';return}
    try{
      const user=await PathBackend.me();if(!user)return;
      const profile=await PathBackend.getMyProfile(user.id);
      if(profile?.is_teacher)await renderTeacherView(host,user.id);
      else await renderStudentView(host,user.id);
    }catch(e){console.error('Teacher console load failed',e)}
  }

  async function renderStudentView(host,userId){
    const [rel,reviews]=await Promise.all([PathBackend.getMyTeacher(userId),PathBackend.getMyReviews(userId)]);
    if(!rel){host.innerHTML='';return}
    host.innerHTML=`<article class="rhythm-card"><h2>Teacher Reviews</h2>${reviews.length?reviews.map(r=>`<div class="teacher-review"><small>${new Date(r.created_at).toLocaleDateString()} · ${esc(r.recommendation.replace('_',' ').toUpperCase())}</small><p>${esc(r.note)}</p></div>`).join(''):'<p class="quiet-note">No reviews yet. Check "Share this entry with your teacher" on a journal entry when you want feedback.</p>'}</article>`;
  }

  async function renderTeacherView(host,teacherId){
    const students=await PathBackend.getMyStudents(teacherId);
    const studentIds=students.map(s=>s.student_user_id);
    const entries=await PathBackend.getSharedJournalEntries(studentIds);
    host.innerHTML=`<article class="rhythm-card"><h2>Teacher Console</h2><p class="quiet-note">${studentIds.length} student${studentIds.length===1?'':'s'} linked · ${entries.length} shared entr${entries.length===1?'y':'ies'} awaiting review.</p>${entries.map(e=>`<div class="teacher-entry" data-entry="${e.id}" data-student="${e.user_id}" data-stage="${e.stage_id||''}"><small>${e.entry_date} · Student ${e.user_id.slice(0,8)}</small><p>${esc(e.observation||e.inner_state||e.life_application||e.interpretation||e.unresolved||'')}</p><textarea class="teacher-note" placeholder="Your note for the student"></textarea><div class="teacher-actions"><button class="secondary teacher-recommend" data-rec="acknowledged" type="button">Acknowledge</button><button class="secondary teacher-recommend" data-rec="ready" type="button">Ready</button><button class="secondary teacher-recommend" data-rec="not_yet" type="button">Not Yet</button><button class="secondary teacher-recommend" data-rec="needs_discussion" type="button">Needs Discussion</button></div><p class="quiet-note teacher-status"></p></div>`).join('')||'<p class="quiet-note">Nothing shared yet.</p>'}</article>`;
    host.querySelectorAll('.teacher-recommend').forEach(btn=>btn.addEventListener('click',()=>submitReview(teacherId,btn)));
  }

  async function submitReview(teacherId,btn){
    const wrap=btn.closest('.teacher-entry'),status=wrap.querySelector('.teacher-status'),note=wrap.querySelector('.teacher-note').value.trim();
    if(!note){status.textContent='Write a note before submitting.';return}
    status.textContent='Saving…';
    try{
      await PathBackend.submitTeacherReview({teacherId,studentId:wrap.dataset.student,journalEntryId:wrap.dataset.entry,stageId:wrap.dataset.stage||null,note,recommendation:btn.dataset.rec});
      status.textContent='Review saved.';wrap.querySelectorAll('button,textarea').forEach(el=>el.disabled=true);
    }catch(e){console.error(e);status.textContent=e.message||'Could not save review.'}
  }

  window.ASCENDTeacherConsole={load};
  setTimeout(load,1600);
  document.addEventListener('ascend:curriculum',load);
})();
