import {PracticeRenderer} from './contract.js';

export class SphereRenderer extends PracticeRenderer{
  constructor(){super('sphere')}
  prepare(context={}){
    super.prepare();
    this.context=context;
    return this;
  }
}

export const sphereRenderer=new SphereRenderer();
