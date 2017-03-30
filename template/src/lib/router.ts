import { IServerSettings } from '../conf/settings';
import { ILogger } from 'agentstack';
import { ExpressRouter } from './core/ExpressRouter';
import { ServerError } from './core/ExpressError';
import { AuthToken } from './core.extensions/token';
import { SystemDatabase } from './core.extensions/model';
import { User } from './models/system/user.model';
import { Session } from './models/system/session.model';
import { route } from './core/ExpressDecorators';
import { IsValidObjectId, IsObjectIdExpired } from './data/MongoUtils';
import { Base } from './base';
import * as express from 'express'
import { Server } from './server';

export interface Next extends express.NextFunction {
  
}

export interface Request extends express.Request {
  
  // per request, init in global router
  id: string
  logger: ILogger
  res: Response
  settings: IServerSettings
  
  // prototype
  fingerprint(): any
  
  getAuthToken(): AuthToken
  
  system(): SystemDatabase
  
  /**
   * Update auth token in current request transaction
   * This method used in authentication middleware to expires an existing auth token after timeout
   *
   * used by: req.logout / req.authenticateUserToRequest
   */
  setAuthToken(auth: AuthToken): void
  
  login(user: User): Promise<Session | null>
  logout(reason?: string): Promise<Session | null>
  refresh(): Promise<Session | null>
  
  getUserId(): string
  getUserDetails(projection?: any): Promise<User | null>
  
}

export interface Response extends express.Response {
  
  // prototype
  
  /**
   * Send auth token to client cookies
   *
   * used by: initialize / req.authenticateUserToRequest
   */
  sendAuthToken(auth: AuthToken): void
  
}

export interface IRouterParameters {
  server: Server
  router: ExpressRouter
}

export interface IMiddlewareSupport {
  middleware(req: Request, res: Response, next: Next): void
}

/**
 * Base router, provide access to app settings and logger instance.
 */
export abstract class ServerRouter extends Base {
  
  constructor(server: Server, router: ExpressRouter) {
    super(server);
    try {
      this.onInit({ server, router });
    }
    catch (err) {
      this.logger.error(new ServerError(err, `Error during ${this.name} init`));
    }
  }
  
  protected onInit(params: IRouterParameters): void {
    // onInit here is not a abstract method because some router may not need onInit()
  };
  
}

/**
 * User need authenticated
 */
export abstract class UserRouter extends ServerRouter {
  
  @route('*')
  async RequireAuthenticatedMiddleware(req: Request, res: Response, next: Next) {
    
    console.log('RequireAuthMiddleware');
    
    const auth = req.getAuthToken();
    let terminate_session = false;
    let refresh_session_token = false;
    
    if (auth.id && !IsValidObjectId(auth.id)) {
      req.logger.warn({ auth }, `[INTRUSION DETECTED] User sent invalid device id`);
      terminate_session = true;
    }
    else if (auth.session && !IsValidObjectId(auth.id)) {
      req.logger.warn({ auth }, `[INTRUSION DETECTED] User sent invalid session id`);
      terminate_session = true;
    }
    else if (auth.token && !IsValidObjectId(auth.token)) {
      req.logger.warn({ auth }, `[INTRUSION DETECTED] User sent invalid token id`);
      terminate_session = true;
    }
    else if (auth.token && IsObjectIdExpired(auth.token, req.settings.WEBAPP_TOKEN_EXPIRES_IN_MILLISECONDS)) {
      req.logger.debug({ auth }, `Token expires, refresh token using session id`);
      refresh_session_token = true;
    }
    
    
    if (terminate_session) {
      // session expires, destroy all info
      req.logout().then(() => {
        res.sendStatus(401);
      }, err => {
        next(new ServerError(err, { auth }, null, 'Unable to logout'));
      });
    }
    else if (refresh_session_token) {
      // token expires, try to re-authenticateUserToRequest it
      req.refresh().then(session => {
        if (session) {
          // avoid unhandled rejection here. Promise created inside promise but not return
          setImmediate(() => {
            next();
          });
        }
        else {
          res.sendStatus(401);
        }
      }, err => {
        next(new ServerError(err, { auth }, null, 'Unable to authenticate'));
      });
    }
    else if (!auth.token) {
      res.sendStatus(401);
    }
    else {
      next();
    }
    
    
  }
  
}
