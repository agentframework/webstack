import * as webpack from 'webpack'
import * as HtmlWebpackPlugin  from 'html-webpack-plugin'
import { configStyleLoaders, configCssLoaders, resolve } from './webpack.utils'

export default [
  {
    entry: {
      main: [resolve('src/webapp/main.ts'), resolve('src/webapp/main.hmr.ts')]
    },
    output: {
      path: resolve('public'),
      publicPath: '/',
      libraryTarget: 'umd',
      filename: 'assets/js/[name].[hash].js',
      chunkFilename: 'assets/js/[id].[hash].js'
    },
    resolve: {
      extensions: ['.ts', '.vue', '.js'],
      alias: {
        'vue$': 'vue/dist/vue.runtime.js',
        'vuex$': 'vuex/dist/vuex.js',
        'vue-router$': 'vue-router/dist/vue-router.js',
        'axios$': 'axios/dist/axios.js'
      }
    },
    externals: {
      // uncomment following lines if you want use external library
      // vue: {
      //   root: 'Vue', commonjs: 'vue', commonjs2: 'vue', amd: 'vue'
      // },
      // vuex: {
      //   root: 'Vuex', commonjs: 'vuex', commonjs2: 'vuex', amd: 'vuex'
      // },
      // 'vue-router': {
      //   root: 'VueRouter', commonjs: 'vue-router', commonjs2: 'vue-router', amd: 'vue-router'
      // },
      // axios: {
      //   root: 'axios', commonjs: 'axios', commonjs2: 'axios', amd: 'axios'
      // }
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          options: {
            loaders: {
              js: [
                'babel-loader?presets[]=babili',
                'vue-ts-loader?configFileName=tsconfig.webapp.json'
              ],
              ...configCssLoaders({ sourceMap: false, extract: false, minimize: false })
            }
          }
        },
        {
          test: /\.ts$/,
          use: [
            'babel-loader?presets[]=babili',
            'vue-ts-loader?configFileName=tsconfig.webapp.json'
          ],
          exclude: /node_modules/
        },
        {
          test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
          loader: 'file-loader',
          options: {
            name: 'assets/img/[name].[hash:7].[ext]'
          }
        },
        {
          test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
          loader: 'file-loader',
          options: {
            name: 'assets/fonts/[name].[hash:7].[ext]'
          }
        },
        ...configStyleLoaders({ sourceMap: false, extract: false, minimize: false })
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: '"development"'
        }
      }),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
      // https://github.com/ampedandwired/html-webpack-plugin
      new HtmlWebpackPlugin({
        title: '{{ name }} [dev]',
        filename: 'index.html',
        template: 'index.html',
        inject: true
      }),
      // split vendor js into its own file
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks: function (module, count) {
          // any required modules inside node_modules are extracted to vendor
          return true;
        }
      }),
      // extract webpack runtime and module manifest to its own file in order to
      // prevent vendor hash from being updated whenever app bundle is updated
      new webpack.optimize.CommonsChunkPlugin({
        name: 'manifest',
        chunks: ['vendor']
      }),
    ]
  }
];
