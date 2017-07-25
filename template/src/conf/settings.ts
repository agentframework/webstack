import { IExpressEngineSettings } from 'agentstack-express';
import { MongoServer } from 'agentstack-mongodb';

export interface IServerSettings extends IExpressEngineSettings {
  
  MONGODB: Array<MongoServer>

}

