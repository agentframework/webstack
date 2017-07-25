import { Request, Response, Next } from '../router';
import { v4 } from 'uuid';
import { Router, middleware, router, BaseRouter } from 'agentstack-router';
import { Server } from '../server';
import { IServerSettings } from '../../conf/settings';
import { ILogger } from 'agentstack';
import { Database, DatabaseManager } from '../database';
import { inject } from 'agentframework';
import { ExpressEngine } from 'agentstack-express';

const responseTime = require('response-time');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

@router('/api')
export class GlobalMiddleware extends BaseRouter<ExpressEngine<IServerSettings>, IServerSettings> {
  
  @inject('DatabaseManager')
  protected _databaseManager: DatabaseManager;
  
  onInit({ server, router }) {
    
    // Workaround: Current version of TypeScript(2.1.4) can not mix destructuring and type annotation
    const _router: Router = router;
  
    // response time is only for api
    _router.use(responseTime());
  
    // Use helmet to secure api headers
    _router.use(helmet());
  
    // Request body parsing middleware should be above methodOverride
    _router.use(bodyParser.urlencoded({
      extended: true
    }));
  
    // Use json for data transportation
    _router.use(bodyParser.json());
  
    // Add the cookie parser and flash middleware
    _router.use(cookieParser());
    
  }
  
  @middleware()
  middleware(req: Request, res: Response, next: Next) {
  
    const port = req.socket['_peername']['port'];
    const req_id = `REQ/${v4().toUpperCase()}/${port}/${Date.now().toString(16)}`.toUpperCase();
    const req_addr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  
    console.log(`[${req_addr}] ${req.method} /api${req.path}`);
  
    // apply global settings
    req.id = req_id;
    req.res = res;
    req.settings = this.settings;
  
    // create logger per request
    req.logger = this.logger.child({ req_id, req_addr });
  
    // send request id to client
    res.setHeader('X-Request-Id', req.id);
  
    // Following code will cost 1ms per request
    return this._databaseManager.retrieveDatabase().then((db) => {
      req.database = db;
      return next();
    });
  }
  
}
