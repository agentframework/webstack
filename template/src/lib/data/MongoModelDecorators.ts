import { decorateClass, IAttribute, IInterceptor, decorateClassProperty } from 'agentframework';

export function model(name?: string) {
  return decorateClass(new ModelAttribute(name));
}

export class ModelAttribute implements IAttribute {
  
  constructor(private _collection: string = '') {
  }
  
  get collection() {
    return this._collection;
  }
  
  public getInterceptor(): IInterceptor {
    return null;
  }
  
}

export function key() {
  return decorateClassProperty(new KeyAttribute());
}

export class KeyAttribute implements IAttribute {
  public getInterceptor(): IInterceptor {
    return null;
  }
}


