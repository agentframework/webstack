import { Request, Response } from '../router';
import { VersionResult } from '../../shared/version';
import { BaseRouter, route, router } from 'agentstack-router';
import { IServerSettings } from '../../conf/settings';
import { ExpressEngine } from 'agentstack-express';


@router('/api')
export class RootRouter extends BaseRouter<ExpressEngine<IServerSettings>, IServerSettings> {
  
  @route('GET', '/version')
  async version(req: Request, res: Response) {
    const result: VersionResult = {
      version: this.settings.VERSION
    };
    res.json(result);
  }
  
}
