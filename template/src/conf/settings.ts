import { MongoServer } from '../lib/data';
import { IExpressEngineSettings } from '../lib/core/ExpressEngine';

export interface IServerSettings extends IExpressEngineSettings {
  
  MONGODB: Array<MongoServer>
  
}

