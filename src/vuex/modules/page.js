
import * as types from '../mutation-types';

const state = {
  title: '',
};

const mutations = {
  [types.SET_TITLE](state, title) {
    state.title = title;
  },
};

export default {
  state,
  mutations,
};
