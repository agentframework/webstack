import { MongoDatabase } from '../data/MongoModel'
import { ExpressEngine } from '../core/ExpressEngine'
import { IServerSettings } from '../../conf/settings'
import { MongoManager } from '../data/MongoManager'
import { Request } from '../router'
import { UserCollection } from '../models/system/user.collection'
import { SessionCollection } from '../models/system/session.collection';


export class SystemDatabase extends MongoDatabase {
  
  Users = new UserCollection(this);
  Sessions = new SessionCollection(this);
  
}


export function installModelExtensions(engine: ExpressEngine<IServerSettings>) {
  
  const MONGO_MANAGER_PROPERTY_KEY = Symbol.for('mongo.manager');
  const MONGO_SYSTEM_PROPERTY_KEY = Symbol.for('mongo.system');
  
  /**
   * Uncomment the following line to allow all request share same db connection,
   * but need cater disconnected events
   */
  
  engine.express.request.system = function (): SystemDatabase {
    
    const req = this as Request;
    
    if (!req.app[MONGO_SYSTEM_PROPERTY_KEY]) {
      
      if (!req.app[MONGO_MANAGER_PROPERTY_KEY]) {
        // lazy init
        req.app[MONGO_MANAGER_PROPERTY_KEY] = new MongoManager(req.settings.MONGODB, req.logger);
      }
      
      const manager = req.app[MONGO_MANAGER_PROPERTY_KEY] as MongoManager;
      const client = manager.server();
      
      // lazy init
      req.app[MONGO_SYSTEM_PROPERTY_KEY] = new SystemDatabase(client, '');
    }
    
    return req.app[MONGO_SYSTEM_PROPERTY_KEY];
    
  };
  
  
}
