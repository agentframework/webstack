# webstack

> ES6 ready for both frontend and backend. 

> A full-featured Webpack setup with typescript, mongodb, hot-reload, unit testing & css extraction.

> Share models and interfaces between backend services and frontend components.

> Integrate with Agent Framework with decorators based routing system.

> Production build is ~60kb (gzipped size) smaller than official vue webpack boilerplate.

## Dependencies

- TypeScript 2
- Vue 2
- Mongodb
- Agent Framework
- YAML
- Express 5
- JSON logging

## Usage

This is a project template for [vue-cli](https://github.com/vuejs/vue-cli). **It is recommended to use npm 3+ for a more efficient dependency tree.**

``` bash
$ npm install -g vue-cli
$ vue init agentframework/webstack my-project
$ cd my-project
$ npm install
$ npm run serv
```

If port 8080 is already in use on your machine you must change the port number in `/conf/development.yaml`. Otherwise `npm run serv` will fail.

## What's Included

- `npm run serv`: first-in-class development experience.
  - Webpack + `vue-loader` + `vue-ts-loader` for single file Vue components with typescript support
  - State preserving hot-reload
  - State preserving compilation error overlay

- `npm run lint`:
  - Auto format
  - TSLint

- `npm run build`: Production ready build.
  - ES6 scripts minified with [Babili](https://github.com/babel/babili).
  - HTML minified with [html-minifier](https://github.com/kangax/html-minifier).
  - CSS across all components extracted into a single file and minified with [cssnano](https://github.com/ben-eb/cssnano).
  - All static assets compiled with version hashes for efficient long-term caching, and a production `index.html` is auto-generated with proper URLs to these generated assets.
  - Use `npm run build --report`to build with bundle size analytics.

- `npm run test`: Auto test after save

- `npm run cov`: Generate coverage report


### Fork It And Make Your Own

You can fork this repo to create your own boilerplate, and use it with `vue-cli`:

``` bash
vue init username/repo my-project
```
