import request from '../utils/request';

export default {
  getContentId: () => request({
    url: '/common/newcontentid',
    method: 'post',
  }),
  getLastUpdate: () => request({
    url: '/common/last_update',
    method: 'get',
  }),
};
