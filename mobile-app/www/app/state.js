export const state={
  screen:'today',
  month:1,
  phase:1,
  signedIn:false,
  entitled:false,
  curriculumReady:false,
  practice:{running:false,completed:false},
  journal:{context:null}
};

const listeners=new Set();
export function setState(patch={}){
  Object.assign(state,patch);
  listeners.forEach(fn=>{try{fn(state,patch)}catch(error){console.error('ASCEND state listener',error)}});
  document.dispatchEvent(new CustomEvent('ascend:state',{detail:{state,patch}}));
}
export function subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn)}
export function setMonth(month){
  const value=Math.max(1,Math.min(24,Number(month)||1));
  setState({month:value,phase:Math.ceil(value/4)});
}
