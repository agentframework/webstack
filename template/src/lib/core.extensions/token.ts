import { IServerSettings } from '../../conf/settings';
import { ExpressEngine } from '../core/ExpressEngine';
import { verify, sign } from 'jsonwebtoken';
import { Request, Response } from '../router';


/**
 *  Authentication process flow
 *
 *  1. Does contains valid access token?
 *      Yes, allow the request
 *      No, Issue a access token from refresh token
 *
 *  2. Does this works?
 *      Yes, set the new access token and allow request
 *      No, Delete the refresh token and denied request
 *
 *  Format:
 *    {
 *      id,
 *      session,
 *      user,
 *      allows,
 *      token
 *    }
 *
 *  States:
 *
 *    New Device              { id }
 *
 *
 *    Guest Session           { id, session, user }
 *                                   |------------------------------- Set by guest authenticateUserToRequest ???
 *
 *    Authenticated Session   { id, session, user, allows, token }
 *                                   |--------|------|-------|------- Set by authenticateUserToRequest
 *                                                           |------- Set by token refresh
 */

export interface AuthToken {
  
  // device id (same device id means same device, return null if device not supported)
  id?: string,
  
  // session id (only when user has logged in)
  session?: string,
  
  // user id (only when user has logged in)
  user?: string,
  
  // permissions
  allows?: Array<string>,
  
  // token id
  token?: string
  
}


/**
 *
 * Install user token helper function to req and res prototype
 *
 *    // read user token from cookie from HTTP HEAD
 *    const token = req.getAuthToken();
 *
 *    // update auth token for current request ( logout? )
 *    req.setAuthToken(token);
 *
 *    // write user token to cookie of HTTP HEAD
 *    res.sendAuthToken(token);
 *
 */
export function installTokenExtensions(engine: ExpressEngine<IServerSettings>) {
  
  const TOKEN_CACHED_PROPERTY_KEY = Symbol.for('auth.token');
  
  const SESSION_COOKIE_SECRET = engine.settings.WEBAPP_SESSION_COOKIE_SECRET;
  const SESSION_COOKIE_KEY = engine.settings.WEBAPP_SESSION_COOKIE_KEY;
  const SESSION_COOKIE_OPTIONS = {
    
    // session cookies only apply to api routers
    path: '/api',
    
    // session cookies is only accessible from server
    httpOnly: true,
    
    // expiration of the cookie
    maxAge: engine.settings.WEBAPP_SESSION_COOKIE_EXPIRES_IN_MILLISECONDS,
    
    // By setting `true`, cookies will only saved when using HTTPS
    secure: engine.settings.WEBAPP_SESSION_COOKIE_SECURED,
    
    // Overwrite previous Set-Cookies
    overwrite: true
    
  };
  const DEVICE_COOKIE_SECRET = engine.settings.WEBAPP_DEVICE_COOKIE_SECRET;
  const DEVICE_COOKIE_KEY = engine.settings.WEBAPP_DEVICE_COOKIE_KEY;
  const DEVICE_COOKIE_OPTIONS = {
    
    // session cookies only apply to api routers
    path: '/api',
    
    // session cookies is only accessible from server
    httpOnly: true,
    
    // expiration of the cookie
    maxAge: engine.settings.WEBAPP_DEVICE_COOKIE_EXPIRES_IN_MILLISECONDS,
    
    // By setting `true`, cookies will only saved when using HTTPS
    secure: engine.settings.WEBAPP_DEVICE_COOKIE_SECURED,
    
    // Overwrite previous Set-Cookies
    overwrite: true
  };
  
  if (!engine.settings.WEBAPP_SESSION_COOKIE_EXPIRES_IN_MILLISECONDS) {
    delete SESSION_COOKIE_OPTIONS.maxAge;
  }
  
  engine.express.request.getAuthToken = function (): AuthToken {
    
    const req = this as Request;
    let auth = { id: undefined, session: undefined, user: undefined, allows: undefined, token: undefined };
    
    // return cached object
    if (Reflect.has(req, TOKEN_CACHED_PROPERTY_KEY)) {
      return Reflect.get(req, TOKEN_CACHED_PROPERTY_KEY);
    }
    
    if (!req.cookies) {
      throw new Error('Missing cookie parser middleware');
    }
    
    // device token is not there, return empty object
    if (!req.cookies[DEVICE_COOKIE_KEY]) {
      return req[TOKEN_CACHED_PROPERTY_KEY] = auth;
    }
    
    try {
      const result = verify(req.cookies[DEVICE_COOKIE_KEY], DEVICE_COOKIE_SECRET);
      const [id = null] = result.t || [];
      auth = Object.assign(auth, { id });
    }
    catch (err) {
      // TODO: Log this error, because someone try to hack this system
      this.logger.warn({
        cookie: req.cookies[DEVICE_COOKIE_KEY],
        error: err
      }, '[INTRUSION DETECTED] User sent invalidate device id:');
      return req[TOKEN_CACHED_PROPERTY_KEY] = auth;
    }
    
    // session is not there, return device id only
    if (!req.cookies[SESSION_COOKIE_KEY]) {
      return req[TOKEN_CACHED_PROPERTY_KEY] = auth;
    }
    
    try {
      const result = verify(req.cookies[SESSION_COOKIE_KEY], SESSION_COOKIE_SECRET);
      const [session = null, user = null, allows = [], token = null] = result.t || [];
      return req[TOKEN_CACHED_PROPERTY_KEY] = Object.assign(auth, { session, user, allows, token });
    }
    catch (err) {
      // TODO: Log this error, because someone try to hack this system
      this.logger.warn({
        cookie: req.cookies[SESSION_COOKIE_KEY],
        error: err
      }, '[INTRUSION DETECTED] User sent invalidate auth token:');
      return req[TOKEN_CACHED_PROPERTY_KEY] = auth;
    }
    
  };
  
  engine.express.request.setAuthToken = function (auth: AuthToken): void {
    const req = this as Request;
    req.res.sendAuthToken(auth);
    req[TOKEN_CACHED_PROPERTY_KEY] = auth;
  };
  
  engine.express.response.sendAuthToken = function (auth: AuthToken): void {
    
    const res = this as Response;
    
    res.cookie(
      DEVICE_COOKIE_KEY,
      sign(
        { t: [auth.id], v: 1 },
        DEVICE_COOKIE_SECRET
      ),
      DEVICE_COOKIE_OPTIONS
    );
    
    if (auth.session) {
      res.cookie(
        SESSION_COOKIE_KEY,
        sign(
          { t: [auth.session, auth.user, auth.allows, auth.token], v: 1 },
          SESSION_COOKIE_SECRET,
          // set noTimestamp: true because we will use our own timestamp
          { noTimestamp: true }
        ),
        SESSION_COOKIE_OPTIONS
      );
    }
    else {
      res.clearCookie(SESSION_COOKIE_KEY, SESSION_COOKIE_OPTIONS)
    }
    
  }
  
}
