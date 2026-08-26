(()=>{
  const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  async function load(){
    const host=document.getElementById('teacher-section');if(!host)return;
    if(!PathBackend.isSignedIn()){host.innerHTML='';return}
    try{
      const user=await PathBackend.me();if(!user)return;
      if(await PathBackend.isTeacher(user.id)){
        const students=await PathBackend.rest('path_teacher_relationships',{query:`teacher_id=eq.${user.id}&status=eq.active&select=student_id,created_at`});
        await renderTeacherView(host,user.id,students);
      }else await renderStudentView(host,user.id);
    }catch(e){console.error('Teacher console load failed',e);host.innerHTML=''}
  }

  async function renderStudentView(host,userId){
    const [rels,reviews]=await Promise.all([
      PathBackend.rest('path_teacher_relationships',{query:`student_id=eq.${userId}&status=eq.active&select=teacher_id,created_at`}),
      PathBackend.rest('path_teacher_reviews',{query:`student_id=eq.${userId}&select=*&order=submitted_at.desc`})
    ]);
    if(!rels.length){host.innerHTML='';return}
    host.innerHTML=`<article class="rhythm-card"><h2>Teacher Reviews</h2>${reviews.length?reviews.map(r=>`<div class="teacher-review"><small>${new Date(r.submitted_at).toLocaleDateString()} · ${esc(String(r.decision||'continue').toUpperCase())}</small><p>${esc(r.guidance||'No written guidance.')}</p></div>`).join(''):'<p class="quiet-note">No stage review has been submitted yet. Shared journal entries remain visible only when you explicitly choose to share them.</p>'}</article>`;
  }

  async function renderTeacherView(host,teacherId,students){
    const studentIds=students.map(s=>s.student_id);
    const ids=studentIds.join(',');
    const entries=studentIds.length?await PathBackend.rest('path_journal_entries',{query:`user_id=in.(${ids})&share_with_teacher=eq.true&select=*&order=entry_date.desc`}):[];
    host.innerHTML=`<article class="rhythm-card"><h2>Teacher Console</h2><p class="quiet-note">${studentIds.length} student${studentIds.length===1?'':'s'} linked · ${entries.length} shared entr${entries.length===1?'y':'ies'} available for context.</p>${entries.map(e=>`<div class="teacher-entry" data-student="${e.user_id}" data-stage="${e.stage_id||''}"><small>${e.entry_date} · Student ${e.user_id.slice(0,8)}</small><p>${esc(e.observation||e.inner_state||e.life_application||e.interpretation||e.unresolved||'')}</p><textarea class="teacher-note" placeholder="Stage-review guidance"></textarea><div class="teacher-actions"><button class="secondary teacher-decision" data-decision="advance" type="button">Advance</button><button class="secondary teacher-decision" data-decision="continue" type="button">Continue</button><button class="secondary teacher-decision" data-decision="pause" type="button">Pause</button></div><p class="quiet-note teacher-status"></p></div>`).join('')||'<p class="quiet-note">Nothing has been explicitly shared yet.</p>'}<div class="teacher-add-student"><label>Add a student by email<input type="email" id="teacher-add-email" placeholder="student@example.com"/></label><button class="secondary" id="teacher-add-submit" type="button">Add Student</button><p class="quiet-note" id="teacher-add-status"></p></div></article>`;
    host.querySelectorAll('.teacher-decision').forEach(btn=>btn.addEventListener('click',()=>submitReview(teacherId,btn)));
    host.querySelector('#teacher-add-submit').addEventListener('click',()=>addStudent(host));
  }

  async function addStudent(host){
    const input=host.querySelector('#teacher-add-email'),status=host.querySelector('#teacher-add-status'),email=input.value.trim();
    if(!email){status.textContent='Enter an email first.';return}
    status.textContent='Adding…';
    try{
      const result=await PathBackend.addStudent(email);
      if(result?.linked){status.textContent='Student linked.';input.value='';await load()}
      else status.textContent=result?.reason==='no_account_found'?'No ASCEND account with that email yet.':result?.reason==='cannot_link_self'?'You cannot link yourself.':'Could not link that student.';
    }catch(e){console.error(e);status.textContent=e.message||'Could not link that student.'}
  }

  async function submitReview(teacherId,btn){
    const wrap=btn.closest('.teacher-entry'),status=wrap.querySelector('.teacher-status'),guidance=wrap.querySelector('.teacher-note').value.trim(),stageId=wrap.dataset.stage;
    if(!stageId){status.textContent='This entry is not linked to a stage.';return}
    if(!guidance){status.textContent='Write guidance before submitting.';return}
    status.textContent='Saving…';
    try{
      await PathBackend.rest('path_teacher_reviews',{method:'POST',body:{teacher_id:teacherId,student_id:wrap.dataset.student,stage_id:stageId,decision:btn.dataset.decision,guidance},prefer:'return=representation'});
      status.textContent='Stage review saved.';wrap.querySelectorAll('button,textarea').forEach(el=>el.disabled=true);
    }catch(e){console.error(e);status.textContent=e.message||'Could not save review.'}
  }

  window.ASCENDTeacherConsole={load};
  setTimeout(load,1600);
  document.addEventListener('ascend:curriculum',load);
})();
