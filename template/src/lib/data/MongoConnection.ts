import { conditional, success, agent } from 'agentframework';
import * as mongodb from 'mongodb-core';
import { ServerError } from '../core/ExpressError';
import { MongoServer, Connection, MongoCommandResult, MongoCommandCallbackHandler } from './MongoTypes';
import { ILogger } from 'agentstack';


export let MongoServerDefaults = {
  emitError: true,
  size: 10
};

@agent()
export class MongoConnection {
  
  public writeConcern: any;
  public namespace: string;
  public errorCount: number;
  
  public get server(): MongoServer | any {
    return this._server;
  }
  
  public get state(): string {
    return this._state;
  }
  
  public get name(): string {
    return this._connection.name;
  }
  
  private _server: MongoServer;
  private _connection: Connection;
  private _state: string;
  protected logger: ILogger;
  
  
  constructor(server: MongoServer, namespace: string, logger: ILogger) {
    this._server = Object.assign(Object.create(MongoServerDefaults), server);
    this.logger = logger;
    this.namespace = namespace;
    this.writeConcern = { w: 'majority' };
    this.errorCount = 0;
    this.init(this._server);
  }
  
  /**
   * Initialize mongo client
   */
  @conditional('initialized', false)
  @success('initialized', true)
  public init(server: MongoServer): void {
    
    // create mongo core
    this._connection = new mongodb.Server(server);
    
    // register events
    [
      'close',
      'error',
      'timeout',
      'parseError',
      'connect',
      'reconnect',
      'reconnectFailed',
      'serverOpening',
      'serverClosed',
      // 'serverDescriptionChanged',
      'topologyOpening',
      'topologyClosed',
      // 'topologyDescriptionChanged',
      'destroy'
    ].forEach(event => {
      this._connection.on(event, e => {
        
        if (event === 'error') {
          this.errorCount++;
        }
        
        if (~['error', 'reconnectFailed', 'parseError'].indexOf(event)) {
          this.logger.error({ error: e }, `DB state: ${this._state} -> ${event}`);
        }
        else if (~['close', 'timeout'].indexOf(event)) {
          this.logger.warn({ error: e }, `DB state: ${this._state} -> ${event}`);
        }
        else {
          this.logger.debug({ ismaster: e.ismaster }, `DB state: ${this._state} -> ${event}`);
        }
        
        
        this._state = event;
      });
    });
    
    // connect
    this._connection.connect();
    
  }
  
  /**
   * Release current connections and reconnect to server
   */
  public reconnect(): void {
    if (this.errorCount && this.state === 'error') {
      this.errorCount = 0;
      this._connection.connect();
    }
  }
  
  /**
   * Is connected
   */
  public get connected(): boolean {
    return this._connection.isConnected();
  }
  
  /**
   * Is connecting
   */
  public get connecting(): boolean {
    return this._state === 'serverOpening';
  }
  
  /**
   * Ensure mongodb is ready to use
   */
  public ready(timeout: number = 5000): Promise<MongoConnection> {
    if (this.connected) {
      return Promise.resolve(this);
    }
    else if (this.connecting) {
      return new Promise((resolve, reject) => {
        const connectionTimer = setTimeout(() => {
          reject(new Error(`Not ready. Connection timed out`));
        }, timeout);
        this._connection.once('connect', () => {
          clearTimeout(connectionTimer);
          resolve(this);
        });
      });
    }
    else {
      const oldState = this.state;
      this.reconnect();
      return Promise.reject(new Error(`No connection to database, old state: ${oldState}, new state: ${this.state}. Please try to reconnect()`));
    }
  }
  
  /**
   * Run mongodb command
   */
  public runCommand(db: string, cmd: any): Promise<MongoCommandResult | any> {
    return this.ready().then(server => {
      return new Promise<MongoCommandResult>((resolve, reject) => {
        server._runCommand(true, db, cmd, (err: Error, result: MongoCommandResult) => {
          if (err) {
            reject(err);
          }
          else {
            resolve(result);
          }
        });
      });
    });
  }
  
  /**
   * Run mongodb admin command
   */
  public runAdminCommand(cmd: any): Promise<MongoCommandResult | any> {
    return this.ready().then(server => {
      return new Promise<MongoCommandResult>((resolve, reject) => {
        server._runCommand(false, 'admin', cmd, (err: Error, result: MongoCommandResult) => {
          if (err) {
            reject(err);
          }
          else {
            resolve(result);
          }
        });
      });
    });
  }
  
  
  private _runCommand(addNamespace: boolean, db: string, cmd: any, callback: MongoCommandCallbackHandler): void {
    
    const ns = addNamespace ? (db ? `${this.namespace}_${db}` : this.namespace) : db;
    
    this._connection.command(`${ns}.$cmd`, cmd, {}, (err: Error, response: any) => {
      
      if (err) {
        callback(new ServerError(err, { cmd }, null, 'Failed to run mongodb command'));
      }
      else if (response && response.result && response.result.ok) {
        callback(null, response.result);
      }
      else {
        const err = new Error('Mongodb command result is not ok');
        callback(new ServerError(err, response.result, null, 'Error returned from mongodb command'));
      }
    });
    
  }
  
  // protected _generateObjectId(document: any) {
  //   if (!Reflect.has(document, '_id')) {
  //     document._id = new ObjectId();
  //   }
  //   else if (IsValidObjectId(document._id)) {
  //     document._id = new ObjectId(document._id);
  //   }
  //   return document;
  // }
  //
  // protected _normalizeObjectId(document: any) {
  //   if (typeof document === 'object' && Reflect.has(document, '_id') && IsValidObjectId(document._id)) {
  //     document._id = new ObjectId(document._id);
  //   }
  //   return document;
  // }
  
}
