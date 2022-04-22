// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import VueResource from 'vue-resource';
import config from './config';
import router from './router/router';
import store from './vuex/store';
// import './assets/css/renewal/base.css';
// import './assets/css/renewal/buttons.css';
// import './assets/css/renewal/page_layout.css';
// import './assets/css/renewal/popup.css';
// import './assets/css/renewal/list.css';
// import './assets/css/renewal/contents.css';
// import './assets/css/renewal/theme_black.css';
// import './assets/css/renewal/theme_white.css';
// import './assets/css/renewal/theme_purple.css';
// import './assets/css/renewal/theme_turquoise.css';
// import './assets/css/renewal/theme_emerald.css';
// import './assets/css/renewal/tooltip.css';
// import './assets/css/renewal/curation.css';
// import './assets/css/renewal/group_popup.css';
// import './assets/css/renewal/invite.css';
// import './assets/css/renewal/margin.css';
// import './assets/css/renewal/tiny_editor.css';
// import './assets/css/renewal/annotation_draw.css';
// import './assets/css/renewal/timer.css';
// import './assets/css/renewal/notice.css';
// import './assets/css/renewal/basic_dynamic_template.css';
import VueLogger from 'vuejs-logger';
import { sync } from 'vuex-router-sync';
import Directives from './plugin/directives';
import VueCookies from "vue-cookies";

// socket 가동...
// import io from 'socket.io-client';
// const socket = io('http://localhost:3001/chat',{
//   withCredentials: true,
//   extraHeaders: {
//     "my-custom-header": "djyu"
//   },
//   rejectUnauthorized: false,
// })

// Vue.prototype.$socket = socket;
Vue.use(Directives);
Vue.config.productionTip = false;
Vue.use(VueLogger, config.getLogOption());
Vue.use(VueResource);
Vue.use(VueCookies);
Vue.$cookies.config("7d");

sync(store, router);

/* eslint-disable no-new */
new Vue({
  router,
  template: '<App/>',
  components: { App },
}).$mount('#app');
