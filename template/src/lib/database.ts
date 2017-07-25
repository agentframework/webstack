import { MongoClient, MongoDatabase, MongoManager } from 'agentstack-mongodb';
import { TaskCollection } from './models/task.collection';
import { agent } from 'agentframework';
import { Component } from 'agentstack-router';
import { ExpressEngine } from 'agentstack-express';
import { IServerSettings } from '../conf/settings';


export class Database extends MongoDatabase {
  
  // Local users
  Tasks = new TaskCollection(this);
  
}

@agent('DatabaseManager')
export class DatabaseManager extends Component<ExpressEngine<IServerSettings>, IServerSettings> {
  
  protected mongodb = new MongoManager(this.settings.MONGODB, this.logger);
  
  /**
   * Get a connection from pool
   */
  retrieveConnection(): Promise<MongoClient> {
    const client: MongoClient = this.mongodb.server();
    // reconnect if error
    client.reconnect();
    // only return if ready
    return client.ready().then(connection => {
      return connection as MongoClient;
    });
  }
  
  /**
   * Get a database without postfix ''
   */
  retrieveDatabase(): Promise<Database> {
    return this.retrieveConnection().then(client => {
      return new Database(client, '');
    });
  }

  
}
