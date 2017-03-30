import { IServerSettings } from '../../conf/settings';
import { ExpressEngine } from '../core/ExpressEngine';
import { Request, Response } from '../router';
import { Session } from '../models/system/session.model';
import { User } from '../models/system/user.model';
import {
  CreateObjectId, ConvertObjectIdToString, CreateIdString, IsObjectIdExpired,
  IsValidObjectId
} from '../data/MongoUtils';
import { ServerError } from '../core/ExpressError';


/**
 *
 * login:
 *
 * logout:
 *
 * refresh:
 *
 * getUserId:
 *
 * getUserDetails:
 *
 */
export function installAuthenticationExtensions(engine: ExpressEngine<IServerSettings>) {
  
  const USER_CACHED_PROPERTY_KEY = Symbol.for('agent.stack.user');
  const SESSION_EXPIRES_MS = engine.settings.WEBAPP_SESSION_EXPIRES_IN_MILLISECONDS;
  
  // logout (if already logged in)
  // login
  engine.express.request.login = function (user: User): Promise<Session | null> {
    
    const req = this as Request;
    const Sessions = req.system().Sessions;
    const res = req.res;
    const auth = req.getAuthToken();
    const token = CreateIdString();
    
    if (!auth.id) {
      // auth.id parsed from request cookie
      return Promise.reject(new Error('You need enable cookies to authenticateUserToRequest'));
    }
    
    if (!user || !user.id) {
      return Promise.reject(new Error('Login need a valid User as input'));
    }
    
    // do we need logout current user?
    let chain = auth.user ? req.logout() : Promise.resolve(null);
    
    return chain.then(loggedOutSession => {
      
      // always create a new session for authenticateUserToRequest
      const session = Sessions.createOne();
      session.device = auth.id;
      session.user = user._id;
      session.token = token;
      session.tokens = [{ token, context: req.fingerprint() }];
      session.exited = false;
      session.blocked = false;
      session.expires = new Date(Date.now() + SESSION_EXPIRES_MS);
      
      // remember previous session
      if (loggedOutSession) {
        session.previous = loggedOutSession._id;
        req.logger.debug({ session: loggedOutSession._id }, 'Automatically logged out previous session for new user login');
      }
      
      return Sessions.insertOne(session);
      
    }).then(newInsertedSession => {
      
      if (newInsertedSession) {
        
        auth.session = ConvertObjectIdToString(newInsertedSession._id);
        auth.user = ConvertObjectIdToString(user._id);
        auth.allows = [];
        auth.token = token;
        
        // NOTE: do not use req.setAuthToken() here because we want user to enable cookies
        res.sendAuthToken(auth);
        
        // req.logger.info({ token: auth, user: user._id }, 'User logged in');
      }
      else {
        req.logger.error({ token: auth, user: user._id, session: newInsertedSession }, 'User unable to log in');
      }
      
      return newInsertedSession;
      
    }, err => {
      throw new ServerError(err, { token: auth, user: user._id }, null, 'Unable to create new session');
    });
    
  };
  
  // set exited = true and expires to Date.now()
  engine.express.request.logout = function (reason: string = 'logout'): Promise<Session | null> {
    
    const req = this as Request;
    const Sessions = req.system().Sessions;
    const auth = req.getAuthToken();
    const logoutAuth = { id: auth.id };
    const { id, session, user, token } = auth;
    
    // destroy auth token and send to client
    req.setAuthToken(logoutAuth);
    
    // clean up server-side resources
    if (!id) {
      req.logger.debug({ auth }, `Logging out: User not logged in yet`);
      return Promise.resolve(null);
    }
    
    if (!session || !token || !user) {
      req.logger.debug({ auth }, `Logging out: User already logged out`);
      return Promise.resolve(null);
    }
    
    if (!IsValidObjectId(session)) {
      // TODO: Log this error, because someone try to hack this system
      req.logger.warn({ auth }, '[INTRUSION DETECTED] Logging out: User sent invalid session id');
      return Promise.resolve(null);
    }
    
    // add logout action into session object
    return Sessions.findAndUpdate(
      {
        _id: CreateObjectId(session),
        user: CreateObjectId(user),
        exited: false
      },
      {
        $set: { exited: true, reason },
        $currentDate: { expires: { $type: 'date' } }
      }
    ).then(terminatedSession => {
      if (!terminatedSession) {
        req.logger.warn({ auth }, 'req.logout(): Session not found');
      }
      return terminatedSession;
    }, err => {
      return Promise.reject(new ServerError(err, { auth }, null, 'req.logout(): Unable to terminate user session'));
    });
    
  };
  
  // validate user session and issue a new token, return null if not authenticated
  engine.express.request.refresh = function (): Promise<Session | null> {
    
    const req = this as Request;
    const Sessions = req.system().Sessions;
    const auth = req.getAuthToken();
    
    const newToken = CreateIdString();
    
    return Sessions.findAndUpdate({
      _id: CreateObjectId(auth.session),
      user: CreateObjectId(auth.user),
      device: auth.id,
      token: auth.token,
      exited: false,
      blocked: false,
      expires: { $gt: new Date() }
    }, {
      
      $set: {
        token: newToken,
        expires: new Date(Date.now() + SESSION_EXPIRES_MS)
      },
      
      $push: {
        tokens: {
          token: newToken,
          context: req.fingerprint()
        }
      }
      
    }, {
      tokens: 0,
    }).then(updatedSession => {
      
      if (updatedSession) {
        // update auth with new token and send to browser
        auth.token = updatedSession.token;
        // req.logger.info({ auth, session: updatedSession }, 'Successfully Re-Issued Auth Token');
        
        req.setAuthToken(auth);
        return updatedSession;
      }
      else if (auth.session) {
        req.logger.warn({ auth, session: updatedSession }, 'Failed to Issue New Auth Token');
        return req.logout('session expires').then(() => null);
      }
      else {
        req.logger.warn({ auth }, 'Not logged in');
        return null;
      }
      
    });
    
  };
  
  // get user id from auth token
  engine.express.request.getUserId = function (): string | null {
    const req = this as Request;
    const auth = req.getAuthToken();
    if (auth.user && auth.token && !IsObjectIdExpired(auth.token, this.settings.WEBAPP_TOKEN_EXPIRES_IN_MILLISECONDS)) {
      return auth.user;
    }
    else {
      return null;
    }
  };
  
  // get user details
  engine.express.request.getUserDetails = function (projection: any = {}): Promise<User | null> {
    
    const req = this as Request;
    const Users = req.system().Users;
    
    // return cached object
    if (Reflect.has(req, USER_CACHED_PROPERTY_KEY)) {
      return Promise.resolve(Reflect.get(req, USER_CACHED_PROPERTY_KEY));
    }
    
    const user = req.getUserId();
    if (user) {
      return Users.findOneById(CreateObjectId(user), projection).then(authUser => {
        if (authUser) {
          return req[USER_CACHED_PROPERTY_KEY] = authUser;
        }
        else {
          return null;
        }
      });
    }
    else {
      return Promise.resolve(null);
    }
    
  };
  
}
