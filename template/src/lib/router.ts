import { IServerSettings } from '../conf/settings';
import { ILogger } from 'agentstack';
import * as express from 'express'
import { Database } from './database';

export interface Next {
  (err?: any): void;
}


export interface Response extends express.Response {
  
  // prototype
  
}

export interface Request extends express.Request {
  
  // per request, init in global router
  id: string
  logger: ILogger
  res: Response
  settings: IServerSettings
  database: Database
  
}




