import * as webpack from 'webpack'
import * as HtmlWebpackPlugin  from 'html-webpack-plugin'
import * as ExtractTextPlugin from 'extract-text-webpack-plugin'
import * as OptimizeCSSPlugin from 'optimize-css-assets-webpack-plugin'
import { BundleAnalyzerPlugin }  from 'webpack-bundle-analyzer'
import { configCssLoaders, getExternalModules, resolve } from './webpack.utils'

export default [
  {
    entry: {
      main: resolve('src/webapp/main.ts')
    },
    output: {
      path: resolve('public'),
      publicPath: '/',
      libraryTarget: 'umd',
      filename: 'assets/js/[name].[chunkhash].js',
      chunkFilename: 'assets/js/[id].[chunkhash].js'
    },
    resolve: {
      extensions: ['.ts', '.vue', '.js'],
      alias: {
        'vue$': 'vue/dist/vue.runtime.min.js',
        'vuex$': 'vuex/dist/vuex.min.js',
        'vue-router$': 'vue-router/dist/vue-router.min.js',
        'axios$': 'axios/dist/axios.min.js'
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
              ...configCssLoaders({ sourceMap: false, extract: true, minimize: true })
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
        // all css was extracted to standalone css file. no need css loader on the fly
        //...styleLoaders({ sourceMap: false, extract: false, minimize: false })
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: '"production"'
        }
      }),
      // extract css into its own file
      new ExtractTextPlugin({
        filename: 'assets/css/[name].[contenthash].css'
      }),
      // Compress extracted CSS. We are using this plugin so that possible
      // duplicated CSS from different components can be deduped.
      new OptimizeCSSPlugin({
        cssProcessorOptions: {
          safe: true
        }
      }),
      // generate dist index.html with correct asset hash for caching.
      // you can customize output by editing /index.html
      // see https://github.com/ampedandwired/html-webpack-plugin
      new HtmlWebpackPlugin({
        title: '{{ name }}',
        filename: 'index.html',
        template: 'index.html',
        inject: true,
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true
          // more options:
          // https://github.com/kangax/html-minifier#options-quick-reference
        },
        // necessary to consistently work with multiple chunks via CommonsChunkPlugin
        chunksSortMode: 'dependency'
      }),
      // split vendor js into its own file
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks: function (module, count) {
          // any required modules inside node_modules are extracted to vendor
          return (
            module.resource &&
            /\.js$/.test(module.resource) &&
            module.resource.indexOf(resolve('node_modules')) === 0
          )
        }
      }),
      // extract webpack runtime and module manifest to its own file in order to
      // prevent vendor hash from being updated whenever app bundle is updated
      new webpack.optimize.CommonsChunkPlugin({
        name: 'manifest',
        chunks: ['vendor']
      }),
      ...process.env.npm_config_report ? [new BundleAnalyzerPlugin()] : []
    ]
  },
  {
    target: 'node',
    entry: {
      standalone: resolve('src/bin/standalone.ts')
    },
    output: {
      path: resolve('bin'),
      filename: '[name]'
    },
    node: {
      __dirname: false
    },
    externals: getExternalModules(),
    resolve: {
      extensions: ['.ts']
    },
    module: {
      loaders: [
        {
          test: /\.ts$/,
          loaders: ['babel-loader?presets[]=babili', 'ts-loader'] //
        }
      ]
    },
    plugins: [
      new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: 1, entryOnly: 1 })
    ]
  }
];
