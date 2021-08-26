import * as types from './mutation-types';
import api_user from '../api/ApiUser';
import Vue from 'vue';
import TokenManager from '../managers/TokenManager';

export const setTitle = ({ commit }, title) => {
  commit(types.SET_TITLE, title);
};

export const Login = async ({ commit, dispatch }, { user_id, password }) => {
  const result = await api_user.login(user_id, password);
  if (result && result.error === 0) {
    TokenManager.setToken(result);
    await dispatch('GetUserInfo');
  }
  return result;
};

export const GetUserInfo = async ({ commit }) => {
  if (!TokenManager.isValidToken()) return {};

  const { member_info } = await api_user.getUserInfo();
  if (!member_info) {
    return {};
  }

  commit('SET_LOGGED_INFO', member_info);

  return member_info;
};

export const UpdateUserInfo = async ({ commit }, { user_info }) => {
  // Vue.$log.debug('UpdateUserInfo', user_info);
  commit('SET_LOGGED_UPDATE', user_info);
  return true;
};

export const LogOut = async ({ commit }) => {
  await api_user.logout();
  TokenManager.deleteToken();
  commit('SET_LOGGED_INFO', {});
  commit('clearState');
  return null;
};

export const RefreshToken = async ({ dispatch, getters }) => {
  const token_info = TokenManager.getTokenInfo();
  if (!token_info.is_valid) {
    return false;
  }

  if (token_info.is_expire_soon) {
    const result = await api_user.refreshToken();
    if (!result || result.error !== 0) {
      return false;
    }
    TokenManager.setToken(result);
  }

  if (!getters.is_logged) {
    await dispatch('GetUserInfo');
  }

  return true;
};
