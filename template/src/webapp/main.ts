import * as Vue from 'vue'
import store from './store';
import router from './routes';
import App from './layouts/app.vue';

export let app = new Vue({
  el: '#app',
  router,
  store,
  components: {
    App
  },
  render: (h) => h('app')
});
