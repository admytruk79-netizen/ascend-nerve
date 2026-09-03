import {PracticeRenderer} from './contract.js';

export class ReflectionRenderer extends PracticeRenderer{
  constructor(){super('reflection')}
  prepare(context={}){
    super.prepare();
    this.context=context;
    return this;
  }
}

export const reflectionRenderer=new ReflectionRenderer();
