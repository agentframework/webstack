import { Agent } from 'agentframework';
import { inspect } from 'util';
import * as express from 'express';
import * as compression from 'compression'

import { forEach } from './utils/index';
import { IServerSettings } from '../conf/settings';
import { installExpressExtensions } from './core.extensions/index';


import * as Routers from './routers';
import { ExpressEngine } from './core/ExpressEngine';


export class Server extends ExpressEngine<IServerSettings> {
}

const server = new Server();

//////////////////////////////////////////////////////////////////////////////////////
// Exception Handler
process.on('unhandledPromiseRejection', (promise, rejection) => {
  server.logger.error({ rejection: inspect(rejection), promise: inspect(promise) }, 'unhandledPromiseRejection');
});

process.on('unhandledRejection', (error, promise) => {
  server.logger.error({ error: inspect(error), promise: inspect(promise) }, 'unhandledRejection');
});

//////////////////////////////////////////////////////////////////////////////////////
// Extensions
installExpressExtensions<IServerSettings>(server);

//////////////////////////////////////////////////////////////////////////////////////
// Router Agents
forEach<Agent>(Routers, router => server.addRouter(router));


server.application.use(compression({filter: shouldCompress}));

function shouldCompress (req, res) {
  if (req.headers['x-no-compression']) {
    // don't compress responses with this request header
    return false
  }
  // fallback to standard filter function
  return compression.filter(req, res)
}

//////////////////////////////////////////////////////////////////////////////////////
// Static pages
server.application.use(express.static('public'));

//////////////////////////////////////////////////////////////////////////////////////
// Webpack for development only
if (server.settings.ENV === 'development' || server.settings.ENV === 'testing') {
  
  server.logger.warn('+==================================================================+');
  server.logger.warn('| Please set system environment NODE_ENV=production for production |');
  server.logger.warn('+==================================================================+');
  
  const webpack = require('webpack');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const config = require('../../tools/webpack.run.config').default;
  const compiler = webpack(config);
  
  const devMiddleware = webpackDevMiddleware(compiler, {
    noInfo: true,
    publicPath: config[0].output.publicPath,
    stats: { colors: true }
  });
  
  const hotMiddleware = webpackHotMiddleware(compiler, {
    log: console.log
  });
  
  // force page reload when html-webpack-plugin template changes
  compiler.plugin('compilation', function (compilation) {
    compilation.plugin('html-webpack-plugin-after-emit', function (data, next) {
      hotMiddleware.publish({ action: 'reload' });
      next();
    })
  });
  
  server.application.use(devMiddleware);
  server.application.use(hotMiddleware);
  
}


export default server;
