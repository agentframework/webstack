import { Request, Response, Next } from '../router';
import { router } from '../core/ExpressDecorators';
import { ServerRouter } from '../router';
import { ExpressRouter } from '../core/ExpressRouter';

@router('/api')
export class GlobalExceptionMiddleware extends ServerRouter {
  
  onInit({ router }) {
    
    // Workaround: Current version of TypeScript(2.1.4) can not mix destructuring and type annotation
    const _router: ExpressRouter = router;
    
    _router.use((req: Request, res: Response, next: Next): void => {
      const auth = req.getAuthToken();
      if (auth.token) {
        // log 404 for authenticated users
        req.logger.warn({ client: req.fingerprint(), headers: req.headers, params: req.params, query: req.query }, 'Service Not Found');
      }
      res.send({ ok: 0, errcode: 'ESVR0404', message: 'Service Not Found', req_id: req.id });
      next();
    });
    
    _router.use((err: Error, req: Request, res: Response, next: Next): void => {
      console.log('err', err);
      // log 500 for all users
      req.logger.error({ err, client: req.fingerprint(), headers: req.headers, params: req.params, query: req.query }, 'Server Error');
      res.send({ ok: 0, errcode: err['code'] || 'ESVR0500', message: 'Server Error', req_id: req.id });
      next();
    });
    
  }
  
}
