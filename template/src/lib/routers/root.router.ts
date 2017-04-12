import { Request, Response } from '../router';
import { VersionResult } from '../../shared/version';
import { route, router } from 'agentstack-express';
import { IServerSettings } from '../../conf/settings';
import { Server } from '../server';


@router('/api')
export class RootRouter {
  
  settings: IServerSettings;
  
  constructor(server: Server) {
    this.settings = server.settings;
  }
  
  @route('GET', '/version')
  async version(req: Request, res: Response) {
    const result: VersionResult = {
      version: this.settings.VERSION
    };
    res.json(result);
  }
  
}
