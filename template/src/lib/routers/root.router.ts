import { Request, Response, Next } from '../router';
import { router, route } from '../core/ExpressDecorators';
import { ServerRouter } from '../router';
import { VersionResult } from '../../shared/version';


@router('/api')
export class RootRouter extends ServerRouter {
  
  @route('GET', '/version')
  async version(req: Request, res: Response) {
    const result: VersionResult = {
      version: this.settings.VERSION
    };
    res.json(result);
  }
  
}
