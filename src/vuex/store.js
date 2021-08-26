import Vue from 'vue';
import Vuex from 'vuex';
import page from './modules/page';
import auth from './modules/auth';
import * as actions from './actions';
import * as getters from './getters';
import createLogger from 'vuex/dist/logger';
import createPersistedState from 'vuex-persistedstate';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';
Vue.config.debug = debug;

const plugin_list = [createPersistedState({ storage: window.localStorage })];
if (debug) {
  plugin_list.push(createLogger());
}

export default new Vuex.Store({
  modules: {
    page,
    auth,
  },
  state: {
    socket_url: null,
    lang: 'kor',
    site_info: null,
    user_data: {
      menu_mode: null,
      stored: {},
    },
    operation_options: null,
  },
  actions,
  getters,
  strict: debug,
  plugins: plugin_list,
  mutations: {
    clearState(state) {
      state.operation_options = null;
      state.user_data.stored = {};
    },
    setUserStoredData(state, stored_data) {
      // Vue.$log.debug('setUserStoredData ===');
      state.user_data.stored = stored_data;
    },
  },
});
