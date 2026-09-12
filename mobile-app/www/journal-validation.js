(()=>{
  const REFLECTION_FIELDS=['observation','inner_state','life_application','interpretation','unresolved'];

  function fieldValue(form,name){
    const field=form?.elements?.namedItem?.(name)||form?.querySelector?.(`[name="${name}"]`);
    return String(field?.value||'').trim();
  }

  function hasMeaningfulContent(form){
    return REFLECTION_FIELDS.some(name=>fieldValue(form,name).length>0);
  }

  function guardSubmission(form,status){
    if(!form)return()=>{};
    const handler=event=>{
      if(hasMeaningfulContent(form))return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if(status)status.textContent='Write at least one observation before saving this reflection.';
      form.elements?.namedItem?.('observation')?.focus?.();
    };
    form.addEventListener('submit',handler,true);
    return()=>form.removeEventListener('submit',handler,true);
  }

  window.ASCENDJournalValidation={REFLECTION_FIELDS,fieldValue,hasMeaningfulContent,guardSubmission};
  guardSubmission(document.getElementById('journal-form'),document.getElementById('journal-status'));
})();
