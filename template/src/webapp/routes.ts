import * as Vue from 'vue'
import * as VueRouter from 'vue-router';

Vue.use(VueRouter);

const Welcome = require('./components/welcome');
const About = require('./components/about');

const routes = [
  { path: '/welcome', component: Welcome },
  { path: '/about', component: About }
];

export default new VueRouter({
  routes
});
