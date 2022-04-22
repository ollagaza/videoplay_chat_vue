import request from '../utils/request';

export default {
  getOperationList: params => request({
    url: '/operations/list',
    method: 'get',
    params,
  }),

  createOperation: data => request({
    url: '/operations',
    method: 'post',
    data,
  }),


  createOperationReg: data => request({
    url: '/operations/reg',
    method: 'post',
    data,
  }),

  copyOperationList: data => request({
    url: '/operations/copy/list',
    method: 'post',
    data,
  }),

  copyOperationOne: data => request({
    url: `/operations/copy/${data.operation_seq}`,
    method: 'post',
    data,
  }),

  getOperation: operation_seq => request({
    url: `/operations/${operation_seq}`,
    method: 'get',
  }),

  getOperationMetadata: operation_seq => request({
    url: `/operations/${operation_seq}/metadata`,
    method: 'get',
  }),

  getIndexes: operation_seq => request({
    url: `/operations/${operation_seq}/indexes`,
    method: 'get',
  }),

  createIndex: (operation_seq, second) => request({
    url: `/operations/${operation_seq}/indexes/${second}`,
    method: 'post',
  }),

  getClipList: operation_seq => request({
    url: `/operations/${operation_seq}/clip/list`,
    method: 'get',
  }),

  createClip: (operation_seq, data) => request({
    url: `/operations/${operation_seq}/clip`,
    method: 'post',
    data,
  }),

  updateClip: (operation_seq, clip_id, data) => request({
    url: `/operations/${operation_seq}/clip/${clip_id}`,
    method: 'put',
    data,
  }),

  deleteClip: (operation_seq, clip_id, data) => request({
    url: `/operations/${operation_seq}/clip/${clip_id}`,
    method: 'delete',
    data,
  }),

  createPhase: (operation_seq, data) => request({
    url: `/operations/${operation_seq}/phase`,
    method: 'post',
    data,
  }),

  deletePhase: (operation_seq, phase_id) => request({
    url: `/operations/${operation_seq}/phase/${phase_id}`,
    method: 'delete',
  }),

  unsetPhase: (operation_seq, phase_id, data) => request({
    url: `/operations/${operation_seq}/clip/phase/${phase_id}`,
    method: 'delete',
    data,
  }),

  updateOperation: (operation_seq, data) => request({
    url: `/operations/${operation_seq}`,
    method: 'put',
    data,
  }),

  createServiceRequest: operation_seq => request({
    url: `/operations/${operation_seq}/request/service`,
    method: 'post',
  }),

  createAnalysisRequest: operation_seq => request({
    url: `/operations/${operation_seq}/request/analysis2`,
    method: 'post',
    timeout: 0,
  }),

  deleteOperation: operation_seq => request({
    url: `/operations/${operation_seq}`,
    method: 'delete',
  }),

  deleteOperations: operations => request({
    url: '/operations/delete_operations',
    method: 'delete',
    data: {
      operations,
    },
  }),

  updateOperationTrash: seq_list => request({
    url: '/operations/trash',
    method: 'put',
    data: {
      seq_list,
    },
  }),

  deleteOperationTrash: (seq_list, folder_info) => request({
    url: '/operations/trash',
    method: 'delete',
    data: {
      seq_list,
      folder_info,
    },
  }),

  updateOperationFavorite: operation_seq => request({
    url: `/operations/${operation_seq}/favorite`,
    method: 'put',
  }),

  deleteOperationFavorite: operation_seq => request({
    url: `/operations/${operation_seq}/favorite`,
    method: 'delete',
  }),

  createOperationFile: (operation_seq, file_type, data, progress_callback, cancel_source) => request({
    url: `/operations/${operation_seq}/files2/${file_type}`,
    method: 'post',
    data,
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: progress_callback,
    timeout: 0,
    cancelToken: cancel_source.token,
  }),

  onUploadComplete: (operation_seq, data = null) => request({
    url: `/operations/${operation_seq}/files2/upload/complete`,
    method: 'put',
    timeout: 0,
    data,
  }),

  verifyOperationCode: operation_code => request({
    url: '/operations/verify/operation_code',
    method: 'post',
    data: {
      operation_code,
    },
  }),

  getOperationVideoUrl: operation_seq => request({
    url: `/operations/${operation_seq}/video/url`,
    method: 'get',
  }),

  getOperationFiles: operation_seq => request({
    url: `/operations/${operation_seq}/files`,
    method: 'get',
  }),

  deleteOperationFiles: (operation_seq, file_type, data) => request({
    url: `/operations/${operation_seq}/files/${file_type}`,
    method: 'delete',
    data,
  }),

  getStorageSummary: () => request({
    url: '/operations/storage/summary',
    method: 'get',
  }),

  getShareUsers: operation_seq => request({
    url: `/operations/${operation_seq}/share/users`,
    method: 'get',
  }),

  getMediaInfo: operation_seq => request({
    url: `/operations/${operation_seq}/media_info`,
    method: 'get',
  }),

  getAllClips: (member_seq = '') => request({
    url: `/operations/clips/${member_seq}`,
    method: 'get',
  }),

  uploadThumbnailImage: (operation_seq, data, progress_callback = null) => request({
    url: `/operations/${operation_seq}/thumbnail2`,
    method: 'put',
    data,
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: progress_callback,
    timeout: 0,
  }),

  getOperationData: operation_seq => request({
    url: `/operations/${operation_seq}/data`,
    method: 'get',
  }),

  isOperationActive: operation_seq => request({
    url: `/operations/${operation_seq}/active`,
    method: 'get',
  }),

  isOperationAbleRestore: operation_seq => request({
    url: `/operations/${operation_seq}/able/restore`,
    method: 'get',
  }),
};
