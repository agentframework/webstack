import * as Vue from 'vue'
import * as VueRouter from 'vue-router';
import Welcome from './components/welcome.vue';
import About from './components/about.vue';

Vue.use(VueRouter);

const routes = [
  { path: '/welcome', component: Welcome },
  { path: '/about', component: About }
];

export default new VueRouter({
  routes
});
