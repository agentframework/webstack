import { ILogger } from 'agentstack';
import { IServerSettings } from '../conf/settings';
import { Server } from './server';

/**
 * Base agent, provide access to app settings and logger instance.
 */
export class Base {
  
  private _name: string;
  private _settings: IServerSettings;
  private _logger: ILogger;

  constructor(private _server: Server) {
    this._name = Reflect.getPrototypeOf(this).constructor.name;
    this._logger = _server.logger.child({ router: this._name });
    this._settings = _server.settings;
  }
  
  protected get server(): Server {
    return this._server;
  }
  
  protected get name(): string {
    return this._name;
  }
  
  protected get settings(): IServerSettings {
    return this._settings;
  }
  
  protected get logger(): ILogger {
    return this._logger;
  }
  
}
