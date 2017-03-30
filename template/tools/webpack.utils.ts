import * as ExtractTextPlugin  from 'extract-text-webpack-plugin'
import * as util from 'util';
import * as path from 'path'
import * as fs from 'fs'

declare const __dirname: string;
const projectRoot = path.resolve(__dirname, '..');

export function getExternalModules() {
  let externalNodeModules = Object.create(null);

// all node_modules will be consider as externals
  fs.readdirSync(path.join(projectRoot, 'node_modules'))
    .filter((x: string) => ['.bin'].indexOf(x) === -1)
    .forEach((mod: string) => {
      externalNodeModules[mod] = `commonjs ${mod}`
    });
  
  return externalNodeModules;
}

export function resolve(dir) {
  return path.join(projectRoot, dir)
}

export function configCssLoaders(options) {
  options = options || {};
  
  const cssLoader = {
    loader: 'custom-css-loader',
    options: {
      minimize: options.minimize || false,
      sourceMap: options.sourceMap || false
    }
  };
  
  // generate loader string to be used with extract text plugin
  function generateLoaders(loader?: string, loaderOptions?) {
    const loaders: Array<any> = [cssLoader];
    if (loader) {
      loaders.push({
        loader: loader + '-loader',
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      })
    }
    
    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
      // console.log('extra loader', loaders);
      return ExtractTextPlugin.extract({
        allChunks: true,
        use: loaders
      })
    } else {
      return ['vue-style-loader', ...loaders]
    }
  }
  
  // https://vue-loader.vuejs.org/en/configurations/extract-css.html
  const cssLoaders = {
    css: generateLoaders(),
    postcss: generateLoaders(),
    sass: generateLoaders('sass', { indentedSyntax: true }),
    scss: generateLoaders('sass'),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus')
  };
  // console.log('cssLoaders', util.inspect(cssLoaders, { depth: 4, colors: true }));
  return cssLoaders;
}

// Generate loaders for standalone style files (outside of .vue)
export function configStyleLoaders(options) {
  const output = [];
  const loaders = configCssLoaders(options);
  for (const extension in loaders) {
    const loader = loaders[extension];
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader
    });
  }
  // console.log('styleLoaders', util.inspect(output, { depth: 4, colors: true }));
  return output;
}
