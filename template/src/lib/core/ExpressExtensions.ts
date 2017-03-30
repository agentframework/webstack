import { Request, Response } from 'express';

export function InstallExpressExtensions(express: any) {
  
  express.request.fingerprint = function () {
    
    const req = this as Request;
    
    return {
      url: req.originalUrl,
      timestamp: new Date(),
      agent: req.headers['user-agent'],
      ip: req.headers['http_cf_connecting_ip'] || req.headers['x-forwarded-for'] || this.connection.remoteAddress,
      country: req.headers['http_cf_ipcountry']
    }
    
  };
  
}
