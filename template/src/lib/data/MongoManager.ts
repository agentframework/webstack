import { agent } from 'agentframework';
import { MongoServer } from './MongoTypes';
import { MongoClient } from './MongoClient';
import { ILogger } from 'agentstack';

/**
 * Manage all databases
 */
@agent()
export class MongoManager {

  servers: Map<string, MongoClient>;
  logger: ILogger;

  constructor(servers: Array<MongoServer>, logger: ILogger) {
    this.servers = new Map<string, MongoClient>();
    this.logger = logger;
    
    servers.forEach(node => {
      const client = new MongoClient(node, node.name, this.logger);
      this.servers.set(client.name, client);
    });
  }

  server(name?: string): MongoClient {
    let server;
    if (name == null) {
      const pair = this.servers.entries().next().value;
      if (!pair) {
        throw new Error('Default mongodb server not found');
      }
      server = pair[1];
    }
    else {
      if (!this.servers.has(name)) {
        throw new Error(`Mongodb server ${name} is not configured`);
      }
      server = this.servers.get(name);
    }
    return server;
  }

}
