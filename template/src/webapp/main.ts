import * as Vue from 'vue'
import store from './store';
import router from './routes';

const App = require('./layouts/app');

export let app = new Vue({
  el: '#app',
  router,
  store,
  components: {
    App
  },
  render: (h) => h('app')
});
