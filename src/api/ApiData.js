import request from '../utils/request';

export default {
  getHospitals: () => request({
    url: '/data/hospitals',
    method: 'get',
  }),

  getDeparts: () => request({
    url: '/data/departs',
    method: 'get',
  }),

  getNewJoinUsers: params => request({
    url: '/data/new_join_users',
    method: 'get',
    params,
  }),

  getTimeStamp: () => request({
    url: '/data/timestamp',
    method: 'get',
  }),

  getSocketURL: () => request({
    url: '/data/socket_url',
    method: 'get',
  }),

  getMedicalInfo: (lang = null) => request({
    url: lang ? `/data/medical/${lang}` : '/data/medical',
    method: 'get',
  }),

  getInterestInfo: (lang = null) => request({
    url: lang ? `/data/interest/${lang}` : '/data/interest',
    method: 'get',
  }),

  getSystemData: () => request({
    url: '/data/system',
    method: 'get',
  }),
};
