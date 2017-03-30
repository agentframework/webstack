import { router, route } from '../core/ExpressDecorators';
import { Request, Response, Next, IMiddlewareSupport } from '../router';
import { ServerRouter } from '../router';
import { ExpressRouter } from '../core/ExpressRouter';
import { CreateIdString } from '../data/MongoUtils';

const responseTime = require('response-time');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

@router('/api')
export class GlobalMiddleware extends ServerRouter implements IMiddlewareSupport {
  
  onInit({ router }): void {
    
    // Workaround: Current version of TypeScript(2.1.4) can not mix destructuring and type annotation
    const _router: ExpressRouter = router;
    
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
  
  @route('*')
  middleware(req: Request, res: Response, next: Next): void {
    
    console.log(`[${req.fingerprint().ip}] ${req.method} /api${req.path}`);
    
    const auth = req.getAuthToken();
    const device_id = auth.id || CreateIdString();
    const port = req.socket['_peername']['port'];
    const req_id = `REQ/${device_id.slice(18)}/${port}/${Date.now().toString(16)}`.toUpperCase();
    const req_addr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    // apply global settings
    req.id = req_id;
    req.res = res;
    req.settings = this.settings;
    
    // create logger per request
    req.logger = this.logger.child({ req_id, req_addr });
    
    // send request id to client
    res.setHeader('X-Request-Id', req.id);
    
    if (!auth.id) {
      // device id not exists
      // create new device id and set browser cookie
      
      // TODO: remember this device id and it's fingerprint
      res.sendAuthToken({ id: device_id });
      
      // TODO: matrices NEW DEVICE +1
      req.logger.debug(req.fingerprint(), `...${device_id}: New device id issued`);
    }
    
    next();
  }
  
}
