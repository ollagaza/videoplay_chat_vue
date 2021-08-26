// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import VueResource from 'vue-resource';
import config from './config';
import router from './router/router';
import store from './vuex/store';
import VueLogger from 'vuejs-logger';
import { sync } from 'vuex-router-sync';

Vue.config.productionTip = false;
Vue.use(VueLogger, config.getLogOption());
Vue.use(VueResource);

sync(store, router);

/* eslint-disable no-new */
new Vue({
  router,
  template: '<App/>',
  components: { App },
}).$mount('#app');
