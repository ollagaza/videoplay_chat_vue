import request from '../utils/request';

export default {
  getSendMailList: params => request({
    url: '/etc/sendmaillist',
    method: 'get',
    params,
  }),
  getSendMailDetail: mail_seq => request({
    url: `/etc/getsendmail/${mail_seq}`,
    method: 'get',
  }),
  deleteMail: data => request({
    url: '/etc/sendmail',
    method: 'delete',
    data,
  }),
  sendMail: mail_seq => request({
    url: `/etc/sendmail/${mail_seq}`,
    method: 'get',
  }),
  createSendMail: sendemail => request({
    url: '/etc/upload_mail',
    method: 'post',
    data: sendemail,
  }),
  uploadMailFile: (group_seq, mail_seq, data, progress_callback, cancel_source) => request({
    url: `/etc/${group_seq}/${mail_seq}/file`,
    method: 'post',
    data,
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: progress_callback,
    timeout: 0,
    cancelToken: cancel_source.token,
  }),

  uploadEditorImage: (contentid, data) => request({
    url: `/etc/editorimage2/${contentid}`,
    method: 'put',
    data,
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 0,
  }),
  uploadEditorFile: (content_id, data) => request({
    url: `/etc/editor/file/${content_id}`,
    method: 'put',
    data,
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 0,
  }),
  checkEditorImages: (contentid, arrImages) => request({
    url: '/etc/checkeditorimage',
    method: 'post',
    data: {
      contentid,
      arrImages,
    },
  }),
  deletecontentdirectory: contentid => request({
    url: '/etc/deletecontentdirectory',
    method: 'post',
    data: {
      contentid,
    },
  }),
  createContactUs: contact_us_info => request({
    url: '/etc/contact_us',
    method: 'post',
    data: contact_us_info,
  }),
};
