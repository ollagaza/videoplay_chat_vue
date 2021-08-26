import request from '../utils/request';

export default {
  test: () => request({
    url: '/test',
    method: 'get',
  }),
};
