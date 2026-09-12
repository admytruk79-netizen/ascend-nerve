(()=>{
  const signinCard=document.getElementById('signin-card');
  const deleteCard=document.getElementById('delete-card');
  const signinStatus=document.getElementById('signin-status');
  const deleteStatus=document.getElementById('delete-status');
  const confirmButton=document.getElementById('delete-account-confirm');
  let armed=false;

  async function showVerified(){
    const user=await PathBackend.me();
    if(!user)return false;
    document.getElementById('verified-account').textContent=`Signed in as ${user.email||'your ASCEND account'}.`;
    signinCard.classList.add('hidden');
    deleteCard.classList.remove('hidden');
    return true;
  }

  document.getElementById('deletion-signin-form').addEventListener('submit',async event=>{
    event.preventDefault();
    const form=new FormData(event.currentTarget);
    signinStatus.textContent='Signing in…';
    try{await PathBackend.signIn(form.get('email'),form.get('password'));await showVerified();signinStatus.textContent=''}
    catch(error){signinStatus.textContent=error.message||'Sign-in failed.'}
  });

  document.getElementById('deletion-google').addEventListener('click',async()=>{
    signinStatus.textContent='Opening Google…';
    try{await PathBackend.signInWithGoogle()}catch(error){signinStatus.textContent=error.message||'Google sign-in could not start.'}
  });

  confirmButton.addEventListener('click',async()=>{
    if(!armed){armed=true;confirmButton.textContent='Confirm permanent deletion';confirmButton.classList.add('confirming');deleteStatus.textContent='Tap once more to permanently delete the account.';setTimeout(()=>{armed=false;confirmButton.textContent='Delete my account';confirmButton.classList.remove('confirming')},15000);return}
    confirmButton.disabled=true;deleteStatus.textContent='Deleting your account and personal data…';
    try{await PathBackend.deleteAccount();localStorage.removeItem('ascendPathState');localStorage.removeItem('ascendLibraryHistory');deleteCard.innerHTML='<h2>Account deleted</h2><p>Your ASCEND Path account and associated personal data have been permanently deleted.</p>'}
    catch(error){armed=false;confirmButton.disabled=false;confirmButton.textContent='Delete my account';confirmButton.classList.remove('confirming');deleteStatus.textContent=error.message||'Account deletion failed. Please try again.'}
  });

  PathBackend.listenForOAuthCallback(error=>{if(error){signinStatus.textContent=error.message||'Google sign-in did not complete.';return}location.reload()});
  showVerified().catch(()=>{});
})();
