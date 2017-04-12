import { Request, Response, Next } from '../router';
import { ExpressRouter, router } from 'agentstack-express';
import { Server } from '../server';

@router('/api')
export class GlobalExceptionMiddleware {
  
  constructor(server: Server, router: ExpressRouter) {
    
    router.use((req: Request, res: Response, next: Next): void => {
      res.status(404).send({ ok: 0, errcode: 'ESVR0404', message: 'Service Not Found', req_id: req.id });
    });
  
    router.use((err: Error, req: Request, res: Response, next: Next): void => {
      // 500
      res.status(500).send({ ok: 0, errcode: err['code'] || 'ESVR0500', message: 'Server Error', req_id: req.id });
    });
    
  }
  
}
