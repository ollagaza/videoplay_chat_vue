import request from '../utils/request';

export default {
  getContentId: () => request({
    url: '/edit/newcontentid',
    method: 'post',
  }),
  uploadEditorImage: (contentid, data) => request({
    url: `/edit/editorimage/${contentid}`,
    method: 'put',
    data,
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 0,
  }),
  checkEditorImages: (contentid, arrImages) => request({
    url: '/edit/checkeditorimage',
    method: 'post',
    data: {
      contentid,
      arrImages,
    },
  }),
  deletecontentdirectory: contentid => request({
    url: '/edit/deletecontentdirectory',
    method: 'post',
    data: {
      contentid,
    },
  }),
  createContactUs: contact_us_info => request({
    url: '/edit/contact_us',
    method: 'post',
    data: contact_us_info,
  }),
}
