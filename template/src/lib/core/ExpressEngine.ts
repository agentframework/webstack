import { agent, Agent, prerequisite, success, conditional, Reflection, Metadata } from 'agentframework';
import { Kernel, IKernelOptions, IKernelSettings } from 'agentstack';
import { IDisposable, IsUndefined } from 'agentstack';
import * as express from 'express';
import { RouteAttribute, RouterAttribute, ParamsAttribute } from './ExpressDecorators';
import { Server } from 'http'
import { ExpressRouterManager } from './ExpressRouterManager';
import { InstallExpressExtensions } from './ExpressExtensions';

/**
 * Add Extension Methods on Request/Response Object
 */
InstallExpressExtensions(express);

/**
 * Redefine the service
 */
export declare type RouterAgent = Agent;

/**
 * for future use
 */
export interface IRouter {
}

/**
 * for future use
 */
export interface IExpressEngineSettings extends IKernelSettings {

  WEBAPP_DEVICE_COOKIE_KEY: string
  WEBAPP_DEVICE_COOKIE_SECRET: string
  WEBAPP_DEVICE_COOKIE_SECURED: boolean
  WEBAPP_DEVICE_COOKIE_EXPIRES_IN_MILLISECONDS: number
  
  WEBAPP_SESSION_COOKIE_KEY: string
  WEBAPP_SESSION_COOKIE_SECRET: string
  WEBAPP_SESSION_COOKIE_SECURED: boolean
  WEBAPP_SESSION_COOKIE_EXPIRES_IN_MILLISECONDS: number
  WEBAPP_SESSION_EXPIRES_IN_MILLISECONDS: number

  WEBAPP_TOKEN_EXPIRES_IN_MILLISECONDS: number
  
  WEBAPP_LOGIN_URL: string
  WEBAPP_LOGIN_SUCCESS_URL: string
  WEBAPP_LOGIN_FAILED_URL: string
  
}

/**
 * Make strong typed settings
 */
@agent()
export class ExpressEngine<T extends IExpressEngineSettings> extends Kernel<T> implements IDisposable {

  protected _routers: Array<IRouter>;
  protected _host: string;
  protected _port: number;

  protected _application: express.Application;
  protected _manager: ExpressRouterManager;
  protected _server: Server;
  protected _express: any = express;
  
  constructor(opts?: IKernelOptions) {
    super();
    super.init(opts);
    this._routers = [];
    this._manager = new ExpressRouterManager();
    this._host = this.settings.HOST;
    this._port = this.settings.PORT;
    this._application = express();
    this._application.use('/', this._manager.route());
  }

  @prerequisite('started', false, 'ExpressEngine already started')
  @success('started', true)
  public start() {
    
    // print the routes
    const routes = this._manager.toList();
    routes.forEach(route => {
      this.logger.info(`ROUTE ${route.base} ${route.path} ` + `[${route.methods}]`.toUpperCase());
    });

    this._server = this._application.listen(this._port, this._host, () => {
      this.logger.info(`ExpressEngine started at http://${this._host}:${this._port}`);
      this.emit('started', this);
    });
    
  }

  @conditional('started', true)
  public stop(callback?: Function) {
    this._server.close((err) => {
      if (!IsUndefined(callback)) {
        callback(err);
      }
    });
  }

  @prerequisite('started', true, 'ExpressEngine not started. Please call start() first!')
  public get port(): number {
    return this._port;
  }

  @prerequisite('started', true, 'ExpressEngine not started. Please call start() first!')
  public get host(): string {
    return this._host;
  }

  public get express(): any {
    return this._express;
  }
  
  public get application(): express.Application {
    return this._application;
  }
  
  /**
   * Add a router and register all routes of this router and all inherits
   */
  public addRouter(routerType: RouterAgent) {

    const routers = Reflection.getAttributes(routerType)
      .filter(a => a instanceof RouterAttribute)
      .map(a => a as RouterAttribute);

    if (!routers.length) {
      throw new TypeError(`${routerType.name} is not a router`);
    }

    // one agent may implement multiple services
    routers.forEach((routerAttr: RouterAttribute) => {

      const router = this._manager.route(routerAttr.base);

      // create instance
      const instance = this.createAgent(routerType, router);
      
      const prototypes = [];
      
      let proto = routerType.prototype;
      while(proto) {
        prototypes.push(proto);
        proto = Reflect.getPrototypeOf(proto);
      }
      
      prototypes.reverse().forEach(proto => {
        
        const reflections = Metadata.getAll(proto);
        
        // register all params config or middleware config
        reflections.forEach((reflection: Reflection, methodName: string) => {
          
          // Scan ParamsAttribute
          reflection.getAttributes(ParamsAttribute).forEach((param: ParamsAttribute) => {
      
            if (param.name) {
              // router.param(param.name, function () {
              //   return instance[method].apply(instance, arguments);
              // });
              router.param(param.name, instance[methodName].bind(instance));
              this.logger.debug(`PARAM ${routerAttr.base} :${param.name} => ${routerType.name}.${methodName}()`);
            }
            else {
              // router.param(function () {
              //   return instance[method].apply(instance, arguments);
              // });
              router.param(instance[methodName].bind(instance));
              this.logger.debug(`PARAM ${routerAttr.base} => ${routerType.name}.${methodName}()`);
            }
      
          });
          
        });
        
        // register all route config
        reflections.forEach((reflection: Reflection, methodName: string) => {
    
          // Scan RouteAttribute
          reflection.getAttributes(RouteAttribute).forEach((route: RouteAttribute) => {
      
            const routePath = `${routerAttr.base} ${route.path}`;
      
            // console.log(`path ${routePath}`, method);
      
            // this is a middleware
            if (route.method === '*') {
              // router.use(route.path, function () {
              //   return instance[method].apply(instance, arguments);
              // });
              router.use(route.path, instance[methodName].bind(instance));
              this.logger.debug(`(ALL)  ${routePath} => ${routerType.name}.${methodName}()`);
            }
            else {
              // router[route.method.toLowerCase()](route.path, function () {
              //   return instance[method].apply(instance, arguments);
              // });
              router[route.method.toLowerCase()](route.path, instance[methodName].bind(instance));
              this.logger.debug(`${route.method.toUpperCase()} ${routePath} => ${routerType.name}.${methodName}()`);
        
            }
      
          });
    
        });
        
      });
      
      
      // register service to directory for future use
      this._routers.push(instance);

      // display information
      // this.logger.info(`Router register successful: [${routerType.name}] ${routerAttr.base}`);

    });

  }

  public dispose(disposing: boolean): void {
    if (!this._server) {
      return;
    }
    this._server.close();
    this._server = null;
    this._routers.slice(0);
    this._routers = null;
  }

}
