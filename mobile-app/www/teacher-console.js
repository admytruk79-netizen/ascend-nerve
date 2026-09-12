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

  function addStudentFormHTML(){
    return `<div class="teacher-add-student"><label>Add a student by email<input type="email" id="teacher-add-email" placeholder="student@example.com"/></label><button class="secondary" id="teacher-add-submit" type="button">Add Student</button><p class="quiet-note" id="teacher-add-status"></p></div>`;
  }

  function currentProgressFor(rows){
    return rows.find(r=>r.status==='active'||r.status==='review')||rows[rows.length-1]||null;
  }

  function daysSince(iso){
    if(!iso)return null;
    return Math.max(0,Math.floor((Date.now()-new Date(iso).getTime())/864e5));
  }

  function markerBadge(markerDefs,markerObs,userId,stageId){
    const defs=markerDefs.filter(m=>m.stage_id===stageId);
    if(!defs.length)return null;
    const obsByMarker=new Map(markerObs.filter(o=>o.user_id===userId&&o.stage_id===stageId).map(o=>[o.marker_id,o.state]));
    const positive=defs.filter(d=>['increasingly','established'].includes(obsByMarker.get(d.id))).length;
    return `${positive}/${defs.length} markers showing movement`;
  }

  function studentEntriesHTML(entries){
    if(!entries.length)return '<p class="quiet-note">No entries shared yet.</p>';
    return entries.map(e=>`<div class="teacher-entry"><small>${e.entry_date}</small><p>${esc(e.observation||e.inner_state||e.life_application||e.interpretation||e.unresolved||'')}</p></div>`).join('');
  }

  function queueRowHTML(id,name,stage,progress,badge,entries){
    const days=daysSince(progress.review_requested_at);
    const practiceLabel=`${progress.practice_days||0} of ${stage?.required_practice_days??'?'} practice days`;
    return `<article class="teacher-queue-row" data-student="${id}" data-stage="${progress.stage_id||''}">
      <div class="teacher-row-head"><strong>${esc(name)}</strong>${days!==null?`<span class="teacher-waiting-days">${days===0?'Requested today':`Waiting ${days} day${days===1?'':'s'}`}</span>`:''}</div>
      <div class="teacher-badges">
        <span class="teacher-badge">${esc(stage?.title||'Unknown stage')}</span>
        <span class="teacher-badge">${esc(practiceLabel)}</span>
        ${badge?`<span class="teacher-badge">${esc(badge)}</span>`:''}
        <span class="teacher-badge">${entries.length} shared ${entries.length===1?'entry':'entries'}</span>
      </div>
      <details class="teacher-entries-toggle"><summary>Read shared journal entries</summary>${studentEntriesHTML(entries)}</details>
      <textarea class="teacher-note" placeholder="Guidance for this decision"></textarea>
      <div class="teacher-actions">
        <button class="secondary teacher-decision" data-decision="advance" type="button">Advance</button>
        <button class="secondary teacher-decision" data-decision="continue" type="button">Continue</button>
        <button class="secondary teacher-decision" data-decision="pause" type="button">Pause</button>
      </div>
      <p class="quiet-note teacher-status"></p>
    </article>`;
  }

  function otherRowHTML(id,name,stage,progress,entries){
    return `<div class="teacher-other-row"><strong>${esc(name)}</strong><span>${esc(stage?.title||'Unknown stage')}</span>${entries.length?`<details class="teacher-entries-toggle"><summary>${entries.length} shared ${entries.length===1?'entry':'entries'}</summary>${studentEntriesHTML(entries)}</details>`:''}</div>`;
  }

  async function renderTeacherView(host,teacherId,students){
    const studentIds=students.map(s=>s.student_id);
    if(!studentIds.length){
      host.innerHTML=`<article class="rhythm-card"><h2>Teacher Console</h2><p class="quiet-note">No students linked yet.</p>${addStudentFormHTML()}</article>`;
      host.querySelector('#teacher-add-submit').addEventListener('click',()=>addStudent(host));
      return;
    }
    const ids=studentIds.join(',');
    const [profiles,progressRows,stages,markerDefs,markerObs,entries]=await Promise.all([
      PathBackend.rest('path_profiles',{query:`user_id=in.(${ids})&select=user_id,display_name`}),
      PathBackend.rest('path_student_progress',{query:`user_id=in.(${ids})&select=*`}),
      PathBackend.rest('path_stages',{query:'select=id,title,required_practice_days'}),
      PathBackend.rest('path_attainment_markers',{query:'select=id,stage_id,title'}),
      PathBackend.rest('path_student_marker_observations',{query:`user_id=in.(${ids})&select=user_id,marker_id,stage_id,state`}),
      PathBackend.rest('path_journal_entries',{query:`user_id=in.(${ids})&share_with_teacher=eq.true&select=*&order=entry_date.desc`})
    ]);
    const nameById=new Map(profiles.map(p=>[p.user_id,p.display_name||'Unnamed student']));
    const stageById=new Map(stages.map(s=>[s.id,s]));
    const progressByStudent=new Map(studentIds.map(id=>[id,currentProgressFor(progressRows.filter(r=>r.user_id===id))]));
    const entriesByStudent=new Map(studentIds.map(id=>[id,entries.filter(e=>e.user_id===id)]));

    const waiting=studentIds.filter(id=>progressByStudent.get(id)?.status==='review')
      .sort((a,b)=>new Date(progressByStudent.get(a).review_requested_at||0)-new Date(progressByStudent.get(b).review_requested_at||0));
    const others=studentIds.filter(id=>!waiting.includes(id))
      .sort((a,b)=>(nameById.get(a)||'').localeCompare(nameById.get(b)||''));

    const queueHTML=waiting.length
      ? waiting.map(id=>{
          const progress=progressByStudent.get(id);
          const stage=stageById.get(progress.stage_id);
          const badge=markerBadge(markerDefs,markerObs,id,progress.stage_id);
          return queueRowHTML(id,nameById.get(id),stage,progress,badge,entriesByStudent.get(id));
        }).join('')
      : '<p class="quiet-note">No one is currently awaiting a decision.</p>';

    const othersHTML=others.map(id=>{
      const progress=progressByStudent.get(id);
      const stage=progress?stageById.get(progress.stage_id):null;
      return otherRowHTML(id,nameById.get(id),stage,progress,entriesByStudent.get(id));
    }).join('');

    host.innerHTML=`<article class="rhythm-card"><h2>Teacher Console</h2>
      <p class="quiet-note">${studentIds.length} student${studentIds.length===1?'':'s'} linked · ${waiting.length} awaiting a decision.</p>
      <div class="teacher-queue-header">AWAITING REVIEW</div>
      <div class="teacher-queue">${queueHTML}</div>
      ${others.length?`<div class="teacher-queue-header">OTHER STUDENTS</div><div class="teacher-other-list">${othersHTML}</div>`:''}
      ${addStudentFormHTML()}
    </article>`;
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
    const wrap=btn.closest('.teacher-queue-row'),status=wrap.querySelector('.teacher-status'),guidance=wrap.querySelector('.teacher-note').value.trim(),stageId=wrap.dataset.stage;
    if(!stageId){status.textContent='This student has no active stage on record.';return}
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
