import { ExpressEngine } from '../core/ExpressEngine';
import { IServerSettings } from '../../conf/settings';

import { installModelExtensions } from './model';
import { installTokenExtensions } from './token';
import { installAuthenticationExtensions } from './authenticate';

export function installExpressExtensions<T extends IServerSettings>(engine: ExpressEngine<T>) {
  installModelExtensions(engine);
  installTokenExtensions(engine);
  installAuthenticationExtensions(engine);
}
