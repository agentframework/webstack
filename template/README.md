# {{ name }}

> {{ description }}

## Dependencies
  - Vue 2
  - Webpack 2
  - TypeScript 2
  - AgentFramework
  - Express for TypeScript 2
  - Mongodb for TypeScript 2
  - YAML

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run serv

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

```

## Known Issue

> The latest version of `css-loader` will introduce Buffer into browser which is not necessary. So this project is using a customized `css-loader` to reduce the production dist size by ~40kb (after min+gzipped)
