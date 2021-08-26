import axios from 'axios';
import _ from 'lodash';
import Vue from 'vue';
import store from '../vuex/store';
// import { mapActions } from 'vuex';
import TokenManager from '../managers/TokenManager';

const service = axios.create({
  baseURL: process.env.BASE_API,
  timeout: 10000,
});

service.interceptors.request.use(
  (config) => {
    const token_info = TokenManager.getTokenInfo();
    if (token_info.is_valid) {
      config.headers.Authorization = `Bearer ${token_info.token}`;
    }
    config.headers.version = process.env.VERSION;
    config.headers.lang = store.getters.lang;
    config.headers.group_seq = store.getters.group_seq;
    config.headers.service_domain = store.getters.current_domain;
    return config;
  },
  error => Promise.reject(error),
);

service.interceptors.response.use(
  (response) => {
    const res = response.data;
    return _.chain({})
      .extend(res)
      .omit('variables')
      .extend(res.variables)
      .value();
  },
  (error) => {
    let result = null;
    if (error.response && error.response.data) {
      result = _.chain({})
        .extend(error.response.data)
        .omit('variables')
        .extend(error.response.data.variables)
        .value();
    } else {
      result = {
        error: -1,
        message: '알수없는 오류',
      };
    }
    Vue.$log.error('request.onRejected', result);
    return result;
  },
);

export default service;
