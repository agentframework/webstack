import { Request, Response, Next } from '../router';
import { BaseRouter, Router, router } from 'agentstack-router';
import { ExpressEngine } from 'agentstack-express';
import { IServerSettings } from '../../conf/settings';

@router('/api')
export class GlobalExceptionMiddleware extends BaseRouter<ExpressEngine<IServerSettings>, IServerSettings> {
  
  onInit({ server, router }) {
    
    // Workaround: Current version of TypeScript(2.1.4) can not mix destructuring and type annotation
    const _router: Router = router;
  
    _router.use((req: Request, res: Response, next: Next): void => {
      res.status(404).send({ ok: 0, errcode: 'ESVR0404', message: 'Service Not Found', req_id: req.id });
    });
  
    _router.use((err: Error, req: Request, res: Response, next: Next): void => {
      // 500
      res.status(500).send({ ok: 0, errcode: err['code'] || 'ESVR0500', message: 'Server Error', req_id: req.id });
    });
    
  }
  
}
