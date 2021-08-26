import util from '../utils/util';

const TokenManagerClass = class {
  constructor() {
    this.expire_soon_hour = 3;
    this.expire_soon_sec = 3600 * this.expire_soon_hour;
  }

  setToken = (token_info) => {
    localStorage.setItem('user_token', token_info.token);
    localStorage.setItem('user_token_expire', token_info.expire);
  };

  deleteToken = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_token_expire');
  };

  getTokenInfo = () => {
    const stored_token = localStorage.getItem('user_token');
    const stored_token_expire = util.getInt(localStorage.getItem('user_token_expire'), 0);
    const current_timestamp = util.getCurrentTimestamp();
    const result = {
      is_valid: false,
      token: null,
      remain_time: 0,
      is_expire_soon: false,
    };

    if (!stored_token || !stored_token_expire) {
      return result;
    }
    if (stored_token_expire <= current_timestamp) {
      return result;
    }

    const remain_time = stored_token_expire - current_timestamp;

    result.is_valid = true;
    result.token = stored_token;
    result.remain_time = remain_time;
    result.is_expire_soon = remain_time < this.expire_soon_sec;

    return result;
  };

  isValidToken = () => this.getTokenInfo().is_valid;
};

export default new TokenManagerClass();
