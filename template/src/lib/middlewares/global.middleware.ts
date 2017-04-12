import { Request, Response, Next } from '../router';
import { v4 } from 'uuid';
import { ExpressRouter, route, router } from 'agentstack-express';
import { Server } from '../server';
import { IServerSettings } from '../../conf/settings';
import { ILogger } from 'agentstack';

const responseTime = require('response-time');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

@router('/api')
export class GlobalMiddleware {
  
  settings: IServerSettings;
  logger: ILogger;
  
  constructor(server: Server, router: ExpressRouter) {
  
    this.logger = server.logger;
    this.settings = server.settings;
    
    // response time is only for api
    router.use(responseTime());
    
    // Use helmet to secure api headers
    router.use(helmet());
    
    // Request body parsing middleware should be above methodOverride
    router.use(bodyParser.urlencoded({
      extended: true
    }));
    
    // Use json for data transportation
    router.use(bodyParser.json());
    
    // Add the cookie parser and flash middleware
    router.use(cookieParser());
    
  }
  
  @route('*')
  middleware(req: Request, res: Response, next: Next): void {
    
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
    
    next();
  }
  
}
