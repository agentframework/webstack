/**
 * Module dependencies.
 */

import * as path from 'path';
import * as Router from 'router';

export class ExpressRouterManager {
  
  routes: Map<string, Router>;
  
  constructor() {
    this.routes = new Map<string, Router>();
    
    // merge route
    const root = Router({ mergeParams: true });
    root['path'] = '';
    this.routes.set('', root);
  }
  
  route(routePath: string = ''): Router {
    
    // if the required node not exists in routes map
    if (!this.routes.has(routePath)) {
      
      let routes = routePath.split(path.sep);
      //console.log(`rebuild route '${routePath}'`);
      
      // review all parents
      for (let idx = 1; idx < routes.length; idx++) {
        
        let previousRoutePath = routes.slice(0, idx).join('/'),
            currentRouteName  = '/' + routes[idx],
            currentRoutePath  = routes.slice(0, idx + 1).join('/');
        
        if (!this.routes.has(previousRoutePath)) {
          // the root route is been created in the constructor function
          throw new Error('Parent Route Not Exists');
        }
        
        // only rebuild the missing route
        if (!this.routes.has(currentRoutePath)) {
          
          let previousRoute = this.routes.get(previousRoutePath),
              currentRoute  = Router({ mergeParams: true });
          
          currentRoute['path'] = currentRouteName;
          previousRoute.use(currentRouteName, currentRoute);
          this.routes.set(currentRoutePath, currentRoute);
          
          // console.log(`create new route [${currentRoutePath}] parent: '${previousRoutePath}' + '${currentRouteName}'`);
        }
      }
    }
    
    // console.log(`get route [success] '${routePath}'`);
    return this.routes.get(routePath);
    
  }
  
  set(routePath: string, router: Router) {
    this.routes.set(routePath, router);
  }
  
  toList(prefix: string = '') {
    
    const list = [];
    
    // print all routes
    const printRouteStack = (route, prefix) => {
      // print new create routes
      let stack = route.stack;
      for (const key in Object.keys(stack)) {
        const val = stack[key];
        
        if (val.handle && val.handle.stack) {
          printRouteStack(val.handle, prefix + route.path);
          continue;
        }
        
        if (val.route) {
          list.push({
            base: prefix + route.path,
            path: val.route.path,
            methods: Object.keys(val.route.methods)
          });
          // if ((val.keys && val.keys.length) || val.params) {
          //   console.log('WITH KEY', val.keys, val.params);
          // }
        }
      }
    };
    
    let root = this.route();
    printRouteStack(root, prefix);
    
    return list;
  }
  
}
