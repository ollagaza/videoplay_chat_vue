import request from '../utils/request';

export default {
  deleteData: (api_type, api_key) => request({
    url: `/operation/${api_type}/${api_key}`,
    method: 'delete',
  }),
  getViewData: (api_type, api_key) => request({
    url: `/operation/${api_type}/${api_key}/view2`,
    method: 'get',
  }),
  getViewFileData: (api_type, api_key) => request({
    url: `/operation/${api_type}/${api_key}/view/file`,
    method: 'get',
  }),
  getInfoData: (api_type, api_key, options) => request({
    url: `/operation/${api_type}/${api_key}/info`,
    method: 'post',
    data: options,
  }),
  updateData: (api_type, api_key, data) => request({
    url: `/operation/${api_type}/${api_key}/modify`,
    method: 'put',
    data,
  }),

  changeDoc: (api_type, api_key, data) => request({
    url: `/operation/${api_type}/${api_key}/doc`,
    method: 'put',
    data,
  }),

  changeOpenVideo: (api_type, api_key, data) => request({
    url: `/operation/${api_type}/${api_key}/open_video`,
    method: 'put',
    data,
  }),

  getCommentList: (api_type, api_key, params) => request({
    url: `/operation/${api_type}/${api_key}/comment`,
    method: 'get',
    params,
  }),

  getCommentCount: (api_type, api_key, params) => request({
    url: `/operation/${api_type}/${api_key}/comment/count`,
    method: 'get',
    params,
  }),

  getComment: (api_type, api_key, comment_seq, params) => request({
    url: `/operation/${api_type}/${api_key}/comment/${comment_seq}`,
    method: 'get',
    params,
  }),

  createComment: (api_type, api_key, data = null) => request({
    url: `/operation/${api_type}/${api_key}/comment`,
    method: 'post',
    data,
  }),

  changeComment: (api_type, api_key, comment_seq, data) => request({
    url: `/operation/${api_type}/${api_key}/comment/${comment_seq}`,
    method: 'put',
    data,
  }),

  deleteComment: (api_type, api_key, comment_seq, data = null) => request({
    url: `/operation/${api_type}/${api_key}/comment/${comment_seq}`,
    method: 'delete',
    data,
  }),

  likeComment: (api_type, api_key, comment_seq) => request({
    url: `/operation/${api_type}/${api_key}/comment/${comment_seq}/like`,
    method: 'put',
  }),

  dislikeComment: (api_type, api_key, comment_seq) => request({
    url: `/operation/${api_type}/${api_key}/comment/${comment_seq}/like`,
    method: 'delete',
  }),

  createClip: (api_type, api_key, data) => request({
    url: `/operation/${api_type}/${api_key}/clip`,
    method: 'post',
    data,
  }),

  updateClip: (api_type, api_key, clip_id, data) => request({
    url: `/operation/${api_type}/${api_key}/clip/${clip_id}`,
    method: 'put',
    data,
  }),

  deleteClip: (api_type, api_key, clip_id, data) => request({
    url: `/operation/${api_type}/${api_key}/clip/${clip_id}`,
    method: 'delete',
    data,
  }),

  createPhase: (api_type, api_key, data) => request({
    url: `/operation/${api_type}/${api_key}/phase`,
    method: 'post',
    data,
  }),

  deletePhase: (api_type, api_key, phase_id) => request({
    url: `/operation/${api_type}/${api_key}/phase/${phase_id}`,
    method: 'delete',
  }),

  updatePhase: (api_type, api_key, phase_id, phase_desc) => request({
    url: `/operation/${api_type}/${api_key}/phase/${phase_id}`,
    method: 'put',
    data: {
      phase_desc,
    },
  }),

  setPhase: (api_type, api_key, phase_id, data) => request({
    url: `/operation/${api_type}/${api_key}/phase/${phase_id}/clips`,
    method: 'put',
    data,
  }),

  unsetPhase: (api_type, api_key, phase_id, data) => request({
    url: `/operation/${api_type}/${api_key}/clip/phase/${phase_id}`,
    method: 'delete',
    data,
  }),

  uploadThumbnailImage: (api_type, api_key, data, progress_callback = null) => request({
    url: `/operation/${api_type}/${api_key}/thumbnail`,
    method: 'put',
    data,
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: progress_callback,
    timeout: 0,
  }),

  getFiles: (api_type, api_key, file_type, params) => request({
    url: `/operation/${api_type}/${api_key}/files/${file_type}`,
    method: 'get',
    params,
  }),

  addFile: (api_type, api_key, file_type, data, progress_callback, cancel_source) => request({
    url: `/operation/${api_type}/${api_key}/files/${file_type}`,
    method: 'post',
    data,
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: progress_callback,
    timeout: 0,
    cancelToken: cancel_source.token,
  }),

  deleteFiles: (api_type, api_key, file_type, data) => request({
    url: `/operation/${api_type}/${api_key}/files/${file_type}`,
    method: 'delete',
    data,
  }),

  getOperationVideoUrl: (api_type, api_key) => request({
    url: `/operation/${api_type}/${api_key}/video/url`,
    method: 'get',
  }),

  getOperationMode: (api_type, api_key) => request({
    url: `/operation/${api_type}/${api_key}/mode`,
    method: 'get',
  }),

  onUploadComplete: (api_type, api_key) => request({
    url: `/operation/${api_type}/${api_key}/files/upload/complete`,
    method: 'put',
    timeout: 0,
  }),

  renameOperationFile: (api_type, api_key, data) => request({
    url: `/operation/${api_type}/${api_key}/operation/files/name`,
    method: 'put',
    data,
  }),

  validationOperationFileName: (api_type, api_key, data) => request({
    url: `/operation/${api_type}/${api_key}/operation/files/name/validation`,
    method: 'post',
    data,
  }),

  changeOperationFileType: (api_type, api_key, data) => request({
    url: `/operation/${api_type}/${api_key}/operation/files/type`,
    method: 'put',
    data,
  }),

  changeOperationFileRotation: (api_type, api_key, data) => request({
    url: `/operation/${api_type}/${api_key}/operation/files/rotation`,
    method: 'put',
    data,
  }),

  getAdminOperationList: params => request({
    url: '/operation/admin',
    method: 'get',
    params,
  }),

  addOperationPDFChart: (api_type, api_key, upload_id, data, progress_callback, cancel_source) => request({
    url: `/operation/${api_type}/${api_key}/operation/files/chart/pdf/${upload_id}`,
    method: 'post',
    data,
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: progress_callback,
    timeout: 0,
    cancelToken: cancel_source.token,
  }),

  checkOperationPrecess: (api_type, api_key) => request({
    url: `/operation/${api_type}/${api_key}/operation/process/check`,
    method: 'post',
    timeout: 0,
  }),

  continueOperationPrecess: (api_type, api_key) => request({
    url: `/operation/${api_type}/${api_key}/operation/process/continue`,
    method: 'post',
    timeout: 0,
  }),

  requestTranscodingForce: (api_type, api_key) => request({
    url: `/operation/${api_type}/${api_key}/operation/process/trans/request`,
    method: 'post',
    timeout: 0,
  }),

  transcodingCompleteForce: (api_type, api_key) => request({
    url: `/operation/${api_type}/${api_key}/operation/process/trans/complete`,
    method: 'post',
    timeout: 0,
  }),

  requestFileMoveForce: (api_type, api_key) => request({
    url: `/operation/${api_type}/${api_key}/operation/process/file/move`,
    method: 'post',
    timeout: 0,
  }),

  requestTranscodingForceByList: (api_type, seq_list) => request({
    url: `/operation/${api_type}/operation/process/trans/request/list`,
    method: 'post',
    timeout: 0,
    data: {
      seq_list,
    },
  }),
  setTemplateGrade: (api_type, api_key, template_grade) => request({
    url: `/operation/${api_type}/${api_key}/template_grade`,
    method: 'post',
    data: {
      template_grade,
    },
  }),
};
