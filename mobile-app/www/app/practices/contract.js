export class PracticeRenderer{
  constructor(name){this.name=name;this.state='idle'}
  prepare(){this.state='ready'}
  start(){this.state='running'}
  pause(){if(this.state==='running')this.state='paused'}
  resume(){if(this.state==='paused')this.state='running'}
  stop(){this.state='stopped'}
  complete(){this.state='complete';document.dispatchEvent(new CustomEvent('ascend:practice-complete',{detail:{renderer:this.name}}))}
  exit(){this.stop();document.dispatchEvent(new CustomEvent('ascend:practice-exit',{detail:{renderer:this.name}}))}
}
