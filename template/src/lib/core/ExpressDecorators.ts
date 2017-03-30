import {
  decorateClassMethod, decorateClass,
  IAttribute, IInterceptor, AgentAttribute
} from 'agentframework';


export function router(baseurl?: string, identifier?: string) {
  return decorateClass(new RouterAttribute(identifier, baseurl));
}


export function route(method: string, path?: string) {
  return decorateClassMethod(new RouteAttribute(method, path));
}


export function param(name?: string) {
  return decorateClassMethod(new ParamsAttribute(name));
}


export class RouterAttribute extends AgentAttribute {

  private _base: string;

  constructor(private name: string = '', baseurl?: string) {
    super(name);
    this._base = baseurl;
  }

  public beforeDecorate(target: Function): boolean {
    this.name = target.name;
    return true;
  }

  get base() {
    return this._base;
  }

}


export class RouteAttribute implements IAttribute {

  constructor(private _method: string, private _path: string = '') {
  }

  get method() {
    return this._method;
  }

  get path() {
    return this._path;
  }

  getInterceptor(): IInterceptor {
    return null;
  }

}


export class ParamsAttribute implements IAttribute {

  constructor(private _name: string) {
  }

  get name() {
    return this._name;
  }


  getInterceptor(): IInterceptor {
    return null;
  }

}
