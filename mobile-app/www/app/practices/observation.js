import {PracticeRenderer} from './contract.js';

export class ObservationRenderer extends PracticeRenderer{
  constructor(){super('observation')}
  prepare(context={}){
    super.prepare();
    this.context=context;
    return this;
  }
}

export const observationRenderer=new ObservationRenderer();
