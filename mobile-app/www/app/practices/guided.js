import {PracticeRenderer} from './contract.js';

export class GuidedRenderer extends PracticeRenderer{
  constructor(){super('guided')}
  prepare(context={}){
    super.prepare();
    this.context=context;
    return this;
  }
}

export const guidedRenderer=new GuidedRenderer();
