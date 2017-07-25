import { Request, Response } from '../router';
import { VersionResult } from '../../shared/version';
import { BaseRouter, route, router } from 'agentstack-router';
import { IServerSettings } from '../../conf/settings';
import { ExpressEngine } from 'agentstack-express';


@router('/api/task')
export class TaskRouter extends BaseRouter<ExpressEngine<IServerSettings>, IServerSettings> {
  
  @route('GET', '/')
  tasks(req: Request, res: Response) {
    // using promise
    return req.database.Tasks.find();
  }
  
  @route('POST', '/new')
  async add(req: Request, res: Response) {
    // using async/await
    const added = await req.database.Tasks.insertOne(req.body);
    req.logger.info({ added }, 'new task created');
    return added;
  }
  
}
