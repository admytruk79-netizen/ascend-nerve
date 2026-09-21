import {PracticeRenderer} from './contract.js';

export class BreathRenderer extends PracticeRenderer{
  constructor(){super('breath')}
  prepare(context={}){
    super.prepare();
    this.context=context;
    return this;
  }
}

export const breathRenderer=new BreathRenderer();
