import * as express from 'express';
import { IServerSettings } from '../conf/settings';
import { ExpressEngine } from 'agentstack-express';
import { GlobalExceptionMiddleware } from './middlewares/exception.middleware';
import { GlobalMiddleware } from './middlewares/global.middleware';
import { RootRouter } from './routers/root.router';
import { DatabaseManager } from './database';
import { TaskRouter } from './routers/task.router';


export class Server extends ExpressEngine<IServerSettings> {
  
  onInit() {
    this.addAgent(DatabaseManager);
    
    this.addRouter(GlobalMiddleware);
    this.addRouter(RootRouter);
    this.addRouter(TaskRouter);
    this.addRouter(GlobalExceptionMiddleware);
    
  }
  
}

const server = new Server();

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
